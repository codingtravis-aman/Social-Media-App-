import { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Bookmark, Share2, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useInView } from 'react-intersection-observer';
import { useReelInteractions } from '@/hooks/use-reel-interactions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

export interface InteractiveReelCardProps {
  reel: {
    id: number;
    userId: number;
    title: string;
    videoUrl: string;
    thumbnailUrl: string;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    createdAt: Date;
    user: {
      id: number;
      name: string;
      username: string;
      profilePicture: string | null;
    };
  };
  isCurrent: boolean;
  onNext?: () => void;
}

export function InteractiveReelCard({ reel, isCurrent, onNext }: InteractiveReelCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const { ref, inView } = useInView({ threshold: 0.7 });
  const { toast } = useToast();
  const { user } = useAuth();
  
  const {
    comment,
    setComment,
    userHasLiked,
    userHasSaved,
    likes,
    comments,
    isLoadingComments,
    likeMutation,
    commentMutation,
    deleteCommentMutation,
    saveMutation,
    viewMutation,
    isLiking,
    isCommenting,
    isDeletingComment,
    isSaving,
  } = useReelInteractions(reel.id);

  // Play/pause based on visibility
  useEffect(() => {
    if (!videoRef.current) return;
    
    if (inView && isCurrent) {
      videoRef.current.play().catch((error) => {
        console.error('Error playing video:', error);
      });
      setIsPlaying(true);
      
      // Record view when the video is played
      viewMutation.mutate();
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [inView, isCurrent, viewMutation]);

  // Toggle play/pause on click
  const togglePlayPause = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch((error) => {
        console.error('Error playing video:', error);
      });
      setIsPlaying(true);
    }
  };

  // Listen for video end
  const handleVideoEnd = () => {
    if (onNext) {
      onNext();
    } else if (videoRef.current) {
      // Loop if no onNext handler
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(error => {
        console.error('Error replaying video:', error);
      });
    }
  };

  // Handle like button click
  const handleLike = () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to like this reel',
        variant: 'destructive',
      });
      return;
    }
    
    likeMutation.mutate();
  };

  // Handle comment submit
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to comment on this reel',
        variant: 'destructive',
      });
      return;
    }
    
    commentMutation.mutate();
  };

  // Handle comment delete
  const handleDeleteComment = (commentId: number) => {
    deleteCommentMutation.mutate(commentId);
  };

  // Handle save button click
  const handleSave = () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to save this reel',
        variant: 'destructive',
      });
      return;
    }
    
    saveMutation.mutate();
  };

  // Handle share button click
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: reel.title || 'Check out this reel',
        text: 'Check out this awesome reel!',
        url: window.location.href,
      }).catch((error) => {
        console.error('Error sharing:', error);
        
        // Fallback to copying to clipboard
        copyToClipboard();
      });
    } else {
      // Fallback to copying to clipboard
      copyToClipboard();
    }
  };

  // Copy URL to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      toast({
        title: 'Link copied',
        description: 'Reel link copied to clipboard',
        variant: 'default',
      });
    }).catch(() => {
      toast({
        title: 'Failed to copy',
        description: 'Could not copy the link to clipboard',
        variant: 'destructive',
      });
    });
  };

  return (
    <div 
      ref={ref}
      className="relative w-full h-full bg-black flex items-center justify-center"
    >
      {/* Video Player */}
      <video
        ref={videoRef}
        src={reel.videoUrl}
        poster={reel.thumbnailUrl}
        className="w-full h-full object-contain"
        playsInline
        muted // Consider removing for production
        onClick={togglePlayPause}
        onEnded={handleVideoEnd}
        loop
      />
      
      {/* Video Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
        <div className="flex items-center">
          {/* User info */}
          <Avatar className="h-10 w-10 mr-3 border-2 border-white">
            <AvatarImage src={reel.user.profilePicture || undefined} />
            <AvatarFallback>{reel.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="text-white font-semibold">{reel.user.name}</h3>
            <p className="text-white/80 text-sm">@{reel.user.username}</p>
          </div>
          
          {/* More options */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(`@${reel.user.username}`)}>
                Copy username
              </DropdownMenuItem>
              <DropdownMenuItem onClick={copyToClipboard}>
                Copy link
              </DropdownMenuItem>
              {user && user.id === reel.userId && (
                <DropdownMenuItem className="text-red-500">
                  Delete reel
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Caption */}
        {reel.title && (
          <p className="text-white mt-2 ml-1">{reel.title}</p>
        )}
      </div>
      
      {/* Interaction Buttons */}
      <div className="absolute right-4 bottom-28 flex flex-col items-center space-y-6">
        {/* Like Button */}
        <div className="flex flex-col items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
              "rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50",
              userHasLiked && "text-red-500"
            )}
            onClick={handleLike}
            disabled={isLiking}
          >
            <Heart className={cn("h-6 w-6", userHasLiked && "fill-current")} />
          </Button>
          <span className="text-white text-xs mt-1">{likes}</span>
        </div>
        
        {/* Comment Button */}
        <Sheet open={isCommentsOpen} onOpenChange={setIsCommentsOpen}>
          <SheetTrigger asChild>
            <div className="flex flex-col items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50"
              >
                <MessageCircle className="h-6 w-6" />
              </Button>
              <span className="text-white text-xs mt-1">{comments.length}</span>
            </div>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] rounded-t-xl">
            <SheetHeader>
              <SheetTitle>Comments</SheetTitle>
              <SheetDescription>
                {comments.length} comments on this reel
              </SheetDescription>
            </SheetHeader>
            <div className="mt-4 flex flex-col space-y-4 overflow-y-auto h-[calc(100%-160px)]">
              {isLoadingComments ? (
                <div className="flex justify-center items-center h-20">
                  <p>Loading comments...</p>
                </div>
              ) : comments.length === 0 ? (
                <div className="flex justify-center items-center h-20">
                  <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.user?.profilePicture || undefined} />
                      <AvatarFallback>
                        {comment.user?.name.substring(0, 2).toUpperCase() || 'UN'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <p className="font-semibold text-sm">{comment.user?.name || 'Unknown'}</p>
                        <span className="text-xs text-muted-foreground ml-2">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                    {user && (user.id === comment.userId || user.id === reel.userId) && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-red-500 h-6"
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={isDeletingComment}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t">
              <form onSubmit={handleCommentSubmit} className="flex items-center space-x-2">
                <Input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1"
                  disabled={!user || isCommenting}
                />
                <Button 
                  type="submit" 
                  disabled={!comment.trim() || isCommenting || !user}
                >
                  Post
                </Button>
              </form>
            </div>
          </SheetContent>
        </Sheet>
        
        {/* Save Button */}
        <div className="flex flex-col items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
              "rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50"
            )}
            onClick={handleSave}
            disabled={isSaving}
          >
            <Bookmark className={cn("h-6 w-6", userHasSaved && "fill-current")} />
          </Button>
        </div>
        
        {/* Share Button */}
        <div className="flex flex-col items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50"
            onClick={handleShare}
          >
            <Share2 className="h-6 w-6" />
          </Button>
        </div>
      </div>
      
      {/* Play/Pause Indicator */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-full bg-black/50 p-4">
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}