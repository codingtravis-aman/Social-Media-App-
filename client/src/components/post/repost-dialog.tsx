import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { usePostRepost } from "@/hooks/use-post-interactions";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

interface RepostDialogProps {
  post: any;
  trigger: React.ReactNode;
  onRepostComplete?: () => void;
}

export function RepostDialog({ post, trigger, onRepostComplete }: RepostDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [repostComment, setRepostComment] = useState('');
  const { repostMutation, isReposting } = usePostRepost();
  const { user } = useAuth();

  const handleRepost = () => {
    repostMutation(
      { 
        originalPostId: post.id, 
        content: repostComment.trim() || null 
      },
      {
        onSuccess: () => {
          setIsOpen(false);
          setRepostComment('');
          if (onRepostComplete) {
            onRepostComplete();
          }
        }
      }
    );
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Repost this content</DialogTitle>
          <DialogDescription>
            Share this post with your followers. Add a comment to tell them why you're reposting it.
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-4">
          <div className="flex items-center space-x-2 mb-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={user.profilePicture} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="font-medium text-sm">{user.name}</span>
          </div>
          
          <Textarea
            placeholder="Add a comment about this post (optional)"
            className="resize-none"
            rows={3}
            value={repostComment}
            onChange={(e) => setRepostComment(e.target.value)}
          />
        </div>
        
        <div className="border rounded-lg p-3 bg-gray-50">
          <div className="flex items-center space-x-2 mb-2">
            <Avatar className="w-6 h-6">
              <AvatarImage src={post.user.profilePicture} alt={post.user.name} />
              <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="font-medium text-xs">{post.user.name}</span>
          </div>
          <p className="text-sm line-clamp-2">{post.content}</p>
          {post.image && (
            <div className="mt-2 h-32 overflow-hidden rounded">
              <img src={post.image} alt="Post content" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleRepost} disabled={isReposting}>
            {isReposting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                Reposting...
              </>
            ) : (
              'Repost'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}