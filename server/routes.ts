import type { Express, Request } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { addDays, addHours } from "date-fns";
import { User } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage_config = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `profile-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ 
  storage: storage_config,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  }
});

// Sample reel videos for seeding
const SAMPLE_VIDEOS = [
  {
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnailUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg",
    title: "Big Buck Bunny - Animation Short"
  },
  {
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    thumbnailUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg",
    title: "Elephant Dreams - Artistic Animation"
  },
  {
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnailUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg",
    title: "For Bigger Blazes - Gaming"
  },
  {
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    thumbnailUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg",
    title: "For Bigger Escapes - Adventure"
  },
  {
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    thumbnailUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerFun.jpg",
    title: "For Bigger Fun - Entertainment"
  },
  {
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    thumbnailUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerJoyrides.jpg",
    title: "For Bigger Joyrides - Travel"
  }
];

export async function registerRoutes(app: Express): Promise<Server> {
  // Sets up /api/register, /api/login, /api/logout, /api/user, and friend routes
  setupAuth(app);

  // Posts routes
  app.post("/api/posts", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const userId = (req.user as User).id;
      const post = await storage.createPost({
        ...req.body,
        userId
      });
      res.status(201).json(post);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/posts", async (req, res, next) => {
    try {
      const posts = await storage.getPosts();
      
      // Get all users to enrich posts with user info
      const allUsers = Array.from((storage as any).users.values());
      const usersMap = new Map(allUsers.map(user => [user.id, user]));
      
      // Add user data to each post
      const enrichedPosts = posts.map(post => {
        const user = usersMap.get(post.userId);
        const { password, ...userWithoutPassword } = user;
        return {
          ...post,
          user: userWithoutPassword
        };
      });
      
      res.json(enrichedPosts);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/posts/:id", async (req, res, next) => {
    try {
      const post = await storage.getPostById(parseInt(req.params.id));
      if (!post) {
        return res.status(404).send("Post not found");
      }
      
      // Get user to enrich post with user info
      const user = await storage.getUser(post.userId);
      if (user) {
        const { password, ...userWithoutPassword } = user;
        res.json({
          ...post,
          user: userWithoutPassword
        });
      } else {
        res.json(post);
      }
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/users/:id/posts", async (req, res, next) => {
    try {
      const posts = await storage.getPostsByUserId(parseInt(req.params.id));
      
      // Get user to enrich posts with user info
      const user = await storage.getUser(parseInt(req.params.id));
      if (user) {
        const { password, ...userWithoutPassword } = user;
        
        const enrichedPosts = posts.map(post => ({
          ...post,
          user: userWithoutPassword
        }));
        
        res.json(enrichedPosts);
      } else {
        res.json(posts);
      }
    } catch (error) {
      next(error);
    }
  });

  // Comments routes
  app.post("/api/comments", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const userId = (req.user as User).id;
      const comment = await storage.createComment({
        ...req.body,
        userId
      });
      
      // Create notification for post owner
      const post = await storage.getPostById(comment.postId);
      if (post && post.userId !== userId) {
        await storage.createNotification({
          userId: post.userId,
          senderId: userId,
          type: "comment",
          content: "commented on your post",
          referenceId: post.id
        });
      }
      
      // Get user to enrich comment with user info
      const user = await storage.getUser(userId);
      if (user) {
        const { password, ...userWithoutPassword } = user;
        res.status(201).json({
          ...comment,
          user: userWithoutPassword
        });
      } else {
        res.status(201).json(comment);
      }
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/posts/:id/comments", async (req, res, next) => {
    try {
      const postId = parseInt(req.params.id);
      const comments = await storage.getCommentsByPostId(postId);
      
      // Get all users to enrich comments with user info
      const allUsers = Array.from((storage as any).users.values());
      const usersMap = new Map(allUsers.map(user => [user.id, user]));
      
      // Add user data to each comment
      const enrichedComments = comments.map(comment => {
        const user = usersMap.get(comment.userId);
        const { password, ...userWithoutPassword } = user;
        return {
          ...comment,
          user: userWithoutPassword
        };
      });
      
      res.json(enrichedComments);
    } catch (error) {
      next(error);
    }
  });

  // Likes routes
  app.post("/api/likes", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const userId = (req.user as User).id;
      const { postId } = req.body;
      
      // Check if user already liked the post
      const existingLike = await storage.getLikeByUserAndPost(userId, postId);
      if (existingLike) {
        return res.status(400).send("You already liked this post");
      }
      
      const like = await storage.createLike({
        postId,
        userId
      });
      
      // Create notification for post owner
      const post = await storage.getPostById(postId);
      if (post && post.userId !== userId) {
        await storage.createNotification({
          userId: post.userId,
          senderId: userId,
          type: "like",
          content: "liked your post",
          referenceId: postId
        });
      }
      
      res.status(201).json(like);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/likes/:postId", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const userId = (req.user as User).id;
      const postId = parseInt(req.params.postId);
      
      const deleted = await storage.deleteLike(userId, postId);
      if (!deleted) {
        return res.status(404).send("Like not found");
      }
      
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/posts/:id/likes", async (req, res, next) => {
    try {
      const postId = parseInt(req.params.id);
      const likes = await storage.getLikesByPostId(postId);
      
      // Get count
      const count = likes.length;
      
      // Get all users who liked the post
      const userIds = likes.map(like => like.userId);
      const usersWhoLiked = [];
      
      for (const userId of userIds) {
        const user = await storage.getUser(userId);
        if (user) {
          const { password, ...userWithoutPassword } = user;
          usersWhoLiked.push(userWithoutPassword);
        }
      }
      
      res.json({
        count,
        users: usersWhoLiked
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Post Save routes
  app.post("/api/post-saves", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const userId = (req.user as User).id;
      const { postId } = req.body;
      
      // Check if user already saved the post
      const existingSave = await storage.getPostSaveByUserAndPost(userId, postId);
      if (existingSave) {
        return res.status(400).send("You already saved this post");
      }
      
      const save = await storage.createPostSave({
        postId,
        userId
      });
      
      // Create notification for post owner if wanted
      // Commented out as saving is typically a personal action
      // const post = await storage.getPostById(postId);
      // if (post && post.userId !== userId) {
      //   await storage.createNotification({
      //     userId: post.userId,
      //     senderId: userId,
      //     type: "save",
      //     content: "saved your post",
      //     referenceId: postId
      //   });
      // }
      
      res.status(201).json(save);
    } catch (error) {
      next(error);
    }
  });
  
  app.delete("/api/post-saves/:postId", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const userId = (req.user as User).id;
      const postId = parseInt(req.params.postId);
      
      const deleted = await storage.deletePostSave(userId, postId);
      if (!deleted) {
        return res.status(404).send("Save not found");
      }
      
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/saved-posts", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const userId = (req.user as User).id;
      const savedPosts = await storage.getPostSavesByUserId(userId);
      
      // Get the actual post data for each saved post
      const enrichedSavedPosts = await Promise.all(
        savedPosts.map(async save => {
          const post = await storage.getPostById(save.postId);
          if (post) {
            const postOwner = await storage.getUser(post.userId);
            if (postOwner) {
              const { password, ...postOwnerWithoutPassword } = postOwner;
              return {
                ...save,
                post: {
                  ...post,
                  user: postOwnerWithoutPassword
                }
              };
            }
            return { ...save, post };
          }
          return save;
        })
      );
      
      res.json(enrichedSavedPosts);
    } catch (error) {
      next(error);
    }
  });
  
  // Collections routes
  app.post("/api/collections", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const userId = (req.user as User).id;
      const collection = await storage.createCollection({
        ...req.body,
        userId
      });
      
      res.status(201).json(collection);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/collections", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const userId = (req.user as User).id;
      const collections = await storage.getCollectionsByUserId(userId);
      res.json(collections);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/collections/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const collectionId = parseInt(req.params.id);
      const collection = await storage.getCollectionById(collectionId);
      
      if (!collection) {
        return res.status(404).send("Collection not found");
      }
      
      // Check if the collection belongs to the user
      const userId = (req.user as User).id;
      if (collection.userId !== userId) {
        return res.status(403).send("Unauthorized access to collection");
      }
      
      // Get items in the collection
      const collectionItems = await storage.getCollectionItems(collectionId);
      
      // Get post data for each item
      const enrichedItems = await Promise.all(
        collectionItems.map(async item => {
          // Get the post save
          const postSave = await storage.getPostSaveByUserAndPost(userId, item.postSaveId);
          
          // Get the actual post
          if (postSave) {
            const post = await storage.getPostById(postSave.postId);
            if (post) {
              const postOwner = await storage.getUser(post.userId);
              if (postOwner) {
                const { password, ...postOwnerWithoutPassword } = postOwner;
                return {
                  ...item,
                  post: {
                    ...post,
                    user: postOwnerWithoutPassword
                  }
                };
              }
              return { ...item, post };
            }
          }
          return item;
        })
      );
      
      res.json({
        ...collection,
        items: enrichedItems
      });
    } catch (error) {
      next(error);
    }
  });
  
  app.put("/api/collections/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const userId = (req.user as User).id;
      const collectionId = parseInt(req.params.id);
      
      // Verify collection exists and belongs to user
      const collection = await storage.getCollectionById(collectionId);
      if (!collection) {
        return res.status(404).send("Collection not found");
      }
      
      if (collection.userId !== userId) {
        return res.status(403).send("Unauthorized to update this collection");
      }
      
      const updatedCollection = await storage.updateCollection(collectionId, req.body);
      res.json(updatedCollection);
    } catch (error) {
      next(error);
    }
  });
  
  app.delete("/api/collections/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const userId = (req.user as User).id;
      const collectionId = parseInt(req.params.id);
      
      // Verify collection exists and belongs to user
      const collection = await storage.getCollectionById(collectionId);
      if (!collection) {
        return res.status(404).send("Collection not found");
      }
      
      if (collection.userId !== userId) {
        return res.status(403).send("Unauthorized to delete this collection");
      }
      
      // Don't allow deleting the default collection
      if (collection.isDefault) {
        return res.status(400).send("Cannot delete the default collection");
      }
      
      const deleted = await storage.deleteCollection(collectionId);
      if (deleted) {
        res.sendStatus(204);
      } else {
        res.status(500).send("Failed to delete collection");
      }
    } catch (error) {
      next(error);
    }
  });
  
  // Collection Items routes
  app.post("/api/collections/:id/items", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const userId = (req.user as User).id;
      const collectionId = parseInt(req.params.id);
      const { postId } = req.body;
      
      // Verify collection exists and belongs to user
      const collection = await storage.getCollectionById(collectionId);
      if (!collection) {
        return res.status(404).send("Collection not found");
      }
      
      if (collection.userId !== userId) {
        return res.status(403).send("Unauthorized to update this collection");
      }
      
      // Find the post save or create it if it doesn't exist
      let postSave = await storage.getPostSaveByUserAndPost(userId, postId);
      if (!postSave) {
        postSave = await storage.createPostSave({ userId, postId });
      }
      
      // Add to collection
      const item = await storage.addPostToCollection(collectionId, postSave.id);
      res.status(201).json(item);
    } catch (error) {
      next(error);
    }
  });
  
  app.delete("/api/collections/:collectionId/items/:postId", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const userId = (req.user as User).id;
      const collectionId = parseInt(req.params.collectionId);
      const postId = parseInt(req.params.postId);
      
      // Verify collection exists and belongs to user
      const collection = await storage.getCollectionById(collectionId);
      if (!collection) {
        return res.status(404).send("Collection not found");
      }
      
      if (collection.userId !== userId) {
        return res.status(403).send("Unauthorized to update this collection");
      }
      
      // Find the post save
      const postSave = await storage.getPostSaveByUserAndPost(userId, postId);
      if (!postSave) {
        return res.status(404).send("Post save not found");
      }
      
      // Remove from collection
      const removed = await storage.removePostFromCollection(collectionId, postSave.id);
      if (removed) {
        res.sendStatus(204);
      } else {
        res.status(404).send("Item not found in collection");
      }
    } catch (error) {
      next(error);
    }
  });
  
  // Repost route
  app.post("/api/posts/repost", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const userId = (req.user as User).id;
      const { originalPostId, content } = req.body;
      
      const repost = await storage.repostPost(userId, originalPostId, content);
      
      // Fetch post owner and original post owner
      const user = await storage.getUser(userId);
      const originalPost = await storage.getPostById(originalPostId);
      
      if (user && originalPost) {
        const { password: _, ...userWithoutPassword } = user;
        
        // Create notification for original post owner
        if (originalPost.userId !== userId) {
          await storage.createNotification({
            userId: originalPost.userId,
            senderId: userId,
            type: "repost",
            content: "reposted your post",
            referenceId: originalPostId
          });
        }
        
        // Get original post owner info
        const originalPostOwner = await storage.getUser(originalPost.userId);
        let enrichedOriginalPost = originalPost;
        
        if (originalPostOwner) {
          const { password: __, ...originalOwnerWithoutPassword } = originalPostOwner;
          enrichedOriginalPost = {
            ...originalPost,
            user: originalOwnerWithoutPassword
          };
        }
        
        res.status(201).json({
          ...repost,
          user: userWithoutPassword,
          originalPost: enrichedOriginalPost
        });
      } else {
        res.status(201).json(repost);
      }
    } catch (error) {
      next(error);
    }
  });

  // Notifications routes
  app.get("/api/notifications", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const userId = (req.user as User).id;
      const notifications = await storage.getNotificationsByUserId(userId);
      
      // Get senders to enrich notifications
      const enrichedNotifications = await Promise.all(
        notifications.map(async notification => {
          if (notification.senderId) {
            const sender = await storage.getUser(notification.senderId);
            if (sender) {
              const { password, ...senderWithoutPassword } = sender;
              return {
                ...notification,
                sender: senderWithoutPassword
              };
            }
          }
          return notification;
        })
      );
      
      res.json(enrichedNotifications);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/notifications/:id/read", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const notificationId = parseInt(req.params.id);
      const updatedNotification = await storage.markNotificationAsRead(notificationId);
      
      if (!updatedNotification) {
        return res.status(404).send("Notification not found");
      }
      
      res.json(updatedNotification);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/notifications/read-all", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const userId = (req.user as User).id;
      await storage.markAllNotificationsAsRead(userId);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  });

  // Stories routes
  app.post("/api/stories", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const userId = (req.user as User).id;
      
      // Story expires in 24 hours
      const expiresAt = addHours(new Date(), 24);
      
      const story = await storage.createStory({
        ...req.body,
        userId,
        expiresAt
      });
      
      res.status(201).json(story);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/stories", async (req, res, next) => {
    try {
      const stories = await storage.getActiveStories();
      
      // Group stories by user
      const storiesByUser = new Map();
      
      for (const story of stories) {
        const user = await storage.getUser(story.userId);
        if (!user) continue;
        
        const { password, ...userWithoutPassword } = user;
        
        if (!storiesByUser.has(user.id)) {
          storiesByUser.set(user.id, {
            user: userWithoutPassword,
            stories: []
          });
        }
        
        storiesByUser.get(user.id).stories.push(story);
      }
      
      res.json(Array.from(storiesByUser.values()));
    } catch (error) {
      next(error);
    }
  });

  // Reels routes
  app.post("/api/reels", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const userId = (req.user as User).id;
      const reel = await storage.createReel({
        ...req.body,
        userId
      });
      
      res.status(201).json(reel);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/reels", async (req, res, next) => {
    try {
      const reels = await storage.getReels();
      
      // Get all users to enrich reels with user info
      const allUsers = Array.from((storage as any).users.values());
      const usersMap = new Map(allUsers.map(user => [user.id, user]));
      
      // Add user data to each reel
      const enrichedReels = reels.map(reel => {
        const user = usersMap.get(reel.userId);
        const { password, ...userWithoutPassword } = user;
        return {
          ...reel,
          user: userWithoutPassword
        };
      });
      
      res.json(enrichedReels);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/reels/:id", async (req, res, next) => {
    try {
      const reelId = parseInt(req.params.id);
      const reel = await storage.getReelById(reelId);
      
      if (!reel) {
        return res.status(404).send("Reel not found");
      }
      
      // Get user to enrich reel with user info
      const user = await storage.getUser(reel.userId);
      if (user) {
        const { password, ...userWithoutPassword } = user;
        res.json({
          ...reel,
          user: userWithoutPassword
        });
      } else {
        res.json(reel);
      }
    } catch (error) {
      next(error);
    }
  });
  
  // Reel comments routes
  app.post("/api/reel-comments", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const userId = (req.user as User).id;
      const comment = await storage.createReelComment({
        ...req.body,
        userId
      });
      
      // Create notification for reel owner
      const reel = await storage.getReelById(comment.reelId);
      if (reel && reel.userId !== userId) {
        await storage.createNotification({
          userId: reel.userId,
          senderId: userId,
          type: "reel_comment",
          content: "commented on your reel",
          referenceId: reel.id
        });
      }
      
      // Get user to enrich comment with user info
      const user = await storage.getUser(userId);
      if (user) {
        const { password, ...userWithoutPassword } = user;
        res.status(201).json({
          ...comment,
          user: userWithoutPassword
        });
      } else {
        res.status(201).json(comment);
      }
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/reels/:id/comments", async (req, res, next) => {
    try {
      const reelId = parseInt(req.params.id);
      const comments = await storage.getReelCommentsByReelId(reelId);
      
      // Get all users to enrich comments with user info
      const allUsers = Array.from((storage as any).users.values());
      const usersMap = new Map(allUsers.map(user => [user.id, user]));
      
      // Add user data to each comment
      const enrichedComments = comments.map(comment => {
        const user = usersMap.get(comment.userId);
        const { password, ...userWithoutPassword } = user;
        return {
          ...comment,
          user: userWithoutPassword
        };
      });
      
      res.json(enrichedComments);
    } catch (error) {
      next(error);
    }
  });
  
  app.delete("/api/reel-comments/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const userId = (req.user as User).id;
      const commentId = parseInt(req.params.id);
      
      // First, get all comments for all reels and find the one we want
      const allReels = await storage.getReels();
      let comment;
      
      for (const reel of allReels) {
        const comments = await storage.getReelCommentsByReelId(reel.id);
        const foundComment = comments.find(c => c.id === commentId);
        if (foundComment) {
          comment = foundComment;
          break;
        }
      }
      
      if (!comment) {
        return res.status(404).send("Comment not found");
      }
      
      if (comment.userId !== userId) {
        // Check if user owns the reel
        const reel = await storage.getReelById(comment.reelId);
        if (!reel || reel.userId !== userId) {
          return res.status(403).send("You can only delete your own comments or comments on your reels");
        }
      }
      
      const deleted = await storage.deleteReelComment(commentId);
      if (!deleted) {
        return res.status(404).send("Comment not found");
      }
      
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  });
  
  // Reel likes routes
  app.post("/api/reel-likes", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const userId = (req.user as User).id;
      const { reelId } = req.body;
      
      // Check if user already liked the reel
      const existingLike = await storage.getReelLikeByUserAndReel(userId, reelId);
      if (existingLike) {
        return res.status(400).send("You already liked this reel");
      }
      
      const like = await storage.createReelLike({
        reelId,
        userId
      });
      
      // Create notification for reel owner
      const reel = await storage.getReelById(reelId);
      if (reel && reel.userId !== userId) {
        await storage.createNotification({
          userId: reel.userId,
          senderId: userId,
          type: "reel_like",
          content: "liked your reel",
          referenceId: reelId
        });
      }
      
      res.status(201).json(like);
    } catch (error) {
      next(error);
    }
  });
  
  app.delete("/api/reel-likes/:reelId", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const userId = (req.user as User).id;
      const reelId = parseInt(req.params.reelId);
      
      const deleted = await storage.deleteReelLike(userId, reelId);
      if (!deleted) {
        return res.status(404).send("Like not found");
      }
      
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/reels/:id/likes", async (req, res, next) => {
    try {
      const reelId = parseInt(req.params.id);
      const likes = await storage.getReelLikesByReelId(reelId);
      
      // Get count
      const count = likes.length;
      
      // Get all users who liked the reel
      const userIds = likes.map(like => like.userId);
      const usersWhoLiked = [];
      
      for (const userId of userIds) {
        const user = await storage.getUser(userId);
        if (user) {
          const { password, ...userWithoutPassword } = user;
          usersWhoLiked.push(userWithoutPassword);
        }
      }
      
      res.json({
        count,
        users: usersWhoLiked
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Reel saves routes
  app.post("/api/reel-saves", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const userId = (req.user as User).id;
      const { reelId } = req.body;
      
      // Check if user already saved the reel
      const existingSave = await storage.getReelSaveByUserAndReel(userId, reelId);
      if (existingSave) {
        return res.status(400).send("You already saved this reel");
      }
      
      const save = await storage.createReelSave({
        reelId,
        userId
      });
      
      res.status(201).json(save);
    } catch (error) {
      next(error);
    }
  });
  
  app.delete("/api/reel-saves/:reelId", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const userId = (req.user as User).id;
      const reelId = parseInt(req.params.reelId);
      
      const deleted = await storage.deleteReelSave(userId, reelId);
      if (!deleted) {
        return res.status(404).send("Save not found");
      }
      
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/reel-saves", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const userId = (req.user as User).id;
      const saves = await storage.getReelSavesByUserId(userId);
      
      // Get the reels
      const reelIds = saves.map(save => save.reelId);
      const savedReels = [];
      
      for (const reelId of reelIds) {
        const reel = await storage.getReelById(reelId);
        if (reel) {
          // Add user info
          const user = await storage.getUser(reel.userId);
          if (user) {
            const { password, ...userWithoutPassword } = user;
            savedReels.push({
              ...reel,
              user: userWithoutPassword
            });
          } else {
            savedReels.push(reel);
          }
        }
      }
      
      res.json(savedReels);
    } catch (error) {
      next(error);
    }
  });
  
  // Reel views routes
  app.post("/api/reel-views", async (req, res, next) => {
    try {
      const { reelId, userId } = req.body;
      
      const view = await storage.createReelView({
        reelId,
        userId: userId || null
      });
      
      res.status(201).json(view);
    } catch (error) {
      next(error);
    }
  });

  // User endpoints
  app.get("/api/users", async (req, res, next) => {
    try {
      // Get all users (in a real app, this would be paginated)
      const allUsers = Array.from((storage as any).users.values());
      
      // Remove sensitive information
      const usersWithoutPassword = allUsers.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json(usersWithoutPassword);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/users/:id", async (req, res, next) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).send("User not found");
      }
      
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      next(error);
    }
  });
  
  // Friends endpoints
  app.get("/api/friends", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const userId = (req.user as User).id;
      const friends = await storage.getUserFriends(userId);
      
      // Remove sensitive information
      const friendsWithoutPassword = friends.map(friend => {
        const { password, ...friendWithoutPassword } = friend;
        return friendWithoutPassword;
      });
      
      res.json(friendsWithoutPassword);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/friends/request", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const requesterId = (req.user as User).id;
      const { addresseeId } = req.body;
      
      // Check if addressee exists
      const addressee = await storage.getUser(addresseeId);
      if (!addressee) {
        return res.status(404).send("User not found");
      }
      
      // Check if friendship already exists
      const existingFriendship = await storage.getFriendshipByUsers(requesterId, addresseeId);
      if (existingFriendship) {
        return res.status(400).send("Friendship request already exists");
      }
      
      const friendship = await storage.createFriendship({
        requesterId,
        addresseeId,
        status: "pending"
      });
      
      // Create notification for addressee
      await storage.createNotification({
        userId: addresseeId,
        senderId: requesterId,
        type: "friend_request",
        content: "sent you a friend request",
        referenceId: requesterId
      });
      
      res.status(201).json(friendship);
    } catch (error) {
      next(error);
    }
  });
  
  app.put("/api/friends/:id/accept", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const userId = (req.user as User).id;
      const friendshipId = parseInt(req.params.id);
      
      // Get the friendship
      const friendship = await storage.getFriendshipById(friendshipId);
      if (!friendship) {
        return res.status(404).send("Friendship request not found");
      }
      
      // Check if user is the addressee
      if (friendship.addresseeId !== userId) {
        return res.status(403).send("You can only accept requests sent to you");
      }
      
      // Check if friendship is pending
      if (friendship.status !== "pending") {
        return res.status(400).send("This request has already been processed");
      }
      
      // Update friendship status
      const updatedFriendship = await storage.updateFriendship(friendshipId, "accepted");
      
      // Create notification for requester
      await storage.createNotification({
        userId: friendship.requesterId,
        senderId: userId,
        type: "friend_accepted",
        content: "accepted your friend request",
        referenceId: userId
      });
      
      res.json(updatedFriendship);
    } catch (error) {
      next(error);
    }
  });
  
  app.put("/api/friends/:id/reject", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const userId = (req.user as User).id;
      const friendshipId = parseInt(req.params.id);
      
      // Get the friendship
      const friendship = await storage.getFriendshipById(friendshipId);
      if (!friendship) {
        return res.status(404).send("Friendship request not found");
      }
      
      // Check if user is the addressee
      if (friendship.addresseeId !== userId) {
        return res.status(403).send("You can only reject requests sent to you");
      }
      
      // Check if friendship is pending
      if (friendship.status !== "pending") {
        return res.status(400).send("This request has already been processed");
      }
      
      // Update friendship status
      const updatedFriendship = await storage.updateFriendship(friendshipId, "rejected");
      
      res.json(updatedFriendship);
    } catch (error) {
      next(error);
    }
  });
  
  // Messages routes
  app.post("/api/messages", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const senderId = (req.user as User).id;
      const { receiverId, content } = req.body;
      
      // Check if receiver exists
      const receiver = await storage.getUser(receiverId);
      if (!receiver) {
        return res.status(404).send("Receiver not found");
      }
      
      const message = await storage.createMessage({
        senderId,
        receiverId,
        content
      });
      
      // Create notification for message receiver
      await storage.createNotification({
        userId: receiverId,
        senderId,
        type: "message",
        content: "sent you a message",
        referenceId: senderId
      });
      
      res.status(201).json(message);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/messages", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const userId = (req.user as User).id;
      const messages = await storage.getMessagesByUserId(userId);
      
      // Get all users to enrich messages with user info
      const allUsers = Array.from((storage as any).users.values());
      const usersMap = new Map(allUsers.map(user => [user.id, user]));
      
      // Group messages by conversation
      const conversations = new Map();
      
      for (const message of messages) {
        const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
        const otherUser = usersMap.get(otherUserId);
        
        if (!otherUser) continue;
        
        const { password, ...userWithoutPassword } = otherUser;
        
        if (!conversations.has(otherUserId)) {
          conversations.set(otherUserId, {
            user: userWithoutPassword,
            lastMessage: message
          });
        } else {
          const existing = conversations.get(otherUserId);
          if (new Date(message.createdAt) > new Date(existing.lastMessage.createdAt)) {
            existing.lastMessage = message;
          }
        }
      }
      
      res.json(Array.from(conversations.values()));
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/messages/:userId", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const currentUserId = (req.user as User).id;
      const otherUserId = parseInt(req.params.userId);
      
      // Check if other user exists
      const otherUser = await storage.getUser(otherUserId);
      if (!otherUser) {
        return res.status(404).send("User not found");
      }
      
      const conversation = await storage.getConversation(currentUserId, otherUserId);
      
      // Mark messages as read
      for (const message of conversation) {
        if (message.receiverId === currentUserId && !message.read) {
          // If this was a real implementation, we would update the message here
          // For now, we'll just pretend it's marked as read
        }
      }
      
      res.json(conversation);
    } catch (error) {
      next(error);
    }
  });
  
  // Groups routes
  app.post("/api/groups", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const creatorId = (req.user as User).id;
      const group = await storage.createGroup({
        ...req.body,
        creatorId
      });
      
      res.status(201).json(group);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/groups", async (req, res, next) => {
    try {
      const groups = await storage.getGroups();
      
      // Get all users to enrich groups with creator info
      const allUsers = Array.from((storage as any).users.values());
      const usersMap = new Map(allUsers.map(user => [user.id, user]));
      
      // Add creator data to each group
      const enrichedGroups = groups.map(group => {
        const creator = usersMap.get(group.creatorId);
        if (creator) {
          const { password, ...creatorWithoutPassword } = creator;
          return {
            ...group,
            creator: creatorWithoutPassword
          };
        }
        return group;
      });
      
      res.json(enrichedGroups);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/groups/:id", async (req, res, next) => {
    try {
      const groupId = parseInt(req.params.id);
      const group = await storage.getGroupById(groupId);
      
      if (!group) {
        return res.status(404).send("Group not found");
      }
      
      // Get creator info
      const creator = await storage.getUser(group.creatorId);
      if (creator) {
        const { password, ...creatorWithoutPassword } = creator;
        
        // Get members
        const members = await storage.getGroupMembers(groupId);
        const enrichedMembers = [];
        
        for (const member of members) {
          const user = await storage.getUser(member.userId);
          if (user) {
            const { password, ...userWithoutPassword } = user;
            enrichedMembers.push({
              ...member,
              user: userWithoutPassword
            });
          }
        }
        
        res.json({
          ...group,
          creator: creatorWithoutPassword,
          members: enrichedMembers
        });
      } else {
        res.json(group);
      }
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/groups/:id/join", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const userId = (req.user as User).id;
      const groupId = parseInt(req.params.id);
      
      // Check if group exists
      const group = await storage.getGroupById(groupId);
      if (!group) {
        return res.status(404).send("Group not found");
      }
      
      // Check if user is already a member
      const existingMember = await storage.getGroupMember(groupId, userId);
      if (existingMember) {
        return res.status(400).send("Already a member of this group");
      }
      
      // Add user as member
      const member = await storage.addGroupMember({
        groupId,
        userId,
        role: 'member'
      });
      
      // Create notification for group creator
      if (group.creatorId !== userId) {
        await storage.createNotification({
          userId: group.creatorId,
          senderId: userId,
          type: "group_join",
          content: "joined your group",
          referenceId: groupId
        });
      }
      
      res.status(201).json(member);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/groups/:id/posts", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const userId = (req.user as User).id;
      const groupId = parseInt(req.params.id);
      
      // Check if group exists
      const group = await storage.getGroupById(groupId);
      if (!group) {
        return res.status(404).send("Group not found");
      }
      
      // Check if user is a member
      const isMember = await storage.getGroupMember(groupId, userId);
      if (!isMember) {
        return res.status(403).send("You must be a member to post in this group");
      }
      
      const post = await storage.createGroupPost({
        ...req.body,
        userId,
        groupId
      });
      
      // Get user info
      const user = await storage.getUser(userId);
      if (user) {
        const { password, ...userWithoutPassword } = user;
        
        res.status(201).json({
          ...post,
          user: userWithoutPassword
        });
      } else {
        res.status(201).json(post);
      }
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/groups/:id/posts", async (req, res, next) => {
    try {
      const groupId = parseInt(req.params.id);
      
      // Check if group exists
      const group = await storage.getGroupById(groupId);
      if (!group) {
        return res.status(404).send("Group not found");
      }
      
      // Get posts
      const posts = await storage.getGroupPosts(groupId);
      
      // Get all users to enrich posts with user info
      const allUsers = Array.from((storage as any).users.values());
      const usersMap = new Map(allUsers.map(user => [user.id, user]));
      
      // Add user data to each post
      const enrichedPosts = posts.map(post => {
        const user = usersMap.get(post.userId);
        if (user) {
          const { password, ...userWithoutPassword } = user;
          return {
            ...post,
            user: userWithoutPassword
          };
        }
        return post;
      });
      
      res.json(enrichedPosts);
    } catch (error) {
      next(error);
    }
  });
  
  // Events routes
  app.post("/api/events", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const creatorId = (req.user as User).id;
      
      const event = await storage.createEvent({
        ...req.body,
        creatorId
      });
      
      res.status(201).json(event);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/events", async (req, res, next) => {
    try {
      const events = await storage.getEvents();
      
      // Get all users to enrich events with creator info
      const allUsers = Array.from((storage as any).users.values());
      const usersMap = new Map(allUsers.map(user => [user.id, user]));
      
      // Add creator data to each event
      const enrichedEvents = events.map(event => {
        const creator = usersMap.get(event.creatorId);
        if (creator) {
          const { password, ...creatorWithoutPassword } = creator;
          
          // Also add group info if it's a group event
          if (event.groupId) {
            const group = storage.getGroupById(event.groupId);
            if (group) {
              return {
                ...event,
                creator: creatorWithoutPassword,
                group
              };
            }
          }
          
          return {
            ...event,
            creator: creatorWithoutPassword
          };
        }
        return event;
      });
      
      res.json(enrichedEvents);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/events/:id", async (req, res, next) => {
    try {
      const eventId = parseInt(req.params.id);
      const event = await storage.getEventById(eventId);
      
      if (!event) {
        return res.status(404).send("Event not found");
      }
      
      // Get creator info
      const creator = await storage.getUser(event.creatorId);
      if (creator) {
        const { password, ...creatorWithoutPassword } = creator;
        
        // Also add group info if it's a group event
        if (event.groupId) {
          const group = await storage.getGroupById(event.groupId);
          if (group) {
            return res.json({
              ...event,
              creator: creatorWithoutPassword,
              group
            });
          }
        }
        
        res.json({
          ...event,
          creator: creatorWithoutPassword
        });
      } else {
        res.json(event);
      }
    } catch (error) {
      next(error);
    }
  });

  // Set up some initial data for testing (6 users, posts)
  await seedData();

  // Set up API for profile picture uploads
  app.post("/api/user/upload-profile-pic", 
    (req, res, next) => {
      if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
      next();
    },
    upload.single('profilePic'), 
    async (req, res, next) => {
      try {
        const userId = (req.user as User).id;
        const file = req.file;
        
        if (!file) {
          return res.status(400).send("No file uploaded");
        }

        // Create the file URL (relative to the server)
        const fileUrl = `/uploads/${file.filename}`;
        
        // Update the user's profile picture
        const updatedUser = await storage.updateUser(userId, {
          profilePicture: fileUrl
        });
        
        if (!updatedUser) {
          return res.status(404).send("User not found");
        }
        
        // Remove password from response
        const { password, ...userWithoutPassword } = updatedUser;
        
        res.status(200).json({ 
          message: "Profile picture updated successfully",
          user: userWithoutPassword
        });
      } catch (error) {
        next(error);
      }
    }
  );

  // Set up static file serving for uploads
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  const httpServer = createServer(app);
  
  // Set up WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Map to store connected clients by user ID
  const connectedClients = new Map<number, WebSocket>();
  
  wss.on('connection', (ws) => {
    let authenticatedUser: User | null = null;
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle authentication
        if (data.type === 'auth') {
          // In a real application, we'd verify this token
          // For now, we'll just trust it
          const userId = parseInt(data.userId);
          
          // Get the user from storage
          storage.getUser(userId).then(user => {
            if (user) {
              authenticatedUser = user;
              connectedClients.set(user.id, ws);
              
              // Send confirmation
              ws.send(JSON.stringify({
                type: 'auth_success',
                userId: user.id
              }));
            }
          });
        }
        
        // Handle real-time messaging
        if (data.type === 'message' && authenticatedUser) {
          const { receiverId, content } = data;
          
          // Create the message in storage
          storage.createMessage({
            senderId: authenticatedUser.id,
            receiverId,
            content
          }).then(message => {
            // Create notification for receiver
            storage.createNotification({
              userId: receiverId,
              senderId: authenticatedUser!.id,
              type: 'message',
              content: 'sent you a message',
              referenceId: authenticatedUser!.id
            });
            
            // If receiver is connected, send them the message
            const receiverWs = connectedClients.get(receiverId);
            if (receiverWs && receiverWs.readyState === WebSocket.OPEN) {
              // Get sender info
              storage.getUser(authenticatedUser!.id).then(sender => {
                if (sender) {
                  const { password, ...senderWithoutPassword } = sender;
                  
                  receiverWs.send(JSON.stringify({
                    type: 'new_message',
                    message: {
                      ...message,
                      sender: senderWithoutPassword
                    }
                  }));
                }
              });
            }
            
            // Send confirmation back to sender
            ws.send(JSON.stringify({
              type: 'message_sent',
              message
            }));
          });
        }
        
        // Handle notifications
        if (data.type === 'notification' && authenticatedUser) {
          const { userId, content, notificationType, referenceId } = data;
          
          // Create the notification in storage
          storage.createNotification({
            userId,
            senderId: authenticatedUser.id,
            type: notificationType,
            content,
            referenceId
          }).then(notification => {
            // If user is connected, send them the notification
            const userWs = connectedClients.get(userId);
            if (userWs && userWs.readyState === WebSocket.OPEN) {
              // Get sender info
              storage.getUser(authenticatedUser!.id).then(sender => {
                if (sender) {
                  const { password, ...senderWithoutPassword } = sender;
                  
                  userWs.send(JSON.stringify({
                    type: 'new_notification',
                    notification: {
                      ...notification,
                      sender: senderWithoutPassword
                    }
                  }));
                }
              });
            }
          });
        }
        
        // Handle mark message as read
        if (data.type === 'mark_read' && authenticatedUser) {
          const { messageId } = data;
          
          // Update message read status in storage
          storage.getMessageById(messageId).then(message => {
            if (message && message.receiverId === authenticatedUser!.id) {
              // Only allow marking messages as read if you're the receiver
              storage.markMessageAsRead(messageId).then(() => {
                // Notify the sender that their message was read
                const senderWs = connectedClients.get(message.senderId);
                if (senderWs && senderWs.readyState === WebSocket.OPEN) {
                  senderWs.send(JSON.stringify({
                    type: 'message_read',
                    messageId,
                    readBy: authenticatedUser!.id
                  }));
                }
              });
            }
          });
        }
        
        // Handle typing indicators
        if (data.type === 'typing' && authenticatedUser) {
          const { receiverId, isTyping } = data;
          
          // Send typing indicator to the receiver
          const receiverWs = connectedClients.get(receiverId);
          if (receiverWs && receiverWs.readyState === WebSocket.OPEN) {
            receiverWs.send(JSON.stringify({
              type: 'typing_indicator',
              userId: authenticatedUser.id,
              isTyping
            }));
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      if (authenticatedUser) {
        connectedClients.delete(authenticatedUser.id);
      }
    });
  });
  
  return httpServer;
}

async function seedData() {
  const defaultProfilePics = [
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  ];
  
  const names = ["John Doe", "Sarah Chen", "Alex Morgan", "Jessica Lee", "Mike Johnson", "David Kim"];
  const usernames = ["johndoe", "sarahchen", "alexmorgan", "jessicalee", "mikejohnson", "davidkim"];

  const postImages = [
    "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=675&q=80",
    "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=800&q=80",
    "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=675&q=80",
    "https://images.unsplash.com/photo-1527613426441-4da17471b66d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=675&q=80",
    "https://images.unsplash.com/photo-1540331547168-8b63109225b7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=675&q=80",
    "https://images.unsplash.com/photo-1506869640319-fe1a24fd76dc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=675&q=80",
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=675&q=80",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=675&q=80"
  ];
  
  const storyImages = [
    "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=384&q=80",
    "https://images.unsplash.com/photo-1527613426441-4da17471b66d?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=384&q=80",
    "https://images.unsplash.com/photo-1540331547168-8b63109225b7?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=384&q=80",
    "https://images.unsplash.com/photo-1506869640319-fe1a24fd76dc?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=384&q=80"
  ];
  
  const reelImages = [
    "https://images.unsplash.com/photo-1561406636-b80293969660?ixlib=rb-1.2.1&auto=format&fit=crop&w=224&h=384&q=80",
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=224&h=384&q=80",
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=224&h=384&q=80",
    "https://images.unsplash.com/photo-1511735111819-9a3f7709049c?ixlib=rb-1.2.1&auto=format&fit=crop&w=224&h=384&q=80",
    "https://images.unsplash.com/photo-1526236812939-6d185a0c7f6f?ixlib=rb-1.2.1&auto=format&fit=crop&w=224&h=384&q=80"
  ];
  
  const postContents = [
    "Just went hiking in the mountains! The views were absolutely breathtaking. Definitely worth the early morning start. Who else loves hiking? 🏔️ #naturelovers #hiking #weekendvibes",
    "Just finished reading this amazing book! Highly recommend for anyone interested in psychology and decision-making. What are you reading these days? 📚",
    "Perfect day for a beach trip! The water was crystal clear and the sunset was incredible. #beachday #summer #relaxation",
    "Trying out a new coffee shop downtown. Their cold brew is absolutely fantastic! Anyone have recommendations for other coffee spots to try? ☕",
    "Just adopted this little guy from the shelter! He's already made himself at home. #adoptdontshop #catsofinstagram #newpet",
    "Completed my first half marathon today! It was challenging but so rewarding. Thanks to everyone who supported me! #running #fitness #achievement",
    "Made this homemade pasta from scratch today. It takes time but the result is so worth it! #homecooking #pasta #foodie",
    "Weekend getaway to the mountains. Sometimes you just need to disconnect and enjoy nature. #weekendvibes #mountains #peace"
  ];

  const existingUsers = await storage.getUserByUsername("johndoe");
  if (existingUsers) return; // Data already seeded
  
  // Create users
  const users = [];
  for (let i = 0; i < 6; i++) {
    // Use crypto's scrypt for password hashing in a real application
    const hashedPassword = await new Promise<string>((resolve) => {
      const salt = "salt" + i;
      import("crypto").then(({ scrypt }) => {
        scrypt("password123", salt, 64, (err, key) => {
          resolve(`${key.toString("hex")}.${salt}`);
        });
      });
    });
    
    const user = await storage.createUser({
      username: usernames[i],
      password: hashedPassword,
      name: names[i],
      profilePicture: defaultProfilePics[i],
      bio: `Hi, I'm ${names[i]}! I love photography, traveling, and good food.`
    });
    
    users.push(user);
  }
  
  // Create posts
  for (let i = 0; i < 8; i++) {
    const randomUserIndex = Math.floor(Math.random() * users.length);
    const userId = users[randomUserIndex].id;
    
    await storage.createPost({
      userId,
      content: postContents[i],
      image: postImages[i]
    });
  }
  
  // Create some comments
  const posts = await storage.getPosts();
  for (const post of posts) {
    // Add 1-3 random comments to each post
    const commentCount = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < commentCount; i++) {
      const randomUserIndex = Math.floor(Math.random() * users.length);
      const userId = users[randomUserIndex].id;
      
      if (userId !== post.userId) { // Don't comment on your own post
        const commentTexts = [
          "This is amazing! 😍",
          "Great post! Thanks for sharing.",
          "I love this! Looking forward to more content like this.",
          "Wow, this is impressive!",
          "Looks fantastic! 👏",
          "I've been wanting to try this too!",
          "This made my day, thank you!",
          "Incredible photo! What camera do you use?"
        ];
        
        const randomCommentIndex = Math.floor(Math.random() * commentTexts.length);
        
        await storage.createComment({
          postId: post.id,
          userId,
          content: commentTexts[randomCommentIndex]
        });
      }
    }
    
    // Add some likes
    const likeCount = Math.floor(Math.random() * 5) + 5; // 5-10 likes per post
    const likedUserIds = new Set<number>();
    
    for (let i = 0; i < likeCount; i++) {
      const randomUserIndex = Math.floor(Math.random() * users.length);
      const userId = users[randomUserIndex].id;
      
      if (!likedUserIds.has(userId)) {
        likedUserIds.add(userId);
        
        await storage.createLike({
          postId: post.id,
          userId
        });
      }
    }
  }
  
  // Create some friendships
  // Make user[0] friends with users[1], users[2]
  await storage.createFriendship({
    requesterId: users[0].id,
    addresseeId: users[1].id,
    status: "accepted"
  });
  
  await storage.createFriendship({
    requesterId: users[0].id,
    addresseeId: users[2].id,
    status: "accepted"
  });
  
  // Make user[1] friends with users[3]
  await storage.createFriendship({
    requesterId: users[1].id,
    addresseeId: users[3].id,
    status: "accepted"
  });
  
  // Pending requests
  await storage.createFriendship({
    requesterId: users[4].id,
    addresseeId: users[0].id,
    status: "pending"
  });
  
  // Create some stories
  for (let i = 0; i < 4; i++) {
    const randomUserIndex = Math.floor(Math.random() * users.length);
    const userId = users[randomUserIndex].id;
    
    // Stories expire in 24 hours
    const expiresAt = addHours(new Date(), 24);
    
    await storage.createStory({
      userId,
      content: `Story ${i + 1}`,
      image: storyImages[i],
      expiresAt
    });
  }
  
  // Sample videos for reels - using royalty-free videos from Pixabay
  const SAMPLE_VIDEOS = [
    {
      title: "Amazing sunset views 🌅",
      videoUrl: "https://cdn.pixabay.com/vimeo/751415328/waves-142845.mp4?width=640&hash=4cd0ccac7fa11c33c1c6b6f51f97a84eb46c0432",
      thumbnailUrl: reelImages[0]
    },
    {
      title: "Dance challenge #viral",
      videoUrl: "https://cdn.pixabay.com/vimeo/359811802/happy-22634.mp4?width=640&hash=efe2d6ccf1e71d8a1e53b4d7a7fcc5d8abe34ef2",
      thumbnailUrl: reelImages[1]
    },
    {
      title: "Study tips for finals!",
      videoUrl: "https://cdn.pixabay.com/vimeo/348774022/writing-19723.mp4?width=640&hash=a01ebf04d59c25f8e9c0b6cd27d0de3fa0619a12",
      thumbnailUrl: reelImages[2]
    },
    {
      title: "Quick workout routine",
      videoUrl: "https://cdn.pixabay.com/vimeo/580910423/exercise-91146.mp4?width=640&hash=18bac8fa9ca7fb7a8cbd875882b0b97ee9e5eb5c",
      thumbnailUrl: reelImages[3]
    },
    {
      title: "Cooking with Jamie",
      videoUrl: "https://cdn.pixabay.com/vimeo/559925993/cooking-86800.mp4?width=640&hash=bed3c3fc086badfbf1c97d0c84c7ba05fdaa9a49",
      thumbnailUrl: reelImages[4]
    },
    {
      title: "Nature walk 🌲",
      videoUrl: "https://cdn.pixabay.com/vimeo/539025548/forest-76887.mp4?width=640&hash=1e992a9f75dd2a48eb10d027a9a9e27fe174127f",
      thumbnailUrl: "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?ixlib=rb-1.2.1&auto=format&fit=crop&w=224&h=384&q=80"
    },
    {
      title: "Coffee art techniques ☕",
      videoUrl: "https://cdn.pixabay.com/vimeo/328695249/coffee-17839.mp4?width=640&hash=d77e342aebc0c0e195cf8fb517ebaf2a30e8dd30",
      thumbnailUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?ixlib=rb-1.2.1&auto=format&fit=crop&w=224&h=384&q=80"
    }
  ];

  // Create some reels
  for (let i = 0; i < SAMPLE_VIDEOS.length; i++) {
    const randomUserIndex = Math.floor(Math.random() * users.length);
    const userId = users[randomUserIndex].id;
    
    await storage.createReel({
      userId,
      title: SAMPLE_VIDEOS[i].title,
      videoUrl: SAMPLE_VIDEOS[i].videoUrl,
      thumbnailUrl: SAMPLE_VIDEOS[i].thumbnailUrl,
      viewCount: Math.floor(Math.random() * 1000),
      likeCount: Math.floor(Math.random() * 500),
      commentCount: Math.floor(Math.random() * 100)
    });
  }
  
  // Create some notifications
  for (let i = 0; i < users.length; i++) {
    // Each user gets 2-5 notifications
    const notificationCount = Math.floor(Math.random() * 4) + 2;
    
    for (let j = 0; j < notificationCount; j++) {
      const randomUserIndex = Math.floor(Math.random() * users.length);
      const senderId = users[randomUserIndex].id;
      
      if (senderId !== users[i].id) { // Don't notify yourself
        const notificationTypes = ["like", "comment", "friend_request", "friend_accepted"];
        const randomTypeIndex = Math.floor(Math.random() * notificationTypes.length);
        const type = notificationTypes[randomTypeIndex];
        
        let content = "";
        switch (type) {
          case "like":
            content = "liked your post";
            break;
          case "comment":
            content = "commented on your post";
            break;
          case "friend_request":
            content = "sent you a friend request";
            break;
          case "friend_accepted":
            content = "accepted your friend request";
            break;
        }
        
        // Use a random post as reference
        const randomPostIndex = Math.floor(Math.random() * posts.length);
        const referenceId = posts[randomPostIndex].id;
        
        const read = Math.random() > 0.7; // 30% chance of being unread
        
        await storage.createNotification({
          userId: users[i].id,
          senderId,
          type,
          content,
          referenceId
        });
      }
    }
  }
}
