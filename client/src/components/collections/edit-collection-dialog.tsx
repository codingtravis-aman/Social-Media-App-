import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Collection } from "@shared/schema";
import { useCollections } from "@/hooks/use-collections";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ImageIcon, Loader2, Trash2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "Collection name is required").max(50, "Name too long"),
  description: z.string().max(200, "Description too long").optional().nullable(),
  coverImage: z.string().url("Invalid image URL").max(500, "URL too long").optional().nullable(),
});

type EditCollectionFormValues = z.infer<typeof formSchema>;

interface EditCollectionDialogProps {
  collection: Collection;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCollectionDialog({ collection, open, onOpenChange }: EditCollectionDialogProps) {
  const { toast } = useToast();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const { updateCollectionMutation, deleteCollectionMutation } = useCollections();
  
  const form = useForm<EditCollectionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: collection.name,
      description: collection.description || "",
      coverImage: collection.coverImage || "",
    },
  });
  
  const onSubmit = (data: EditCollectionFormValues) => {
    updateCollectionMutation.mutate(
      { 
        collectionId: collection.id, 
        data: {
          name: data.name,
          description: data.description,
          coverImage: data.coverImage,
        } 
      },
      {
        onSuccess: () => {
          toast({
            title: "Collection updated",
            description: "Your collection has been updated successfully.",
          });
          onOpenChange(false);
        },
        onError: (error) => {
          toast({
            title: "Failed to update",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };
  
  const handleDelete = () => {
    deleteCollectionMutation.mutate(
      collection.id,
      {
        onSuccess: () => {
          toast({
            title: "Collection deleted",
            description: "Your collection has been deleted successfully.",
          });
          setConfirmDeleteOpen(false);
          onOpenChange(false);
        },
        onError: (error) => {
          toast({
            title: "Failed to delete",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };
  
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Collection</DialogTitle>
            <DialogDescription>
              Update your collection details or delete the collection.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Collection name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description of your collection"
                        className="resize-none"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional: Add context to help you remember what's in this collection
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="coverImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Image URL</FormLabel>
                    <FormControl>
                      <div className="grid gap-2">
                        <Input
                          placeholder="https://example.com/image.jpg"
                          {...field}
                          value={field.value || ""}
                        />
                        {field.value && (
                          <div className="relative w-full h-32 rounded-md overflow-hidden border">
                            <img
                              src={field.value}
                              alt="Cover preview"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "";
                                (e.target as HTMLImageElement).alt = "Failed to load image";
                                (e.target as HTMLImageElement).className = "hidden";
                                e.currentTarget.parentElement?.classList.add("flex", "items-center", "justify-center", "bg-muted");
                                const icon = document.createElement("div");
                                icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>`;
                                e.currentTarget.parentElement?.appendChild(icon);
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Optional: Provide a URL to an image for your collection cover
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="flex justify-between items-center pt-4">
                <Button 
                  type="button" 
                  variant="destructive"
                  onClick={() => setConfirmDeleteOpen(true)}
                  disabled={collection.isDefault || deleteCollectionMutation.isPending}
                >
                  {deleteCollectionMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Delete
                </Button>
                
                <div className="flex space-x-2">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateCollectionMutation.isPending}>
                    {updateCollectionMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the "{collection.name}" collection and remove all saved items from it.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              {deleteCollectionMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete Collection
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}