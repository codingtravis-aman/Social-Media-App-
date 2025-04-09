import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface PostCommentsProps {
  postId: number;
  comments: any[];
  onAddComment: () => void;
}

export function PostComments({ postId, comments, onAddComment }: PostCommentsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comment, setComment] = useState("");
  
  const commentMutation = useMutation({
    mutationFn: async () => {
      if (!comment.trim()) return;
      
      await apiRequest("POST", "/api/comments", {
        postId,
        content: comment,
      });
    },
    onSuccess: () => {
      setComment("");
      onAddComment();
    },
    onError: (error) => {
      toast({
        title: "Error adding comment",
        description: (error as Error).message,
        variant: "destructive",
      });
    },
  });
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (comment.trim()) {
        commentMutation.mutate();
      }
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
    } else {
      return date.toLocaleDateString();
    }
  };
  
  return (
    <div className="mt-2 space-y-2">
      {comments.map((comment) => (
        <div key={comment.id} className="flex space-x-2">
          <Link href={`/profile/${comment.user.id}`}>
            <a>
              <Avatar className="w-8 h-8">
                <AvatarImage src={comment.user.profilePicture} alt={comment.user.name} />
                <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </a>
          </Link>
          <div className="bg-gray-100 rounded-2xl px-3 py-2 flex-grow">
            <Link href={`/profile/${comment.user.id}`}>
              <a className="font-semibold text-sm hover:underline">{comment.user.name}</a>
            </Link>
            <p className="text-sm">{comment.content}</p>
            <div className="flex space-x-2 mt-1 text-xs text-gray-500">
              <span>{formatDate(comment.createdAt)}</span>
              <button className="font-semibold hover:underline">Like</button>
              <button className="font-semibold hover:underline">Reply</button>
            </div>
          </div>
        </div>
      ))}
      
      <div className="flex space-x-2">
        <Avatar className="w-8 h-8">
          <AvatarImage src={user?.profilePicture} alt={user?.name} />
          <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="bg-gray-100 rounded-2xl px-3 py-2 flex-grow flex items-center">
          <Input
            type="text"
            placeholder="Write a comment..."
            className="bg-transparent border-none outline-none text-sm w-full"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={commentMutation.isPending}
          />
        </div>
      </div>
    </div>
  );
}
