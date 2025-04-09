import { useState, useMemo } from "react";
import { useRoute } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Layout } from "@/components/layout/layout";
import { useCollections } from "@/hooks/use-collections";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PostCard } from "@/components/post/post-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Separator } from "@/components/ui/separator";
import { EditCollectionDialog } from "@/components/collections/edit-collection-dialog";
import {
  ArrowLeft,
  Pencil,
  Settings,
  View,
  Grid,
  List,
  MessageSquare,
  BookmarkPlus,
  Loader2,
  ImageIcon,
  Search,
  Filter,
  ArrowDownAZ
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioItem,
  DropdownMenuRadioGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function CollectionDetailPage() {
  const { user } = useAuth();
  const [, params] = useRoute("/collections/:id");
  const collectionId = params?.id ? parseInt(params.id) : null;
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  
  const { useCollection } = useCollections();
  const { 
    data: collection, 
    isLoading,
    error
  } = useCollection(collectionId);
  
  // Filter and sort the collection items
  const filteredItems = useMemo(() => {
    if (!collection?.items || collection.items.length === 0) {
      return [];
    }
    
    let filtered = [...collection.items];
    
    // Filter by content type
    if (activeFilter === "image") {
      filtered = filtered.filter(item => item.post?.image);
    } else if (activeFilter === "text") {
      filtered = filtered.filter(item => !item.post?.image && item.post?.content);
    }
    
    // Search by text
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.post?.content?.toLowerCase().includes(query) || 
        item.post?.user?.name?.toLowerCase().includes(query)
      );
    }
    
    // Sort items
    filtered.sort((a, b) => {
      if (sortOrder === "newest") {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      } else {
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      }
    });
    
    return filtered;
  }, [collection?.items, searchQuery, activeFilter, sortOrder]);
  
  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto py-12 text-center">
          <p>Please log in to view this collection.</p>
        </div>
      </Layout>
    );
  }
  
  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-6 max-w-6xl">
          <div className="flex items-center mb-8">
            <Button variant="ghost" size="icon" asChild className="mr-4">
              <Link href="/saved">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <Skeleton className="h-8 w-60" />
          </div>
          
          <div className="space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-20 w-full" />
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[200px] w-full" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }
  
  if (error || !collection) {
    return (
      <Layout>
        <div className="container mx-auto py-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Collection not found</h2>
          <p className="text-muted-foreground mb-6">
            The collection you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button asChild>
            <Link href="/saved">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Saved Items
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto py-6 max-w-6xl">
        {/* Header with back button and collection title */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" asChild className="mr-4">
              <Link href="/saved">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-primary">{collection.name}</h1>
            {collection.isDefault && (
              <span className="ml-3 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                Default
              </span>
            )}
          </div>
          
          {!collection.isDefault && (
            <Button variant="outline" size="sm" onClick={() => setEditDialogOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Collection
            </Button>
          )}
        </div>
        
        {/* Collection description */}
        {collection.description && (
          <p className="text-muted-foreground mb-6 max-w-3xl">
            {collection.description}
          </p>
        )}
        
        {/* Search and Filter controls */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-auto sm:min-w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search in this collection..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="ml-auto">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                  {activeFilter !== "all" && <Badge className="ml-2 bg-primary/20 text-primary" variant="secondary">1</Badge>}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[180px]">
                <DropdownMenuLabel>Content Type</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={activeFilter} onValueChange={setActiveFilter}>
                  <DropdownMenuRadioItem value="all">All Items</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="image">With Images</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="text">Text Only</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <ArrowDownAZ className="h-4 w-4 mr-2" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[180px]">
                <DropdownMenuRadioGroup value={sortOrder} onValueChange={setSortOrder}>
                  <DropdownMenuRadioItem value="newest">Newest First</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="oldest">Oldest First</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <div className="flex items-center border rounded-md">
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                className="rounded-r-none h-8"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                className="rounded-l-none h-8"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Results count */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-muted-foreground">
            {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} 
            {searchQuery && ` matching "${searchQuery}"`}
            {activeFilter !== "all" && ` (filtered by: ${activeFilter === "image" ? "With Images" : "Text Only"})`}
          </div>
        </div>
        
        <Separator className="mb-6" />
        
        {/* Collection items */}
        {!collection.items || collection.items.length === 0 ? (
          <div className="text-center py-16 bg-muted/30 rounded-lg">
            <ImageIcon className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No items in this collection yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start saving posts to this collection to see them here.
            </p>
            <Button asChild>
              <Link href="/">
                <BookmarkPlus className="mr-2 h-4 w-4" />
                Browse Feed
              </Link>
            </Button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-muted/30 rounded-lg">
            <Search className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No matching items found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Try adjusting your search or filter criteria to find what you're looking for.
            </p>
            <Button onClick={() => {
              setSearchQuery("");
              setActiveFilter("all");
            }}>
              Clear Filters
            </Button>
          </div>
        ) : viewMode === "list" ? (
          <div className="space-y-4">
            {filteredItems.map(item => (
              <div key={item.id}>
                {item.post && (
                  <PostCard post={item.post} />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map(item => (
              <div key={item.id} className="overflow-hidden rounded-lg border bg-card text-card-foreground">
                {item.post && (
                  <div>
                    {item.post.image && (
                      <div className="aspect-video overflow-hidden">
                        <img 
                          src={item.post.image} 
                          alt="Post image" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        {item.post.user && item.post.user.profilePicture ? (
                          <img 
                            src={item.post.user.profilePicture}
                            alt={item.post.user.name}
                            className="h-8 w-8 rounded-full"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-bold text-primary">
                              {item.post.user?.name?.charAt(0) || '?'}
                            </span>
                          </div>
                        )}
                        <span className="font-medium text-sm">{item.post.user?.name}</span>
                      </div>
                      
                      <p className="text-sm line-clamp-3 mb-3">
                        {item.post.content}
                      </p>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/posts/${item.post.id}`}>
                            <View className="h-3.5 w-3.5 mr-1" />
                            View
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MessageSquare className="h-3.5 w-3.5 mr-1" />
                          Comment
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Edit Collection Dialog */}
      <EditCollectionDialog
        collection={collection}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </Layout>
  );
}