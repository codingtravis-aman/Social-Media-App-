import { User, Post, Comment, Like, Friendship, Notification, Story, Reel } from "@shared/schema";

export interface UserWithoutPassword extends Omit<User, "password"> {}

export interface PostWithUser extends Post {
  user: UserWithoutPassword;
}

export interface CommentWithUser extends Comment {
  user: UserWithoutPassword;
}

export interface NotificationWithSender extends Notification {
  sender?: UserWithoutPassword;
}

export interface LikesResponse {
  count: number;
  users: UserWithoutPassword[];
}

export interface StoryGroup {
  user: UserWithoutPassword;
  stories: Story[];
}

export interface ReelWithUser extends Reel {
  user: UserWithoutPassword;
}

export interface FriendRequest {
  id: number;
  user: UserWithoutPassword;
  status: string;
}

export interface FriendshipWithUser extends Friendship {
  requester?: UserWithoutPassword;
  addressee?: UserWithoutPassword;
}
