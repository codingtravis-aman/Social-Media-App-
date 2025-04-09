import { useQuery } from "@tanstack/react-query";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ReelCard } from "./reel-card";
import { Button } from "@/components/ui/button";

export function ReelsSection() {
  const { data: reels = [], isLoading } = useQuery({
    queryKey: ["/api/reels"],
  });
  
  if (isLoading) {
    return <div className="h-64 bg-white rounded-lg shadow animate-pulse mb-4"></div>;
  }
  
  if (reels.length === 0) {
    return null;
  }
  
  return (
    <div className="bg-white rounded-lg shadow mb-4 p-3 md:p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg">Reels</h3>
        <Button variant="link" className="text-primary">See All</Button>
      </div>
      
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-2 pb-2">
          {reels.map((reel) => (
            <ReelCard key={reel.id} reel={reel} />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
