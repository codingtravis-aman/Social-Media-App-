import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Make sure we have a session secret
  const sessionSecret = process.env.SESSION_SECRET || "socialconnect-secret-key";
  console.log("Session configuration:", {
    secret: sessionSecret ? "✓ (secret is set)" : "❌ (using default)",
    store: storage.sessionStore ? "✓ (session store configured)" : "❌ (no session store)",
  });
  
  const sessionSettings: session.SessionOptions = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      sameSite: 'lax'
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const user = await storage.getUserByUsername(username);
      if (!user || !(await comparePasswords(password, user.password))) {
        return done(null, false);
      } else {
        return done(null, user);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      // Log the request body to debug
      console.log("Register request body:", req.body);
      
      // Check if username is provided
      if (!req.body.username) {
        return res.status(400).send("Username is required");
      }
      
      // Check if password is provided
      if (!req.body.password) {
        return res.status(400).send("Password is required");
      }
      
      // Check if name is provided
      if (!req.body.name) {
        return res.status(400).send("Name is required");
      }
      
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).send("Username already exists");
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Registration error:", error);
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    console.log("Login attempt for:", req.body.username);
    
    passport.authenticate("local", (err: any, user: SelectUser | false, info: any) => {
      if (err) {
        console.error("Login error:", err);
        return next(err);
      }
      
      if (!user) {
        console.log("Login failed: Invalid credentials for", req.body.username);
        return res.status(401).send("Invalid username or password");
      }
      
      console.log("User authenticated, creating session for:", user.username);
      
      req.login(user, (loginErr) => {
        if (loginErr) {
          console.error("Session creation error:", loginErr);
          return next(loginErr);
        }
        
        console.log("Login successful, session created. User:", user.username, "Session ID:", req.sessionID);
        
        // Remove password from response
        const { password, ...userWithoutPassword } = user as SelectUser;
        return res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    console.log("GET /api/user - isAuthenticated:", req.isAuthenticated());
    
    if (!req.isAuthenticated()) {
      console.log("User not authenticated");
      return res.sendStatus(401);
    }
    
    // Add debugging info
    console.log("User authenticated:", req.user ? "User found" : "No user object");
    
    // Remove password from response
    const { password, ...userWithoutPassword } = req.user as SelectUser;
    res.json(userWithoutPassword);
  });
  
  // Debug endpoint to check session
  app.get("/api/debug/session", (req, res) => {
    const sessionInfo = {
      id: req.sessionID,
      isAuthenticated: req.isAuthenticated(),
      hasUser: !!req.user,
      cookieExists: !!req.headers.cookie?.includes('connect.sid')
    };
    
    console.log("Session debug info:", sessionInfo);
    res.json(sessionInfo);
  });

  // Friend requests
  app.post("/api/friends/request", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const { addresseeId } = req.body;
      const requesterId = (req.user as SelectUser).id;
      
      if (requesterId === addresseeId) {
        return res.status(400).send("You cannot send a friend request to yourself");
      }
      
      const existingFriendship = await storage.getFriendshipByUsers(requesterId, addresseeId);
      if (existingFriendship) {
        return res.status(400).send("Friend request already exists");
      }
      
      const friendship = await storage.createFriendship({
        requesterId,
        addresseeId,
        status: "pending"
      });
      
      // Create notification for the addressee
      await storage.createNotification({
        userId: addresseeId,
        senderId: requesterId,
        type: "friend_request",
        content: "sent you a friend request",
        referenceId: friendship.id
      });
      
      res.status(201).json(friendship);
    } catch (error) {
      next(error);
    }
  });
  
  app.put("/api/friends/:id/accept", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const friendshipId = parseInt(req.params.id);
      const userId = (req.user as SelectUser).id;
      
      const friendship = await storage.getFriendshipById(friendshipId);
      if (!friendship) {
        return res.status(404).send("Friend request not found");
      }
      
      if (friendship.addresseeId !== userId) {
        return res.status(403).send("You cannot accept this friend request");
      }
      
      if (friendship.status !== "pending") {
        return res.status(400).send("Friend request is not pending");
      }
      
      const updatedFriendship = await storage.updateFriendship(friendshipId, "accepted");
      
      // Create notification for the requester
      await storage.createNotification({
        userId: friendship.requesterId,
        senderId: userId,
        type: "friend_accepted",
        content: "accepted your friend request",
        referenceId: friendshipId
      });
      
      res.json(updatedFriendship);
    } catch (error) {
      next(error);
    }
  });
  
  app.put("/api/friends/:id/reject", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const friendshipId = parseInt(req.params.id);
      const userId = (req.user as SelectUser).id;
      
      const friendship = await storage.getFriendshipById(friendshipId);
      if (!friendship) {
        return res.status(404).send("Friend request not found");
      }
      
      if (friendship.addresseeId !== userId) {
        return res.status(403).send("You cannot reject this friend request");
      }
      
      const updatedFriendship = await storage.updateFriendship(friendshipId, "rejected");
      res.json(updatedFriendship);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/friends", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const userId = (req.user as SelectUser).id;
      const friends = await storage.getUserFriends(userId);
      
      // Remove passwords from response
      const friendsWithoutPasswords = friends.map(friend => {
        const { password, ...friendWithoutPassword } = friend;
        return friendWithoutPassword;
      });
      
      res.json(friendsWithoutPasswords);
    } catch (error) {
      next(error);
    }
  });
}
