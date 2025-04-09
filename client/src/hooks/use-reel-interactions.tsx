import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

interface ReelLike {
  id: number;
  userId: number;
  reelId: number;
  createdAt: Date;
}

interface ReelComment {
  id: number;
  userId: number;
  reelId: number;
  content: string;
  createdAt: Date;
  user?: {
    id: number;
    name: string;
    username: string;
    profilePicture: string | null;
  };
}

interface ReelSave {
  id: number;
  userId: number;
  reelId: number;
  createdAt: Date;
}

interface ReelView {
  id: number;
  userId: number | null;
  reelId: number;
  createdAt: Date;
}

export function useReelInteractions(reelId: number) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [comment, setComment] = useState('');

  // Get likes for the reel
  const {
    data: likesData,
    isLoading: isLoadingLikes,
  } = useQuery({
    queryKey: ['/api/reels', reelId, 'likes'],
    queryFn: getQueryFn<{ count: number; users: any[] }>(),
    enabled: !!reelId,
  });

  // Get comments for the reel
  const {
    data: comments,
    isLoading: isLoadingComments,
  } = useQuery({
    queryKey: ['/api/reels', reelId, 'comments'],
    queryFn: getQueryFn<ReelComment[]>(),
    enabled: !!reelId,
  });

  // Check if the user has liked the reel
  const userHasLiked = !!user && !!likesData?.users?.find(u => u.id === user.id);

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('You must be logged in to like a reel');
      
      // If already liked, unlike it
      if (userHasLiked) {
        await apiRequest('DELETE', `/api/reel-likes/${reelId}`);
        return { action: 'unliked' };
      } else {
        // Otherwise, like it
        await apiRequest('POST', '/api/reel-likes', { reelId });
        return { action: 'liked' };
      }
    },
    onSuccess: (data) => {
      // Invalidate the likes query to refetch the data
      queryClient.invalidateQueries({ queryKey: ['/api/reels', reelId, 'likes'] });
      
      if (data.action === 'liked') {
        toast({
          title: 'Reel liked',
          description: 'You have liked this reel',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Reel unliked',
          description: 'You have unliked this reel',
          variant: 'default',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('You must be logged in to comment on a reel');
      if (!comment.trim()) throw new Error('Comment cannot be empty');
      
      await apiRequest('POST', '/api/reel-comments', { reelId, content: comment });
      return { action: 'commented' };
    },
    onSuccess: () => {
      // Clear the comment input
      setComment('');
      
      // Invalidate the comments query to refetch the data
      queryClient.invalidateQueries({ queryKey: ['/api/reels', reelId, 'comments'] });
      
      toast({
        title: 'Comment added',
        description: 'Your comment has been added',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      if (!user) throw new Error('You must be logged in to delete a comment');
      
      await apiRequest('DELETE', `/api/reel-comments/${commentId}`);
      return { action: 'deleted' };
    },
    onSuccess: () => {
      // Invalidate the comments query to refetch the data
      queryClient.invalidateQueries({ queryKey: ['/api/reels', reelId, 'comments'] });
      
      toast({
        title: 'Comment deleted',
        description: 'Your comment has been deleted',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Get user's saved reels
  const {
    data: savedReels,
    isLoading: isLoadingSaves,
  } = useQuery({
    queryKey: ['/api/reel-saves'],
    queryFn: getQueryFn<any[]>(),
    enabled: !!user,
  });

  // Check if the user has saved the reel
  const userHasSaved = !!user && !!savedReels?.find(reel => reel.id === reelId);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('You must be logged in to save a reel');
      
      // If already saved, unsave it
      if (userHasSaved) {
        await apiRequest('DELETE', `/api/reel-saves/${reelId}`);
        return { action: 'unsaved' };
      } else {
        // Otherwise, save it
        await apiRequest('POST', '/api/reel-saves', { reelId });
        return { action: 'saved' };
      }
    },
    onSuccess: (data) => {
      // Invalidate the saves query to refetch the data
      queryClient.invalidateQueries({ queryKey: ['/api/reel-saves'] });
      
      if (data.action === 'saved') {
        toast({
          title: 'Reel saved',
          description: 'This reel has been added to your saved items',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Reel unsaved',
          description: 'This reel has been removed from your saved items',
          variant: 'default',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // View mutation
  const viewMutation = useMutation({
    mutationFn: async () => {
      // Record the view - userId can be null for anonymous views
      await apiRequest('POST', '/api/reel-views', { 
        reelId,
        userId: user?.id || null
      });
      return { action: 'viewed' };
    },
    // No need for success or error callbacks for views
  });

  return {
    // State
    comment,
    setComment,
    userHasLiked,
    userHasSaved,
    
    // Data
    likes: likesData?.count || 0,
    comments: comments || [],
    
    // Loading states
    isLoadingLikes,
    isLoadingComments,
    isLoadingSaves,
    
    // Mutations
    likeMutation,
    commentMutation,
    deleteCommentMutation,
    saveMutation,
    viewMutation,
    
    // Mutation states
    isLiking: likeMutation.isPending,
    isCommenting: commentMutation.isPending,
    isDeletingComment: deleteCommentMutation.isPending,
    isSaving: saveMutation.isPending,
    isViewing: viewMutation.isPending,
  };
}

// Helper function to create a query function
function getQueryFn<T>() {
  return async ({ queryKey }: any) => {
    const [endpoint, ...params] = queryKey;
    const url = params.length ? `${endpoint}/${params.join('/')}` : endpoint;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    return response.json() as Promise<T>;
  };
}