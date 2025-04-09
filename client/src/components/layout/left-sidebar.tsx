import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { 
  Users, ShoppingBag, Tv, Clock, Bookmark, Flag, Calendar, 
  ChevronDown, Gamepad, Camera, Utensils
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

export function LeftSidebar() {
  const { user } = useAuth();
  
  const { data: friends = [] } = useQuery({
    queryKey: ["/api/friends"],
    enabled: !!user,
  });

  return (
    <aside className="hidden lg:block w-1/4 pr-4 fixed left-0 max-w-xs pl-4 pt-4 h-screen overflow-y-auto pb-20">
      <ul className="space-y-1">
        <li>
          <Link href={`/profile/${user?.id}`}>
            <a className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-200">
              <Avatar className="w-9 h-9">
                <AvatarImage src={user?.profilePicture} alt={user?.name} />
                <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="font-medium">{user?.name}</span>
            </a>
          </Link>
        </li>
        <li>
          <Link href="/friends">
            <a className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-200">
              <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <span>Friends</span>
            </a>
          </Link>
        </li>
        <li>
          <Link href="/groups">
            <a className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-200">
              <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <span>Groups</span>
            </a>
          </Link>
        </li>
        <li>
          <Link href="/marketplace">
            <a className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-200">
              <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-primary" />
              </div>
              <span>Marketplace</span>
            </a>
          </Link>
        </li>
        <li>
          <Link href="/watch">
            <a className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-200">
              <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center">
                <Tv className="h-5 w-5 text-primary" />
              </div>
              <span>Watch</span>
            </a>
          </Link>
        </li>
        <li>
          <Link href="/gaming">
            <a className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-200">
              <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center">
                <Gamepad className="h-5 w-5 text-primary" />
              </div>
              <span>Gaming</span>
            </a>
          </Link>
        </li>
        <li>
          <Link href="/memories">
            <a className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-200">
              <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <span>Memories</span>
            </a>
          </Link>
        </li>
        <li>
          <Link href="/saved">
            <a className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-200">
              <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center">
                <Bookmark className="h-5 w-5 text-purple-600" />
              </div>
              <span>Saved</span>
            </a>
          </Link>
        </li>
        <li>
          <Link href="/pages">
            <a className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-200">
              <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center">
                <Flag className="h-5 w-5 text-orange-500" />
              </div>
              <span>Pages</span>
            </a>
          </Link>
        </li>
        <li>
          <Link href="/events">
            <a className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-200">
              <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center">
                <Calendar className="h-5 w-5 text-red-500" />
              </div>
              <span>Events</span>
            </a>
          </Link>
        </li>
        <li>
          <Button 
            variant="ghost" 
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-200 w-full justify-start"
          >
            <div className="w-9 h-9 bg-gray-300 rounded-full flex items-center justify-center">
              <ChevronDown className="h-5 w-5 text-black" />
            </div>
            <span>See more</span>
          </Button>
        </li>
      </ul>
      
      <div className="border-t my-4"></div>
      
      <div className="flex items-center justify-between px-2 mb-2">
        <h3 className="font-semibold text-gray-500">Your shortcuts</h3>
        <Button variant="link" className="text-primary text-sm p-0">Edit</Button>
      </div>
      
      <ul className="space-y-1">
        <li>
          <Link href="/groups/gaming">
            <a className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-200">
              <div className="w-9 h-9 bg-gray-300 rounded-lg flex items-center justify-center">
                <Gamepad className="h-5 w-5 text-green-600" />
              </div>
              <span>Gaming Group</span>
            </a>
          </Link>
        </li>
        <li>
          <Link href="/groups/photography">
            <a className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-200">
              <div className="w-9 h-9 bg-gray-300 rounded-lg flex items-center justify-center">
                <Camera className="h-5 w-5 text-blue-600" />
              </div>
              <span>Photography Club</span>
            </a>
          </Link>
        </li>
        <li>
          <Link href="/groups/food">
            <a className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-200">
              <div className="w-9 h-9 bg-gray-300 rounded-lg flex items-center justify-center">
                <Utensils className="h-5 w-5 text-yellow-600" />
              </div>
              <span>Food & Recipes</span>
            </a>
          </Link>
        </li>
      </ul>
      
      <div className="mt-4 text-xs text-gray-500 space-y-1 px-2">
        <p>Privacy · Terms · Advertising · Ad Choices · Cookies · More · SocialConnect © 2023</p>
      </div>
    </aside>
  );
}
