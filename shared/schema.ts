import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  profilePicture: text("profile_picture"),
  coverPicture: text("cover_picture"),
  bio: text("bio"),
  interests: text("interests").array(),
  privacySettings: jsonb("privacy_settings"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Forward declare posts without self-reference first
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content"),
  image: text("image"),
  visibility: text("visibility").notNull().default("public"), // public, friends
  createdAt: timestamp("created_at").defaultNow(),
});

// Add repostedFromId after posts is declared to avoid circular reference
export const postsRepost = {
  repostedFromId: integer("reposted_from_id").references(() => posts.id),
};

// Append the repostedFromId column to posts
Object.assign(posts, postsRepost);

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => posts.id),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const likes = pgTable("likes", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => posts.id),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const friendships = pgTable("friendships", {
  id: serial("id").primaryKey(),
  requesterId: integer("requester_id").notNull().references(() => users.id),
  addresseeId: integer("addressee_id").notNull().references(() => users.id),
  status: text("status").notNull().default("pending"), // pending, accepted, rejected
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  senderId: integer("sender_id").references(() => users.id),
  type: text("type").notNull(), // like, comment, friend_request, etc.
  content: text("content"),
  read: boolean("read").default(false),
  referenceId: integer("reference_id"), // could be postId, commentId, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

export const stories = pgTable("stories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content"),
  image: text("image").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const reels = pgTable("reels", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title"),
  videoUrl: text("video_url").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  viewCount: integer("view_count").default(0),
  likeCount: integer("like_count").default(0),
  commentCount: integer("comment_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reelComments = pgTable("reel_comments", {
  id: serial("id").primaryKey(),
  reelId: integer("reel_id").notNull().references(() => reels.id),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reelLikes = pgTable("reel_likes", {
  id: serial("id").primaryKey(),
  reelId: integer("reel_id").notNull().references(() => reels.id),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reelSaves = pgTable("reel_saves", {
  id: serial("id").primaryKey(),
  reelId: integer("reel_id").notNull().references(() => reels.id),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reelViews = pgTable("reel_views", {
  id: serial("id").primaryKey(),
  reelId: integer("reel_id").notNull().references(() => reels.id),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const postSaves = pgTable("post_saves", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => posts.id),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Collections for organizing saved items
export const collections = pgTable("collections", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  userId: integer("user_id").notNull().references(() => users.id),
  description: text("description"),
  coverImage: text("cover_image"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Junction table for post saves in collections
export const collectionItems = pgTable("collection_items", {
  id: serial("id").primaryKey(),
  collectionId: integer("collection_id").notNull().references(() => collections.id),
  postSaveId: integer("post_save_id").notNull().references(() => postSaves.id),
  addedAt: timestamp("added_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => users.id),
  receiverId: integer("receiver_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  coverImage: text("cover_image"),
  creatorId: integer("creator_id").notNull().references(() => users.id),
  privacy: text("privacy").notNull().default("public"), // public, private, secret
  createdAt: timestamp("created_at").defaultNow(),
});

export const groupMembers = pgTable("group_members", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull().references(() => groups.id),
  userId: integer("user_id").notNull().references(() => users.id),
  role: text("role").notNull().default("member"), // admin, moderator, member
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const groupPosts = pgTable("group_posts", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull().references(() => groups.id),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content"),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  location: text("location"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  coverImage: text("cover_image"),
  creatorId: integer("creator_id").notNull().references(() => users.id),
  groupId: integer("group_id").references(() => groups.id),
  privacy: text("privacy").notNull().default("public"), // public, private
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  profilePicture: true,
  coverPicture: true,
  bio: true,
  interests: true,
  privacySettings: true,
});

export const insertPostSchema = createInsertSchema(posts)
  .extend({
    repostedFromId: z.number().optional().nullable(),
  })
  .pick({
    userId: true,
    content: true,
    image: true,
    visibility: true,
    repostedFromId: true,
  });

export const insertCommentSchema = createInsertSchema(comments).pick({
  postId: true,
  userId: true,
  content: true,
});

export const insertLikeSchema = createInsertSchema(likes).pick({
  postId: true,
  userId: true,
});

export const insertFriendshipSchema = createInsertSchema(friendships).pick({
  requesterId: true,
  addresseeId: true,
  status: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  senderId: true,
  type: true,
  content: true,
  referenceId: true,
});

export const insertStorySchema = createInsertSchema(stories).pick({
  userId: true,
  content: true,
  image: true,
  expiresAt: true,
});

export const insertReelSchema = createInsertSchema(reels).pick({
  userId: true,
  title: true,
  videoUrl: true,
  thumbnailUrl: true,
});

export const insertReelCommentSchema = createInsertSchema(reelComments).pick({
  reelId: true,
  userId: true,
  content: true,
});

export const insertReelLikeSchema = createInsertSchema(reelLikes).pick({
  reelId: true,
  userId: true,
});

export const insertReelSaveSchema = createInsertSchema(reelSaves).pick({
  reelId: true,
  userId: true,
});

export const insertReelViewSchema = createInsertSchema(reelViews).pick({
  reelId: true,
  userId: true,
});

export const insertPostSaveSchema = createInsertSchema(postSaves).pick({
  postId: true,
  userId: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  senderId: true,
  receiverId: true,
  content: true,
});

export const insertGroupSchema = createInsertSchema(groups).pick({
  name: true,
  description: true,
  coverImage: true,
  creatorId: true,
  privacy: true,
});

export const insertGroupMemberSchema = createInsertSchema(groupMembers).pick({
  groupId: true,
  userId: true,
  role: true,
});

export const insertGroupPostSchema = createInsertSchema(groupPosts).pick({
  groupId: true,
  userId: true,
  content: true,
  image: true,
});

export const insertEventSchema = createInsertSchema(events).pick({
  title: true,
  description: true,
  location: true,
  startTime: true,
  endTime: true,
  coverImage: true,
  creatorId: true,
  groupId: true,
  privacy: true,
});

export const insertCollectionSchema = createInsertSchema(collections).pick({
  name: true,
  userId: true,
  description: true,
  coverImage: true,
  isDefault: true,
});

export const insertCollectionItemSchema = createInsertSchema(collectionItems).pick({
  collectionId: true,
  postSaveId: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type Like = typeof likes.$inferSelect;
export type InsertLike = z.infer<typeof insertLikeSchema>;

export type Friendship = typeof friendships.$inferSelect;
export type InsertFriendship = z.infer<typeof insertFriendshipSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type Story = typeof stories.$inferSelect;
export type InsertStory = z.infer<typeof insertStorySchema>;

export type Reel = typeof reels.$inferSelect;
export type InsertReel = z.infer<typeof insertReelSchema>;

export type ReelComment = typeof reelComments.$inferSelect;
export type InsertReelComment = z.infer<typeof insertReelCommentSchema>;

export type ReelLike = typeof reelLikes.$inferSelect;
export type InsertReelLike = z.infer<typeof insertReelLikeSchema>;

export type ReelSave = typeof reelSaves.$inferSelect;
export type InsertReelSave = z.infer<typeof insertReelSaveSchema>;

export type ReelView = typeof reelViews.$inferSelect;
export type InsertReelView = z.infer<typeof insertReelViewSchema>;

export type PostSave = typeof postSaves.$inferSelect;
export type InsertPostSave = z.infer<typeof insertPostSaveSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Group = typeof groups.$inferSelect;
export type InsertGroup = z.infer<typeof insertGroupSchema>;

export type GroupMember = typeof groupMembers.$inferSelect;
export type InsertGroupMember = z.infer<typeof insertGroupMemberSchema>;

export type GroupPost = typeof groupPosts.$inferSelect;
export type InsertGroupPost = z.infer<typeof insertGroupPostSchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type Collection = typeof collections.$inferSelect;
export type InsertCollection = z.infer<typeof insertCollectionSchema>;

export type CollectionItem = typeof collectionItems.$inferSelect;
export type InsertCollectionItem = z.infer<typeof insertCollectionItemSchema>;
