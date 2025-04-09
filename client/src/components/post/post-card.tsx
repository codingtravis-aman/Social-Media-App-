import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  MoreHorizontal, 
  ThumbsUp, 
  MessageSquare, 
  Share, 
  Bookmark, 
  BookmarkCheck,
  Repeat
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { PostComments } from "./post-comments";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { usePostLike, usePostSave } from "@/hooks/use-post-interactions";
import { RepostDialog } from "./repost-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface PostCardProps {
  post: any;
}

export function PostCard({ post }: PostCardProps) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  
  const { data: comments = [] } = useQuery({
    queryKey: [`/api/posts/${post.id}/comments`],
    enabled: !!post.id && showComments,
  });
  
  const { likeCount, isLiked, likeMutation, unlikeMutation } = usePostLike(post.id);
  const { isSaved, saveMutation, unsaveMutation } = usePostSave(post.id);
  
  // Handle like/unlike
  const handleLikeToggle = () => {
    if (!user) return;
    
    if (isLiked(user.id)) {
      unlikeMutation();
    } else {
      likeMutation();
    }
  };
  
  // Handle save/unsave
  const handleSaveToggle = () => {
    if (!user) return;
    
    if (isSaved) {
      unsaveMutation();
    } else {
      saveMutation();
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // If this is a reposted post, render both the repost and the original post
  if (post.repostedFromId && post.originalPost) {
    return (
      <div className="bg-white rounded-lg shadow mb-4">
        <div className="p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Link href={`/profile/${post.user.id}`}>
                <a>
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={post.user.profilePicture} alt={post.user.name} />
                    <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </a>
              </Link>
              <div>
                <div className="flex items-center">
                  <Link href={`/profile/${post.user.id}`}>
                    <a className="font-semibold hover:underline">{post.user.name}</a>
                  </Link>
                  <Badge variant="outline" className="ml-2 py-0 h-5 bg-gray-50">
                    <Repeat className="h-3 w-3 mr-1" /> Reposted
                  </Badge>
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <span>{formatDate(post.createdAt)}</span>
                  <span className="mx-1">·</span>
                  <span>{post.visibility === 'private' ? '🔒' : '🌎'}</span>
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:bg-gray-100 rounded-full">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={handleSaveToggle}>
                    {isSaved ? (
                      <>
                        <BookmarkCheck className="mr-2 h-4 w-4" />
                        <span>Saved</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="mr-2 h-4 w-4" />
                        <span>Save post</span>
                      </>
                    )}
                  </DropdownMenuItem>
                  {user && post.user.id === user.id && (
                    <DropdownMenuItem>
                      <span className="text-red-500">Delete post</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {post.content && (
            <div className="mt-3">
              <p className="text-sm">{post.content}</p>
            </div>
          )}
          
          {/* Original post card */}
          <div className="mt-3 border rounded-lg overflow-hidden">
            <div className="p-3 bg-gray-50">
              <div className="flex items-center space-x-2">
                <Link href={`/profile/${post.originalPost.user.id}`}>
                  <a>
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={post.originalPost.user.profilePicture} alt={post.originalPost.user.name} />
                      <AvatarFallback>{post.originalPost.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </a>
                </Link>
                <div>
                  <Link href={`/profile/${post.originalPost.user.id}`}>
                    <a className="font-semibold text-sm hover:underline">{post.originalPost.user.name}</a>
                  </Link>
                  <div className="flex items-center text-xs text-gray-500">
                    <span>{formatDate(post.originalPost.createdAt)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-2">
                <p className="text-sm">{post.originalPost.content}</p>
              </div>
              
              {post.originalPost.image && (
                <div className="mt-2">
                  <img src={post.originalPost.image} alt="Original post content" className="w-full rounded" />
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-3 md:p-4">
          <div className="flex items-center justify-between text-sm text-gray-500 pb-1 border-b">
            <div className="flex items-center space-x-1">
              {likeCount > 0 && (
                <>
                  <div className="bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center">
                    <ThumbsUp className="h-3 w-3" />
                  </div>
                  <span>{likeCount}</span>
                </>
              )}
            </div>
            <div className="flex space-x-2">
              {comments.length > 0 && <span>{comments.length} comments</span>}
            </div>
          </div>
          
          <div className="flex justify-between mt-1">
            <Button 
              variant="ghost" 
              className="flex items-center justify-center space-x-1 p-2 rounded-lg hover:bg-gray-100 flex-1"
              onClick={handleLikeToggle}
            >
              <ThumbsUp className={`h-5 w-5 ${user && isLiked(user.id) ? 'text-primary fill-primary' : ''}`} />
              <span className={`text-sm font-medium ${user && isLiked(user.id) ? 'text-primary' : 'text-gray-600'}`}>Like</span>
            </Button>
            
            <Button 
              variant="ghost" 
              className="flex items-center justify-center space-x-1 p-2 rounded-lg hover:bg-gray-100 flex-1"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageSquare className="h-5 w-5" />
              <span className="text-sm font-medium text-gray-600">Comment</span>
            </Button>
            
            <RepostDialog 
              post={post.originalPost || post} 
              trigger={
                <Button 
                  variant="ghost" 
                  className="flex items-center justify-center space-x-1 p-2 rounded-lg hover:bg-gray-100 flex-1"
                >
                  <Repeat className="h-5 w-5" />
                  <span className="text-sm font-medium text-gray-600">Repost</span>
                </Button>
              }
              onRepostComplete={() => {
                queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
              }}
            />
          </div>
          
          {showComments && (
            <PostComments 
              postId={post.id} 
              comments={comments} 
              onAddComment={() => {
                queryClient.invalidateQueries({ queryKey: [`/api/posts/${post.id}/comments`] });
              }} 
            />
          )}
        </div>
      </div>
    );
  }
  
  // Regular post
  return (
    <div className="bg-white rounded-lg shadow mb-4">
      <div className="p-3 md:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href={`/profile/${post.user.id}`}>
              <a>
                <Avatar className="w-10 h-10">
                  <AvatarImage src={post.user.profilePicture} alt={post.user.name} />
                  <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </a>
            </Link>
            <div>
              <Link href={`/profile/${post.user.id}`}>
                <a className="font-semibold hover:underline">{post.user.name}</a>
              </Link>
              <div className="flex items-center text-xs text-gray-500">
                <span>{formatDate(post.createdAt)}</span>
                <span className="mx-1">·</span>
                <span>{post.visibility === 'private' ? '🔒' : '🌎'}</span>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:bg-gray-100 rounded-full">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={handleSaveToggle}>
                  {isSaved ? (
                    <>
                      <BookmarkCheck className="mr-2 h-4 w-4" />
                      <span>Saved</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="mr-2 h-4 w-4" />
                      <span>Save post</span>
                    </>
                  )}
                </DropdownMenuItem>
                {user && post.user.id === user.id && (
                  <DropdownMenuItem>
                    <span className="text-red-500">Delete post</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="mt-3">
          <p className="text-sm">{post.content}</p>
        </div>
      </div>
      
      {post.image && (
        <div className="w-full">
          <img src={post.image} alt="Post content" className="w-full" />
        </div>
      )}
      
      <div className="p-3 md:p-4">
        <div className="flex items-center justify-between text-sm text-gray-500 pb-1 border-b">
          <div className="flex items-center space-x-1">
            {likeCount > 0 && (
              <>
                <div className="bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center">
                  <ThumbsUp className="h-3 w-3" />
                </div>
                <span>{likeCount}</span>
              </>
            )}
          </div>
          <div className="flex space-x-2">
            {comments.length > 0 && <span>{comments.length} comments</span>}
          </div>
        </div>
        
        <div className="flex justify-between mt-1">
          <Button 
            variant="ghost" 
            className="flex items-center justify-center space-x-1 p-2 rounded-lg hover:bg-gray-100 flex-1"
            onClick={handleLikeToggle}
          >
            <ThumbsUp className={`h-5 w-5 ${user && isLiked(user.id) ? 'text-primary fill-primary' : ''}`} />
            <span className={`text-sm font-medium ${user && isLiked(user.id) ? 'text-primary' : 'text-gray-600'}`}>Like</span>
          </Button>
          
          <Button 
            variant="ghost" 
            className="flex items-center justify-center space-x-1 p-2 rounded-lg hover:bg-gray-100 flex-1"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageSquare className="h-5 w-5" />
            <span className="text-sm font-medium text-gray-600">Comment</span>
          </Button>
          
          <RepostDialog 
            post={post} 
            trigger={
              <Button 
                variant="ghost" 
                className="flex items-center justify-center space-x-1 p-2 rounded-lg hover:bg-gray-100 flex-1"
              >
                <Repeat className="h-5 w-5" />
                <span className="text-sm font-medium text-gray-600">Repost</span>
              </Button>
            }
            onRepostComplete={() => {
              queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
            }}
          />
        </div>
        
        {showComments && (
          <PostComments 
            postId={post.id} 
            comments={comments} 
            onAddComment={() => {
              queryClient.invalidateQueries({ queryKey: [`/api/posts/${post.id}/comments`] });
            }} 
          />
        )}
      </div>
    </div>
  );
}
