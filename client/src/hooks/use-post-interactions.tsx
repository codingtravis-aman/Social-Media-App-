import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export function usePostLike(postId: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: likesData, isLoading: isLoadingLikes } = useQuery({
    queryKey: ['/api/posts', postId, 'likes'],
    queryFn: async () => {
      const response = await fetch(`/api/posts/${postId}/likes`);
      return response.json();
    },
  });
  
  const likeCount = likesData?.count || 0;
  const likers = likesData?.users || [];
  
  const { mutate: likeMutation, isPending: isLiking } = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/likes', { postId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts', postId, 'likes'] });
      toast({
        title: "Post liked!",
        description: "You have successfully liked this post.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to like post",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const { mutate: unlikeMutation, isPending: isUnliking } = useMutation({
    mutationFn: async () => {
      return apiRequest('DELETE', `/api/likes/${postId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts', postId, 'likes'] });
      toast({
        title: "Post unliked",
        description: "You have successfully unliked this post.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to unlike post",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const isLiked = (userId: number) => {
    return likers.some((user: any) => user.id === userId);
  };
  
  return {
    likeCount,
    likers,
    isLiked,
    likeMutation,
    unlikeMutation,
    isLoading: isLoadingLikes || isLiking || isUnliking,
  };
}

export function usePostSave(postId: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isSaved, setIsSaved] = useState(false);
  
  // Check if this post is already saved
  const { isLoading: isCheckingSaved } = useQuery({
    queryKey: ['/api/saved-posts'],
    queryFn: async () => {
      const response = await fetch('/api/saved-posts');
      if (!response.ok) {
        throw new Error('Failed to fetch saved posts');
      }
      const savedPosts = await response.json();
      const saved = savedPosts.some((save: any) => save.postId === postId);
      setIsSaved(saved);
      return savedPosts;
    },
  });
  
  const { mutate: saveMutation, isPending: isSaving } = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/post-saves', { postId });
    },
    onSuccess: () => {
      setIsSaved(true);
      queryClient.invalidateQueries({ queryKey: ['/api/saved-posts'] });
      toast({
        title: "Post saved!",
        description: "This post has been added to your saved items.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to save post",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const { mutate: unsaveMutation, isPending: isUnsaving } = useMutation({
    mutationFn: async () => {
      return apiRequest('DELETE', `/api/post-saves/${postId}`);
    },
    onSuccess: () => {
      setIsSaved(false);
      queryClient.invalidateQueries({ queryKey: ['/api/saved-posts'] });
      toast({
        title: "Post removed from saved",
        description: "This post has been removed from your saved items.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to unsave post",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  return {
    isSaved,
    saveMutation,
    unsaveMutation,
    isLoading: isCheckingSaved || isSaving || isUnsaving,
  };
}

export function usePostRepost() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { mutate: repostMutation, isPending: isReposting } = useMutation({
    mutationFn: async ({ originalPostId, content }: { originalPostId: number, content?: string }) => {
      return apiRequest('POST', '/api/posts/repost', {
        originalPostId,
        content
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      toast({
        title: "Post reposted!",
        description: "You have successfully reposted this content to your profile.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to repost",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  return {
    repostMutation,
    isReposting,
  };
}