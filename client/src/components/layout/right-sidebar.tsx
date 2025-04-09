import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Video, Search, MoreHorizontal, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RightSidebar() {
  const { user } = useAuth();
  
  const { data: friends = [] } = useQuery({
    queryKey: ["/api/friends"],
    enabled: !!user,
  });
  
  return (
    <aside className="hidden xl:block w-1/4 pl-4 fixed right-0 max-w-xs pr-4 pt-4 h-screen overflow-y-auto pb-20">
      {/* Sponsored Section */}
      <div className="mb-4">
        <h3 className="font-semibold text-gray-500 mb-2">Sponsored</h3>
        <div className="rounded-lg overflow-hidden hover:bg-gray-100 cursor-pointer mb-3">
          <a href="#" className="flex">
            <div className="w-1/3">
              <img 
                src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&h=120&q=80" 
                alt="New Running Shoes" 
                className="w-full h-full object-cover rounded-l-lg" 
              />
            </div>
            <div className="w-2/3 p-2">
              <p className="text-sm font-medium">New Running Shoes - 30% Off</p>
              <p className="text-xs text-gray-500">sportshop.com</p>
            </div>
          </a>
        </div>
        <div className="rounded-lg overflow-hidden hover:bg-gray-100 cursor-pointer">
          <a href="#" className="flex">
            <div className="w-1/3">
              <img 
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&h=120&q=80" 
                alt="Meal Delivery Service" 
                className="w-full h-full object-cover rounded-l-lg" 
              />
            </div>
            <div className="w-2/3 p-2">
              <p className="text-sm font-medium">Meal Delivery Service - First Week Free</p>
              <p className="text-xs text-gray-500">mealprep.com</p>
            </div>
          </a>
        </div>
      </div>
      
      <div className="border-t my-4"></div>
      
      {/* Contacts Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-500">Contacts</h3>
          <div className="flex space-x-1">
            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-200">
              <Video className="h-4 w-4 text-gray-500" />
            </Button>
            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-200">
              <Search className="h-4 w-4 text-gray-500" />
            </Button>
            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-200">
              <MoreHorizontal className="h-4 w-4 text-gray-500" />
            </Button>
          </div>
        </div>
        
        <ul className="space-y-1">
          {friends.map((friend) => (
            <li key={friend.id} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-200 cursor-pointer">
              <div className="relative">
                <Avatar className="w-9 h-9">
                  <AvatarImage src={friend.profilePicture} alt={friend.name} />
                  <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <span>{friend.name}</span>
            </li>
          ))}
          
          {friends.length === 0 && (
            <li className="text-sm text-gray-500 p-2">
              No contacts available. Add friends to see them here.
            </li>
          )}
        </ul>
      </div>
      
      <div className="border-t my-4"></div>
      
      {/* Group Conversations */}
      <div>
        <h3 className="font-semibold text-gray-500 mb-2">Group conversations</h3>
        <ul className="space-y-1">
          <li className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-200 cursor-pointer">
            <div className="w-9 h-9 bg-gray-300 rounded-full flex items-center justify-center">
              <Users className="h-5 w-5 text-gray-600" />
            </div>
            <span>Design Team</span>
          </li>
          <li className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-200 cursor-pointer">
            <div className="w-9 h-9 bg-gray-300 rounded-full flex items-center justify-center">
              <Users className="h-5 w-5 text-gray-600" />
            </div>
            <span>Weekend Hiking</span>
          </li>
          <li className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-200 cursor-pointer">
            <div className="w-9 h-9 bg-gray-300 rounded-full flex items-center justify-center">
              <Users className="h-5 w-5 text-gray-600" />
            </div>
            <span>Family Group</span>
          </li>
        </ul>
      </div>
    </aside>
  );
}
