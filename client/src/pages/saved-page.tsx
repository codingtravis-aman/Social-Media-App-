import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { PostCard } from "@/components/post/post-card";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateCollectionDialog } from "@/components/collections/create-collection-dialog";
import { CollectionCard } from "@/components/collections/collection-card";
import { useCollections } from "@/hooks/use-collections";
import {
  Search, 
  Grid, 
  List,
  Link2, 
  Image, 
  Video, 
  FolderIcon,
  PlusCircle,
  BookmarkCheck,
  Loader2,
  BookmarkPlus
} from "lucide-react";

export default function SavedPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<"collections" | "items">("items");
  
  // Get collections and saved posts
  const { 
    collections, 
    isLoadingCollections 
  } = useCollections();
  
  // Fetch saved posts
  const { 
    data: savedPosts, 
    isLoading: isLoadingSavedPosts 
  } = useQuery({
    queryKey: ['/api/saved-posts'],
    enabled: !!user,
  });
  
  // Filter collections based on search
  const filteredCollections = collections?.filter(collection => 
    collection.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Format the collection counts
  const getItemsCount = () => {
    if (!savedPosts) return 0;
    return savedPosts.length;
  };
  
  const getPostsCount = () => {
    if (!savedPosts) return 0;
    return savedPosts.length;
  };
  
  const getReelsCount = () => {
    // For future implementation
    return 0;
  };
  
  return (
    <Layout>
      <div className="container mx-auto py-6 max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary">Saved Items</h1>
          <div className="flex space-x-2">
            <Button
              variant={viewMode === "items" ? "secondary" : "outline"}
              size="sm"
              onClick={() => setViewMode("items")}
            >
              <List className="mr-2 h-4 w-4" />
              Items
            </Button>
            <Button
              variant={viewMode === "collections" ? "secondary" : "outline"}
              size="sm"
              onClick={() => setViewMode("collections")}
            >
              <Grid className="mr-2 h-4 w-4" />
              Collections
            </Button>
          </div>
        </div>
        
        {viewMode === "items" ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Left sidebar - collections */}
            <div className="md:col-span-1 space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Your Collections</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="relative mb-4">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search saved items" 
                      className="pl-8"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <ul className="space-y-1 pt-2">
                    {/* Default collection options */}
                    <li>
                      <Button
                        variant="ghost"
                        className={`w-full justify-start ${activeTab === 'all' ? 'bg-primary/10 text-primary font-medium' : ''}`}
                        onClick={() => setActiveTab('all')}
                      >
                        <span className="mr-2"><BookmarkCheck /></span>
                        <span>All items</span>
                        <span className="ml-auto bg-muted text-muted-foreground rounded-full px-2 py-0 text-xs">
                          {getItemsCount()}
                        </span>
                      </Button>
                    </li>
                    <li>
                      <Button
                        variant="ghost"
                        className={`w-full justify-start ${activeTab === 'posts' ? 'bg-primary/10 text-primary font-medium' : ''}`}
                        onClick={() => setActiveTab('posts')}
                      >
                        <span className="mr-2"><Image /></span>
                        <span>Posts</span>
                        <span className="ml-auto bg-muted text-muted-foreground rounded-full px-2 py-0 text-xs">
                          {getPostsCount()}
                        </span>
                      </Button>
                    </li>
                    <li>
                      <Button
                        variant="ghost"
                        className={`w-full justify-start ${activeTab === 'reels' ? 'bg-primary/10 text-primary font-medium' : ''}`}
                        onClick={() => setActiveTab('reels')}
                      >
                        <span className="mr-2"><Video /></span>
                        <span>Reels</span>
                        <span className="ml-auto bg-muted text-muted-foreground rounded-full px-2 py-0 text-xs">
                          {getReelsCount()}
                        </span>
                      </Button>
                    </li>
                    
                    {/* User created collections */}
                    {isLoadingCollections ? (
                      <li className="py-2">
                        <div className="flex items-center justify-center">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        </div>
                      </li>
                    ) : (
                      filteredCollections?.map(collection => (
                        <li key={collection.id}>
                          <Button
                            variant="ghost"
                            className={`w-full justify-start ${activeTab === `collection-${collection.id}` ? 'bg-primary/10 text-primary font-medium' : ''}`}
                            onClick={() => setActiveTab(`collection-${collection.id}`)}
                            asChild
                          >
                            <Link href={`/collections/${collection.id}`}>
                              <span className="mr-2"><FolderIcon /></span>
                              <span>{collection.name}</span>
                            </Link>
                          </Button>
                        </li>
                      ))
                    )}
                  </ul>
                </CardContent>
                <CardFooter>
                  <CreateCollectionDialog />
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Quick Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    <li className="flex items-center justify-between text-sm py-1">
                      <span>Recently Saved</span>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Link2 className="h-4 w-4" />
                      </Button>
                    </li>
                    <li className="flex items-center justify-between text-sm py-1">
                      <span>My Favorites</span>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Link2 className="h-4 w-4" />
                      </Button>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            
            {/* Main content - saved items */}
            <div className="md:col-span-3">
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList>
                  <TabsTrigger value="all">All Items</TabsTrigger>
                  <TabsTrigger value="posts">Posts</TabsTrigger>
                  <TabsTrigger value="reels">Reels</TabsTrigger>
                </TabsList>
              </Tabs>
              
              {isLoadingSavedPosts ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                      <div className="p-6">
                        <div className="flex items-center space-x-4">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                          </div>
                        </div>
                        <Skeleton className="h-4 w-full mt-4" />
                        <Skeleton className="h-4 w-full mt-2" />
                        <Skeleton className="h-32 w-full mt-4" />
                      </div>
                    </Card>
                  ))}
                </div>
              ) : savedPosts && savedPosts.length > 0 ? (
                <div className="space-y-4">
                  {savedPosts
                    .filter(savedPost => 
                      activeTab === 'all' || 
                      (activeTab === 'posts' && savedPost.post)
                    )
                    .map(savedPost => (
                      <div key={savedPost.id}>
                        {savedPost.post && (
                          <PostCard post={savedPost.post} />
                        )}
                      </div>
                    ))
                  }
                </div>
              ) : (
                <Card className="p-6 text-center">
                  <div className="flex flex-col items-center justify-center py-12">
                    <BookmarkCheck className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">No saved items yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Items you save will appear here. Start by saving posts you want to see later.
                    </p>
                    <Button asChild>
                      <Link href="/">
                        Browse Feed
                      </Link>
                    </Button>
                  </div>
                </Card>
              )}
              
              {/* Future reels implementation */}
              {activeTab === 'reels' && (
                <Card className="p-6 text-center">
                  <div className="flex flex-col items-center justify-center py-12">
                    <Video className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">No saved reels yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Reels you save will appear here. Start by saving reels you want to watch later.
                    </p>
                    <Button asChild>
                      <Link href="/watch">
                        Browse Reels
                      </Link>
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </div>
        ) : (
          /* Collections Grid View */
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="relative w-72">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search collections..." 
                  className="pl-8"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <CreateCollectionDialog />
            </div>
            
            {isLoadingCollections ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-40 w-full" />
                    <div className="p-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-1/2 mt-1" />
                      <Skeleton className="h-8 w-full mt-4" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : filteredCollections && filteredCollections.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredCollections.map(collection => (
                  <CollectionCard key={collection.id} collection={collection} />
                ))}
              </div>
            ) : (
              <Card className="p-6 text-center">
                <div className="flex flex-col items-center justify-center py-12">
                  <FolderIcon className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No collections yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start organizing your saved items by creating collections.
                  </p>
                  <CreateCollectionDialog />
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}