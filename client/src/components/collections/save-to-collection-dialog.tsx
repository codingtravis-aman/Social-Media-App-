import { useState } from "react";
import { Post } from "@shared/schema";
import { CreateCollectionDialog } from "./create-collection-dialog";
import { useCollections } from "@/hooks/use-collections";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FolderPlus,
  Search,
  Plus,
  Loader2,
  BookmarkCheck,
  ImageIcon,
  Check
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface SaveToCollectionDialogProps {
  post: Post;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SaveToCollectionDialog({ post, open, onOpenChange }: SaveToCollectionDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [createCollectionOpen, setCreateCollectionOpen] = useState(false);
  const { 
    collections, 
    isLoadingCollections,
    addToCollectionMutation 
  } = useCollections();

  const handleSaveToCollection = (collectionId: number) => {
    addToCollectionMutation.mutate(
      { collectionId, postId: post.id },
      {
        onSuccess: () => {
          // Close the dialog after successful save
          onOpenChange(false);
        },
      }
    );
  };

  // Filter collections based on search query
  const filteredCollections = collections?.filter(collection => 
    collection.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save to Collection</DialogTitle>
          <DialogDescription>
            Choose a collection to save this post to or create a new one.
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search collections..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {isLoadingCollections ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
            </div>
          ) : filteredCollections && filteredCollections.length > 0 ? (
            filteredCollections.map(collection => (
              <Card
                key={collection.id}
                className="cursor-pointer hover:bg-accent transition-colors"
                onClick={() => handleSaveToCollection(collection.id)}
              >
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md overflow-hidden bg-primary/10 flex items-center justify-center">
                      {collection.coverImage ? (
                        <img 
                          src={collection.coverImage} 
                          alt={collection.name} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-primary/70" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{collection.name}</h4>
                      {collection.description && (
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {collection.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {addToCollectionMutation.isPending && 
                   addToCollectionMutation.variables?.collectionId === collection.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  ) : (
                    <BookmarkCheck className="h-4 w-4 text-muted-foreground" />
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? 
                "No collections found matching your search." : 
                "You don't have any collections yet."}
            </div>
          )}
        </div>
        
        <Separator className="my-2" />
        
        <div>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setCreateCollectionOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New Collection
          </Button>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
      
      {/* Nested dialog for creating a new collection */}
      <Dialog open={createCollectionOpen} onOpenChange={setCreateCollectionOpen}>
        <CreateCollectionDialog />
      </Dialog>
    </Dialog>
  );
}