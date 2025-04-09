import { 
  users, posts, comments, likes, friendships, notifications, stories, reels,
  reelComments, reelLikes, reelSaves, reelViews, postSaves, collections, collectionItems,
  messages, groups, groupMembers, groupPosts, events
} from "@shared/schema";
import type { 
  User, InsertUser, Post, InsertPost, Comment, InsertComment, 
  Like, InsertLike, Friendship, InsertFriendship, 
  Notification, InsertNotification, Story, InsertStory, Reel, InsertReel,
  ReelComment, InsertReelComment, ReelLike, InsertReelLike,
  ReelSave, InsertReelSave, ReelView, InsertReelView,
  PostSave, InsertPostSave, Collection, InsertCollection, CollectionItem, InsertCollectionItem,
  Message, InsertMessage, Group, InsertGroup, 
  GroupMember, InsertGroupMember, GroupPost, InsertGroupPost, Event, InsertEvent
} from "@shared/schema";
import session from "express-session";
import { Store as SessionStore } from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined>;
  
  // Post operations
  createPost(post: InsertPost): Promise<Post>;
  getPosts(): Promise<Post[]>;
  getPostById(id: number): Promise<Post | undefined>;
  getPostsByUserId(userId: number): Promise<Post[]>;
  updatePost(id: number, data: Partial<InsertPost>): Promise<Post | undefined>;
  deletePost(id: number): Promise<boolean>;
  repostPost(userId: number, originalPostId: number, content?: string): Promise<Post>;
  
  // Post Save operations
  createPostSave(save: InsertPostSave): Promise<PostSave>;
  getPostSavesByUserId(userId: number): Promise<PostSave[]>;
  getPostSaveByUserAndPost(userId: number, postId: number): Promise<PostSave | undefined>;
  deletePostSave(userId: number, postId: number): Promise<boolean>;
  
  // Comment operations
  createComment(comment: InsertComment): Promise<Comment>;
  getCommentsByPostId(postId: number): Promise<Comment[]>;
  deleteComment(id: number): Promise<boolean>;
  
  // Like operations
  createLike(like: InsertLike): Promise<Like>;
  getLikesByPostId(postId: number): Promise<Like[]>;
  getLikeByUserAndPost(userId: number, postId: number): Promise<Like | undefined>;
  deleteLike(userId: number, postId: number): Promise<boolean>;
  
  // Friendship operations
  createFriendship(friendship: InsertFriendship): Promise<Friendship>;
  getFriendshipById(id: number): Promise<Friendship | undefined>;
  getFriendshipByUsers(requesterId: number, addresseeId: number): Promise<Friendship | undefined>;
  getUserFriends(userId: number): Promise<User[]>;
  updateFriendship(id: number, status: string): Promise<Friendship | undefined>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotificationsByUserId(userId: number): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  markAllNotificationsAsRead(userId: number): Promise<boolean>;
  
  // Story operations
  createStory(story: InsertStory): Promise<Story>;
  getStoriesByUserId(userId: number): Promise<Story[]>;
  getActiveStories(): Promise<Story[]>;
  
  // Reel operations
  createReel(reel: InsertReel): Promise<Reel>;
  getReels(): Promise<Reel[]>;
  getReelsByUserId(userId: number): Promise<Reel[]>;
  getReelById(id: number): Promise<Reel | undefined>;
  updateReel(id: number, data: Partial<InsertReel>): Promise<Reel | undefined>;
  incrementReelViewCount(id: number): Promise<Reel | undefined>;
  
  // Reel Comments operations
  createReelComment(comment: InsertReelComment): Promise<ReelComment>;
  getReelCommentsByReelId(reelId: number): Promise<ReelComment[]>;
  deleteReelComment(id: number): Promise<boolean>;
  
  // Reel Likes operations
  createReelLike(like: InsertReelLike): Promise<ReelLike>;
  getReelLikesByReelId(reelId: number): Promise<ReelLike[]>;
  getReelLikeByUserAndReel(userId: number, reelId: number): Promise<ReelLike | undefined>;
  deleteReelLike(userId: number, reelId: number): Promise<boolean>;
  
  // Reel Saves operations
  createReelSave(save: InsertReelSave): Promise<ReelSave>;
  getReelSavesByUserId(userId: number): Promise<ReelSave[]>;
  getReelSaveByUserAndReel(userId: number, reelId: number): Promise<ReelSave | undefined>;
  deleteReelSave(userId: number, reelId: number): Promise<boolean>;
  
  // Reel Views operations
  createReelView(view: InsertReelView): Promise<ReelView>;
  getReelViewsByReelId(reelId: number): Promise<ReelView[]>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByUserId(userId: number): Promise<Message[]>;
  getConversation(userId1: number, userId2: number): Promise<Message[]>;
  getMessageById(id: number): Promise<Message | undefined>;
  markMessageAsRead(id: number): Promise<Message | undefined>;
  
  // Group operations
  createGroup(group: InsertGroup): Promise<Group>;
  getGroups(): Promise<Group[]>;
  getGroupById(id: number): Promise<Group | undefined>;
  getUserGroups(userId: number): Promise<Group[]>;
  updateGroup(id: number, data: Partial<InsertGroup>): Promise<Group | undefined>;
  deleteGroup(id: number): Promise<boolean>;
  
  // Group Member operations
  addGroupMember(groupMember: InsertGroupMember): Promise<GroupMember>;
  getGroupMembers(groupId: number): Promise<GroupMember[]>;
  getGroupMember(groupId: number, userId: number): Promise<GroupMember | undefined>;
  updateGroupMember(groupId: number, userId: number, role: string): Promise<GroupMember | undefined>;
  removeGroupMember(groupId: number, userId: number): Promise<boolean>;
  
  // Group Post operations
  createGroupPost(groupPost: InsertGroupPost): Promise<GroupPost>;
  getGroupPosts(groupId: number): Promise<GroupPost[]>;
  getGroupPostById(id: number): Promise<GroupPost | undefined>;
  updateGroupPost(id: number, data: Partial<InsertGroupPost>): Promise<GroupPost | undefined>;
  deleteGroupPost(id: number): Promise<boolean>;
  
  // Event operations
  createEvent(event: InsertEvent): Promise<Event>;
  getEvents(): Promise<Event[]>;
  getEventById(id: number): Promise<Event | undefined>;
  getUserEvents(userId: number): Promise<Event[]>;
  getGroupEvents(groupId: number): Promise<Event[]>;
  updateEvent(id: number, data: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  
  // Collection operations
  createCollection(collection: InsertCollection): Promise<Collection>;
  getCollectionsByUserId(userId: number): Promise<Collection[]>;
  getCollectionById(id: number): Promise<Collection | undefined>;
  updateCollection(id: number, data: Partial<InsertCollection>): Promise<Collection | undefined>;
  deleteCollection(id: number): Promise<boolean>;
  
  // Collection Item operations
  addPostToCollection(collectionId: number, postSaveId: number): Promise<CollectionItem>;
  getCollectionItems(collectionId: number): Promise<CollectionItem[]>;
  getPostCollections(postSaveId: number): Promise<CollectionItem[]>;
  removePostFromCollection(collectionId: number, postSaveId: number): Promise<boolean>;
  
  // Session store
  sessionStore: SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private posts: Map<number, Post>;
  private comments: Map<number, Comment>;
  private likes: Map<number, Like>;
  private friendships: Map<number, Friendship>;
  private notifications: Map<number, Notification>;
  private stories: Map<number, Story>;
  private reels: Map<number, Reel>;
  private reelComments: Map<number, ReelComment>;
  private reelLikes: Map<number, ReelLike>;
  private reelSaves: Map<number, ReelSave>;
  private reelViews: Map<number, ReelView>;
  private postSaves: Map<number, PostSave>;
  private collections: Map<number, Collection>;
  private collectionItems: Map<number, CollectionItem>;
  private messages: Map<number, Message>;
  private groups: Map<number, Group>;
  private groupMembers: Map<number, GroupMember>;
  private groupPosts: Map<number, GroupPost>;
  private events: Map<number, Event>;
  
  sessionStore: SessionStore;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.posts = new Map();
    this.comments = new Map();
    this.likes = new Map();
    this.friendships = new Map();
    this.notifications = new Map();
    this.stories = new Map();
    this.reels = new Map();
    this.reelComments = new Map();
    this.reelLikes = new Map();
    this.reelSaves = new Map();
    this.reelViews = new Map();
    this.postSaves = new Map();
    this.collections = new Map();
    this.collectionItems = new Map();
    this.messages = new Map();
    this.groups = new Map();
    this.groupMembers = new Map();
    this.groupPosts = new Map();
    this.events = new Map();
    this.currentId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const timestamp = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: timestamp
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Post operations
  async createPost(post: InsertPost): Promise<Post> {
    const id = this.currentId++;
    const timestamp = new Date();
    const newPost: Post = { 
      ...post, 
      id, 
      createdAt: timestamp,
      visibility: post.visibility || 'public'  // Default to public if not specified
    };
    this.posts.set(id, newPost);
    return newPost;
  }

  async getPosts(): Promise<Post[]> {
    return Array.from(this.posts.values()).sort((a, b) => {
      return new Date(b.createdAt as Date).getTime() - new Date(a.createdAt as Date).getTime();
    });
  }

  async getPostById(id: number): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async getPostsByUserId(userId: number): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(post => post.userId === userId)
      .sort((a, b) => {
        return new Date(b.createdAt as Date).getTime() - new Date(a.createdAt as Date).getTime();
      });
  }

  async updatePost(id: number, data: Partial<InsertPost>): Promise<Post | undefined> {
    const post = await this.getPostById(id);
    if (!post) return undefined;
    
    const updatedPost = { ...post, ...data };
    this.posts.set(id, updatedPost);
    return updatedPost;
  }

  async deletePost(id: number): Promise<boolean> {
    return this.posts.delete(id);
  }
  
  async repostPost(userId: number, originalPostId: number, content?: string): Promise<Post> {
    const originalPost = await this.getPostById(originalPostId);
    if (!originalPost) {
      throw new Error("Original post not found");
    }
    
    const repost: InsertPost = {
      userId,
      content: content || null,
      image: originalPost.image,
      visibility: originalPost.visibility || 'public',
      repostedFromId: originalPostId
    };
    
    return this.createPost(repost);
  }
  
  // Post Save operations
  async createPostSave(save: InsertPostSave): Promise<PostSave> {
    const id = this.currentId++;
    const timestamp = new Date();
    const newPostSave: PostSave = { ...save, id, createdAt: timestamp };
    this.postSaves.set(id, newPostSave);
    return newPostSave;
  }
  
  async getPostSavesByUserId(userId: number): Promise<PostSave[]> {
    return Array.from(this.postSaves.values())
      .filter(save => save.userId === userId)
      .sort((a, b) => {
        return new Date(b.createdAt as Date).getTime() - new Date(a.createdAt as Date).getTime();
      });
  }
  
  async getPostSaveByUserAndPost(userId: number, postId: number): Promise<PostSave | undefined> {
    return Array.from(this.postSaves.values())
      .find(save => save.userId === userId && save.postId === postId);
  }
  
  async deletePostSave(userId: number, postId: number): Promise<boolean> {
    const save = await this.getPostSaveByUserAndPost(userId, postId);
    if (!save) return false;
    
    return this.postSaves.delete(save.id);
  }

  // Comment operations
  async createComment(comment: InsertComment): Promise<Comment> {
    const id = this.currentId++;
    const timestamp = new Date();
    const newComment: Comment = { ...comment, id, createdAt: timestamp };
    this.comments.set(id, newComment);
    return newComment;
  }

  async getCommentsByPostId(postId: number): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.postId === postId)
      .sort((a, b) => {
        return new Date(a.createdAt as Date).getTime() - new Date(b.createdAt as Date).getTime();
      });
  }

  async deleteComment(id: number): Promise<boolean> {
    return this.comments.delete(id);
  }

  // Like operations
  async createLike(like: InsertLike): Promise<Like> {
    const id = this.currentId++;
    const timestamp = new Date();
    const newLike: Like = { ...like, id, createdAt: timestamp };
    this.likes.set(id, newLike);
    return newLike;
  }

  async getLikesByPostId(postId: number): Promise<Like[]> {
    return Array.from(this.likes.values()).filter(like => like.postId === postId);
  }

  async getLikeByUserAndPost(userId: number, postId: number): Promise<Like | undefined> {
    return Array.from(this.likes.values()).find(
      like => like.userId === userId && like.postId === postId
    );
  }

  async deleteLike(userId: number, postId: number): Promise<boolean> {
    const like = await this.getLikeByUserAndPost(userId, postId);
    if (!like) return false;
    
    return this.likes.delete(like.id);
  }

  // Friendship operations
  async createFriendship(friendship: InsertFriendship): Promise<Friendship> {
    const id = this.currentId++;
    const timestamp = new Date();
    const newFriendship: Friendship = { ...friendship, id, createdAt: timestamp };
    this.friendships.set(id, newFriendship);
    return newFriendship;
  }

  async getFriendshipById(id: number): Promise<Friendship | undefined> {
    return this.friendships.get(id);
  }

  async getFriendshipByUsers(requesterId: number, addresseeId: number): Promise<Friendship | undefined> {
    return Array.from(this.friendships.values()).find(
      friendship => 
        (friendship.requesterId === requesterId && friendship.addresseeId === addresseeId) ||
        (friendship.requesterId === addresseeId && friendship.addresseeId === requesterId)
    );
  }

  async getUserFriends(userId: number): Promise<User[]> {
    const friendships = Array.from(this.friendships.values()).filter(
      friendship => 
        (friendship.requesterId === userId || friendship.addresseeId === userId) &&
        friendship.status === 'accepted'
    );

    const friendIds = friendships.map(friendship => 
      friendship.requesterId === userId ? friendship.addresseeId : friendship.requesterId
    );

    return Array.from(this.users.values()).filter(user => friendIds.includes(user.id));
  }

  async updateFriendship(id: number, status: string): Promise<Friendship | undefined> {
    const friendship = await this.getFriendshipById(id);
    if (!friendship) return undefined;
    
    const updatedFriendship = { ...friendship, status };
    this.friendships.set(id, updatedFriendship);
    return updatedFriendship;
  }

  // Notification operations
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = this.currentId++;
    const timestamp = new Date();
    const newNotification: Notification = { 
      ...notification, 
      id, 
      read: false, 
      createdAt: timestamp 
    };
    this.notifications.set(id, newNotification);
    return newNotification;
  }

  async getNotificationsByUserId(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => {
        return new Date(b.createdAt as Date).getTime() - new Date(a.createdAt as Date).getTime();
      });
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);
    if (!notification) return undefined;
    
    const updatedNotification = { ...notification, read: true };
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }

  async markAllNotificationsAsRead(userId: number): Promise<boolean> {
    const userNotifications = await this.getNotificationsByUserId(userId);
    
    userNotifications.forEach(notification => {
      this.notifications.set(notification.id, { ...notification, read: true });
    });
    
    return true;
  }

  // Story operations
  async createStory(story: InsertStory): Promise<Story> {
    const id = this.currentId++;
    const timestamp = new Date();
    const newStory: Story = { ...story, id, createdAt: timestamp };
    this.stories.set(id, newStory);
    return newStory;
  }

  async getStoriesByUserId(userId: number): Promise<Story[]> {
    return Array.from(this.stories.values())
      .filter(story => story.userId === userId && new Date(story.expiresAt) > new Date())
      .sort((a, b) => {
        return new Date(b.createdAt as Date).getTime() - new Date(a.createdAt as Date).getTime();
      });
  }

  async getActiveStories(): Promise<Story[]> {
    const now = new Date();
    return Array.from(this.stories.values())
      .filter(story => new Date(story.expiresAt) > now)
      .sort((a, b) => {
        return new Date(b.createdAt as Date).getTime() - new Date(a.createdAt as Date).getTime();
      });
  }

  // Reel operations
  async createReel(reel: InsertReel): Promise<Reel> {
    const id = this.currentId++;
    const timestamp = new Date();
    const newReel: Reel = { 
      ...reel, 
      id, 
      createdAt: timestamp,
      viewCount: 0,
      likeCount: 0,
      commentCount: 0
    };
    this.reels.set(id, newReel);
    return newReel;
  }

  async getReels(): Promise<Reel[]> {
    return Array.from(this.reels.values()).sort((a, b) => {
      return new Date(b.createdAt as Date).getTime() - new Date(a.createdAt as Date).getTime();
    });
  }

  async getReelsByUserId(userId: number): Promise<Reel[]> {
    return Array.from(this.reels.values())
      .filter(reel => reel.userId === userId)
      .sort((a, b) => {
        return new Date(b.createdAt as Date).getTime() - new Date(a.createdAt as Date).getTime();
      });
  }
  
  async getReelById(id: number): Promise<Reel | undefined> {
    return this.reels.get(id);
  }
  
  async updateReel(id: number, data: Partial<InsertReel>): Promise<Reel | undefined> {
    const reel = await this.getReelById(id);
    if (!reel) return undefined;
    
    const updatedReel = { ...reel, ...data };
    this.reels.set(id, updatedReel);
    return updatedReel;
  }
  
  async incrementReelViewCount(id: number): Promise<Reel | undefined> {
    const reel = await this.getReelById(id);
    if (!reel) return undefined;
    
    const updatedReel = { 
      ...reel, 
      viewCount: (reel.viewCount || 0) + 1 
    };
    this.reels.set(id, updatedReel);
    return updatedReel;
  }
  
  // Reel Comments operations
  async createReelComment(comment: InsertReelComment): Promise<ReelComment> {
    const id = this.currentId++;
    const timestamp = new Date();
    const newReelComment: ReelComment = { ...comment, id, createdAt: timestamp };
    this.reelComments.set(id, newReelComment);
    
    // Increment comment count on the reel
    const reel = await this.getReelById(comment.reelId);
    if (reel) {
      const updatedReel = { 
        ...reel, 
        commentCount: (reel.commentCount || 0) + 1 
      };
      this.reels.set(reel.id, updatedReel);
    }
    
    return newReelComment;
  }
  
  async getReelCommentsByReelId(reelId: number): Promise<ReelComment[]> {
    return Array.from(this.reelComments.values())
      .filter(comment => comment.reelId === reelId)
      .sort((a, b) => {
        return new Date(a.createdAt as Date).getTime() - new Date(b.createdAt as Date).getTime();
      });
  }
  
  async deleteReelComment(id: number): Promise<boolean> {
    const comment = this.reelComments.get(id);
    if (!comment) return false;
    
    // Decrement comment count on the reel
    const reel = await this.getReelById(comment.reelId);
    if (reel && reel.commentCount && reel.commentCount > 0) {
      const updatedReel = { 
        ...reel, 
        commentCount: reel.commentCount - 1 
      };
      this.reels.set(reel.id, updatedReel);
    }
    
    return this.reelComments.delete(id);
  }
  
  // Reel Likes operations
  async createReelLike(like: InsertReelLike): Promise<ReelLike> {
    const id = this.currentId++;
    const timestamp = new Date();
    const newReelLike: ReelLike = { ...like, id, createdAt: timestamp };
    this.reelLikes.set(id, newReelLike);
    
    // Increment like count on the reel
    const reel = await this.getReelById(like.reelId);
    if (reel) {
      const updatedReel = { 
        ...reel, 
        likeCount: (reel.likeCount || 0) + 1 
      };
      this.reels.set(reel.id, updatedReel);
    }
    
    return newReelLike;
  }
  
  async getReelLikesByReelId(reelId: number): Promise<ReelLike[]> {
    return Array.from(this.reelLikes.values())
      .filter(like => like.reelId === reelId);
  }
  
  async getReelLikeByUserAndReel(userId: number, reelId: number): Promise<ReelLike | undefined> {
    return Array.from(this.reelLikes.values())
      .find(like => like.userId === userId && like.reelId === reelId);
  }
  
  async deleteReelLike(userId: number, reelId: number): Promise<boolean> {
    const like = await this.getReelLikeByUserAndReel(userId, reelId);
    if (!like) return false;
    
    // Decrement like count on the reel
    const reel = await this.getReelById(reelId);
    if (reel && reel.likeCount && reel.likeCount > 0) {
      const updatedReel = { 
        ...reel, 
        likeCount: reel.likeCount - 1 
      };
      this.reels.set(reel.id, updatedReel);
    }
    
    return this.reelLikes.delete(like.id);
  }
  
  // Reel Saves operations
  async createReelSave(save: InsertReelSave): Promise<ReelSave> {
    const id = this.currentId++;
    const timestamp = new Date();
    const newReelSave: ReelSave = { ...save, id, createdAt: timestamp };
    this.reelSaves.set(id, newReelSave);
    return newReelSave;
  }
  
  async getReelSavesByUserId(userId: number): Promise<ReelSave[]> {
    return Array.from(this.reelSaves.values())
      .filter(save => save.userId === userId)
      .sort((a, b) => {
        return new Date(b.createdAt as Date).getTime() - new Date(a.createdAt as Date).getTime();
      });
  }
  
  async getReelSaveByUserAndReel(userId: number, reelId: number): Promise<ReelSave | undefined> {
    return Array.from(this.reelSaves.values())
      .find(save => save.userId === userId && save.reelId === reelId);
  }
  
  async deleteReelSave(userId: number, reelId: number): Promise<boolean> {
    const save = await this.getReelSaveByUserAndReel(userId, reelId);
    if (!save) return false;
    
    return this.reelSaves.delete(save.id);
  }
  
  // Reel Views operations
  async createReelView(view: InsertReelView): Promise<ReelView> {
    const id = this.currentId++;
    const timestamp = new Date();
    const newReelView: ReelView = { ...view, id, createdAt: timestamp };
    this.reelViews.set(id, newReelView);
    
    // Increment the view count on the reel
    await this.incrementReelViewCount(view.reelId);
    
    return newReelView;
  }
  
  async getReelViewsByReelId(reelId: number): Promise<ReelView[]> {
    return Array.from(this.reelViews.values())
      .filter(view => view.reelId === reelId);
  }
  
  // Message operations
  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.currentId++;
    const timestamp = new Date();
    const newMessage: Message = { 
      ...message, 
      id, 
      read: false,
      createdAt: timestamp 
    };
    this.messages.set(id, newMessage);
    return newMessage;
  }

  async getMessagesByUserId(userId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.senderId === userId || message.receiverId === userId)
      .sort((a, b) => {
        return new Date(a.createdAt as Date).getTime() - new Date(b.createdAt as Date).getTime();
      });
  }

  async getConversation(userId1: number, userId2: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => 
        (message.senderId === userId1 && message.receiverId === userId2) ||
        (message.senderId === userId2 && message.receiverId === userId1)
      )
      .sort((a, b) => {
        return new Date(a.createdAt as Date).getTime() - new Date(b.createdAt as Date).getTime();
      });
  }
  
  async getMessageById(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }
  
  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const message = this.messages.get(id);
    if (!message) return undefined;
    
    const updatedMessage = { ...message, read: true };
    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }
  
  // Group operations
  async createGroup(group: InsertGroup): Promise<Group> {
    const id = this.currentId++;
    const timestamp = new Date();
    const newGroup: Group = { ...group, id, createdAt: timestamp };
    this.groups.set(id, newGroup);
    
    // Add creator as admin
    await this.addGroupMember({
      groupId: id,
      userId: group.creatorId,
      role: 'admin'
    });
    
    return newGroup;
  }

  async getGroups(): Promise<Group[]> {
    return Array.from(this.groups.values())
      .filter(group => group.privacy === 'public')
      .sort((a, b) => {
        return new Date(b.createdAt as Date).getTime() - new Date(a.createdAt as Date).getTime();
      });
  }

  async getGroupById(id: number): Promise<Group | undefined> {
    return this.groups.get(id);
  }

  async getUserGroups(userId: number): Promise<Group[]> {
    const userGroupMemberships = Array.from(this.groupMembers.values())
      .filter(member => member.userId === userId)
      .map(member => member.groupId);
    
    return Array.from(this.groups.values())
      .filter(group => userGroupMemberships.includes(group.id))
      .sort((a, b) => {
        return new Date(b.createdAt as Date).getTime() - new Date(a.createdAt as Date).getTime();
      });
  }

  async updateGroup(id: number, data: Partial<InsertGroup>): Promise<Group | undefined> {
    const group = await this.getGroupById(id);
    if (!group) return undefined;
    
    const updatedGroup = { ...group, ...data };
    this.groups.set(id, updatedGroup);
    return updatedGroup;
  }

  async deleteGroup(id: number): Promise<boolean> {
    // Delete all group members
    Array.from(this.groupMembers.values())
      .filter(member => member.groupId === id)
      .forEach(member => this.groupMembers.delete(member.id));
    
    // Delete all group posts
    Array.from(this.groupPosts.values())
      .filter(post => post.groupId === id)
      .forEach(post => this.groupPosts.delete(post.id));
    
    // Delete the group
    return this.groups.delete(id);
  }
  
  // Group Member operations
  async addGroupMember(groupMember: InsertGroupMember): Promise<GroupMember> {
    const id = this.currentId++;
    const timestamp = new Date();
    const newGroupMember: GroupMember = { ...groupMember, id, createdAt: timestamp };
    this.groupMembers.set(id, newGroupMember);
    return newGroupMember;
  }

  async getGroupMembers(groupId: number): Promise<GroupMember[]> {
    return Array.from(this.groupMembers.values())
      .filter(member => member.groupId === groupId);
  }

  async getGroupMember(groupId: number, userId: number): Promise<GroupMember | undefined> {
    return Array.from(this.groupMembers.values())
      .find(member => member.groupId === groupId && member.userId === userId);
  }

  async updateGroupMember(groupId: number, userId: number, role: string): Promise<GroupMember | undefined> {
    const member = await this.getGroupMember(groupId, userId);
    if (!member) return undefined;
    
    const updatedMember = { ...member, role };
    this.groupMembers.set(member.id, updatedMember);
    return updatedMember;
  }

  async removeGroupMember(groupId: number, userId: number): Promise<boolean> {
    const member = await this.getGroupMember(groupId, userId);
    if (!member) return false;
    
    return this.groupMembers.delete(member.id);
  }
  
  // Group Post operations
  async createGroupPost(groupPost: InsertGroupPost): Promise<GroupPost> {
    const id = this.currentId++;
    const timestamp = new Date();
    const newGroupPost: GroupPost = { ...groupPost, id, createdAt: timestamp };
    this.groupPosts.set(id, newGroupPost);
    return newGroupPost;
  }

  async getGroupPosts(groupId: number): Promise<GroupPost[]> {
    return Array.from(this.groupPosts.values())
      .filter(post => post.groupId === groupId)
      .sort((a, b) => {
        return new Date(b.createdAt as Date).getTime() - new Date(a.createdAt as Date).getTime();
      });
  }

  async getGroupPostById(id: number): Promise<GroupPost | undefined> {
    return this.groupPosts.get(id);
  }

  async updateGroupPost(id: number, data: Partial<InsertGroupPost>): Promise<GroupPost | undefined> {
    const post = await this.getGroupPostById(id);
    if (!post) return undefined;
    
    const updatedPost = { ...post, ...data };
    this.groupPosts.set(id, updatedPost);
    return updatedPost;
  }

  async deleteGroupPost(id: number): Promise<boolean> {
    return this.groupPosts.delete(id);
  }
  
  // Event operations
  async createEvent(event: InsertEvent): Promise<Event> {
    const id = this.currentId++;
    const timestamp = new Date();
    const newEvent: Event = { ...event, id, createdAt: timestamp };
    this.events.set(id, newEvent);
    return newEvent;
  }

  async getEvents(): Promise<Event[]> {
    const now = new Date();
    return Array.from(this.events.values())
      .filter(event => new Date(event.endTime) >= now && event.privacy === 'public')
      .sort((a, b) => {
        return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
      });
  }

  async getEventById(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async getUserEvents(userId: number): Promise<Event[]> {
    const now = new Date();
    return Array.from(this.events.values())
      .filter(event => event.creatorId === userId && new Date(event.endTime) >= now)
      .sort((a, b) => {
        return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
      });
  }

  async getGroupEvents(groupId: number): Promise<Event[]> {
    const now = new Date();
    return Array.from(this.events.values())
      .filter(event => event.groupId === groupId && new Date(event.endTime) >= now)
      .sort((a, b) => {
        return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
      });
  }

  async updateEvent(id: number, data: Partial<InsertEvent>): Promise<Event | undefined> {
    const event = await this.getEventById(id);
    if (!event) return undefined;
    
    const updatedEvent = { ...event, ...data };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }

  async deleteEvent(id: number): Promise<boolean> {
    return this.events.delete(id);
  }
  
  // Collection operations
  async createCollection(collection: InsertCollection): Promise<Collection> {
    const id = this.currentId++;
    const timestamp = new Date();
    const newCollection: Collection = { 
      ...collection, 
      id, 
      createdAt: timestamp 
    };
    this.collections.set(id, newCollection);
    return newCollection;
  }

  async getCollectionsByUserId(userId: number): Promise<Collection[]> {
    return Array.from(this.collections.values())
      .filter(collection => collection.userId === userId)
      .sort((a, b) => {
        return new Date(b.createdAt as Date).getTime() - new Date(a.createdAt as Date).getTime();
      });
  }

  async getCollectionById(id: number): Promise<Collection | undefined> {
    return this.collections.get(id);
  }

  async updateCollection(id: number, data: Partial<InsertCollection>): Promise<Collection | undefined> {
    const collection = await this.getCollectionById(id);
    if (!collection) return undefined;
    
    const updatedCollection = { ...collection, ...data };
    this.collections.set(id, updatedCollection);
    return updatedCollection;
  }

  async deleteCollection(id: number): Promise<boolean> {
    // First, remove all items in this collection
    const items = await this.getCollectionItems(id);
    items.forEach(item => this.collectionItems.delete(item.id));
    
    // Then delete the collection itself
    return this.collections.delete(id);
  }
  
  // Collection Item operations
  async addPostToCollection(collectionId: number, postSaveId: number): Promise<CollectionItem> {
    // Check if collection exists
    const collection = await this.getCollectionById(collectionId);
    if (!collection) {
      throw new Error("Collection not found");
    }
    
    // Check if already in collection
    const existing = Array.from(this.collectionItems.values())
      .find(item => item.collectionId === collectionId && item.postSaveId === postSaveId);
      
    if (existing) {
      return existing; // Already in collection, just return it
    }
    
    // Add to collection
    const id = this.currentId++;
    const timestamp = new Date();
    const newItem: CollectionItem = {
      id,
      collectionId,
      postSaveId,
      addedAt: timestamp
    };
    
    this.collectionItems.set(id, newItem);
    return newItem;
  }

  async getCollectionItems(collectionId: number): Promise<CollectionItem[]> {
    return Array.from(this.collectionItems.values())
      .filter(item => item.collectionId === collectionId)
      .sort((a, b) => {
        return new Date(b.addedAt as Date).getTime() - new Date(a.addedAt as Date).getTime();
      });
  }

  async getPostCollections(postSaveId: number): Promise<CollectionItem[]> {
    return Array.from(this.collectionItems.values())
      .filter(item => item.postSaveId === postSaveId);
  }

  async removePostFromCollection(collectionId: number, postSaveId: number): Promise<boolean> {
    const item = Array.from(this.collectionItems.values())
      .find(item => item.collectionId === collectionId && item.postSaveId === postSaveId);
      
    if (!item) return false;
    
    return this.collectionItems.delete(item.id);
  }
}

export const storage = new MemStorage();
