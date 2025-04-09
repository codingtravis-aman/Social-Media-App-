import { useQuery, useMutation } from "@tanstack/react-query";
import { Collection, CollectionItem } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CreateCollectionData {
  name: string;
  description: string | null;
  coverImage: string | null;
}

interface UpdateCollectionData {
  collectionId: number;
  data: {
    name: string;
    description: string | null;
    coverImage: string | null;
  };
}

interface AddToCollectionData {
  collectionId: number;
  postId: number;
}

export function useCollections() {
  const { toast } = useToast();
  
  // Get all collections for current user
  const { 
    data: collections, 
    error: collectionsError, 
    isLoading: isLoadingCollections 
  } = useQuery<Collection[]>({
    queryKey: ['/api/collections'],
    staleTime: 1000 * 60, // 1 minute
  });
  
  // Create a new collection
  const createCollectionMutation = useMutation({
    mutationFn: async (data: CreateCollectionData) => {
      const res = await apiRequest("POST", "/api/collections", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/collections'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create collection",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update a collection
  const updateCollectionMutation = useMutation({
    mutationFn: async ({ collectionId, data }: UpdateCollectionData) => {
      const res = await apiRequest("PATCH", `/api/collections/${collectionId}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/collections'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update collection",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete a collection
  const deleteCollectionMutation = useMutation({
    mutationFn: async (collectionId: number) => {
      const res = await apiRequest("DELETE", `/api/collections/${collectionId}`);
      if (!res.ok) throw new Error("Failed to delete collection");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/collections'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete collection",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Add a post to a collection
  const addToCollectionMutation = useMutation({
    mutationFn: async ({ collectionId, postId }: AddToCollectionData) => {
      const res = await apiRequest("POST", `/api/collections/${collectionId}/items`, { postId });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/collections'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add to collection",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Remove a post from a collection
  const removeFromCollectionMutation = useMutation({
    mutationFn: async (itemId: number) => {
      const res = await apiRequest("DELETE", `/api/collection-items/${itemId}`);
      if (!res.ok) throw new Error("Failed to remove from collection");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/collections'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to remove from collection",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Get a single collection with items
  const useCollection = (collectionId: number | null) => {
    return useQuery<Collection>({
      queryKey: ['/api/collections', collectionId],
      enabled: collectionId !== null,
    });
  };
  
  return {
    collections,
    collectionsError,
    isLoadingCollections,
    createCollectionMutation,
    updateCollectionMutation,
    deleteCollectionMutation,
    addToCollectionMutation,
    removeFromCollectionMutation,
    useCollection,
  };
}