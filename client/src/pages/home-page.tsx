import { useEffect } from "react";
import { Layout } from "@/components/layout/layout";
import { CreatePost } from "@/components/post/create-post";
import { StoryReel } from "@/components/story/story-reel";
import { ReelsSection } from "@/components/reels/reels-section";
import { PostCard } from "@/components/post/post-card";
import { useQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

export default function HomePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { ref, inView } = useInView();
  
  const { 
    data: posts = [], 
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage
  } = useQuery({
    queryKey: ["/api/posts"],
  });
  
  useEffect(() => {
    if (inView && !isLoading && !isFetchingNextPage && hasNextPage) {
      fetchNextPage?.();
    }
  }, [inView, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage]);
  
  return (
    <Layout>
      <StoryReel />
      
      <CreatePost />
      
      <ReelsSection />
      
      {isLoading ? (
        <div className="flex justify-center my-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {posts.map((post: any) => (
            <PostCard key={post.id} post={post} />
          ))}
          
          {posts.length === 0 && (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <h3 className="font-semibold text-xl mb-2">Welcome to SocialConnect!</h3>
              <p className="text-gray-600 mb-4">
                Your feed is empty. Start by creating a post or finding friends to follow.
              </p>
              <Button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                Create a Post
              </Button>
            </div>
          )}
          
          <div ref={ref} className="py-4">
            {isFetchingNextPage && (
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
          </div>
        </>
      )}
    </Layout>
  );
}
