import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
  DialogTrigger,
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
import { FolderPlus, Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "Collection name is required").max(50, "Name too long"),
  description: z.string().max(200, "Description too long").optional(),
  coverImage: z
    .string()
    .url("Please enter a valid URL")
    .max(500, "URL too long")
    .optional()
    .or(z.literal("")),
});

type CreateCollectionFormValues = z.infer<typeof formSchema>;

export function CreateCollectionDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { createCollectionMutation } = useCollections();
  
  const form = useForm<CreateCollectionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      coverImage: "",
    },
  });
  
  const onSubmit = (data: CreateCollectionFormValues) => {
    createCollectionMutation.mutate(
      {
        name: data.name,
        description: data.description || null,
        coverImage: data.coverImage || null,
      },
      {
        onSuccess: () => {
          toast({
            title: "Collection created",
            description: "Your collection has been created successfully.",
          });
          form.reset();
          setOpen(false);
        },
        onError: (error) => {
          toast({
            title: "Failed to create collection",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1">
          <FolderPlus className="h-4 w-4" />
          Create Collection
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a new collection</DialogTitle>
          <DialogDescription>
            Create a collection to organize your saved posts.
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
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createCollectionMutation.isPending}>
                {createCollectionMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Collection
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}