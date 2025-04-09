import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { NotificationsDropdown } from "@/components/notifications/notifications-dropdown";
import { 
  Home, Tv, ShoppingBag, Users, Gamepad, Menu, Search, 
  Grid, MessageCircle, Bell 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { PWAInstallButton } from "@/components/pwa/install-button";

export function Navbar() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessenger, setShowMessenger] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const { data: notifications } = useQuery({
    queryKey: ["/api/notifications"],
    enabled: !!user,
  });

  const unreadNotifications = notifications?.filter(n => !n.read) || [];
  const unreadMessages = 3; // This would come from a real API

  const isActive = (path: string) => location === path;

  return (
    <header className="fixed top-0 w-full bg-white shadow-sm z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo and Search */}
          <div className="flex items-center flex-1">
            <div className="flex-shrink-0 mr-2">
              <Link href="/">
                <div className="text-primary text-3xl font-bold">Yoop</div>
              </Link>
            </div>
            <div className="relative hidden sm:block">
              <Input
                type="text"
                placeholder="Search Yoop"
                className="bg-gray-100 p-2 pl-9 rounded-full text-sm w-60 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            </div>
          </div>
          
          {/* Main Navigation */}
          <nav className="flex-1 hidden md:flex justify-center">
            <ul className="flex space-x-2">
              <li>
                <Link href="/">
                  <a className={`flex items-center justify-center w-28 h-14 ${isActive('/') ? 'text-primary border-b-4 border-primary' : 'text-gray-500 hover:bg-gray-100 rounded-lg'}`}>
                    <Home className="h-6 w-6" />
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/watch">
                  <a className={`flex items-center justify-center w-28 h-14 ${isActive('/watch') ? 'text-primary border-b-4 border-primary' : 'text-gray-500 hover:bg-gray-100 rounded-lg'}`}>
                    <Tv className="h-6 w-6" />
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/marketplace">
                  <a className={`flex items-center justify-center w-28 h-14 ${isActive('/marketplace') ? 'text-primary border-b-4 border-primary' : 'text-gray-500 hover:bg-gray-100 rounded-lg'}`}>
                    <ShoppingBag className="h-6 w-6" />
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/groups">
                  <a className={`flex items-center justify-center w-28 h-14 ${isActive('/groups') ? 'text-primary border-b-4 border-primary' : 'text-gray-500 hover:bg-gray-100 rounded-lg'}`}>
                    <Users className="h-6 w-6" />
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/gaming">
                  <a className={`flex items-center justify-center w-28 h-14 ${isActive('/gaming') ? 'text-primary border-b-4 border-primary' : 'text-gray-500 hover:bg-gray-100 rounded-lg'}`}>
                    <Gamepad className="h-6 w-6" />
                  </a>
                </Link>
              </li>
            </ul>
          </nav>
          
          {/* User Menu */}
          <div className="flex items-center justify-end flex-1 space-x-2">
            {/* PWA Install Button */}
            <div className="hidden md:block mr-1">
              <PWAInstallButton />
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="p-2.5 bg-gray-200 rounded-full hover:bg-gray-300 relative md:inline-flex hidden"
              onClick={() => setShowMenu(!showMenu)}
            >
              <Grid className="h-5 w-5 text-black" />
            </Button>
            
            <Link href="/messages">
              <Button 
                variant="ghost" 
                size="icon" 
                className={`p-2.5 bg-gray-200 rounded-full hover:bg-gray-300 relative md:inline-flex hidden ${isActive('/messages') ? 'bg-primary/20' : ''}`}
              >
                <MessageCircle className={`h-5 w-5 ${isActive('/messages') ? 'text-primary' : 'text-black'}`} />
                {unreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                    {unreadMessages}
                  </span>
                )}
              </Button>
            </Link>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="p-2.5 bg-gray-200 rounded-full hover:bg-gray-300 relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="h-5 w-5 text-black" />
              {unreadNotifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {unreadNotifications.length}
                </span>
              )}
            </Button>
            
            <Link href={`/profile/${user?.id}`}>
              <div className="flex items-center cursor-pointer">
                <Avatar className="w-9 h-9 border-2 border-white">
                  <AvatarImage src={user?.profilePicture} alt={user?.name} />
                  <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <nav className="md:hidden border-t">
        <ul className="flex justify-between">
          <li>
            <Link href="/">
              <a className={`flex items-center justify-center py-2 ${isActive('/') ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}>
                <Home className="h-6 w-6" />
              </a>
            </Link>
          </li>
          <li>
            <Link href="/watch">
              <a className={`flex items-center justify-center py-2 ${isActive('/watch') ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}>
                <Tv className="h-6 w-6" />
              </a>
            </Link>
          </li>
          <li>
            <Link href="/marketplace">
              <a className={`flex items-center justify-center py-2 ${isActive('/marketplace') ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}>
                <ShoppingBag className="h-6 w-6" />
              </a>
            </Link>
          </li>
          <li>
            <Link href="/messages">
              <a className={`flex items-center justify-center py-2 ${isActive('/messages') ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}>
                <MessageCircle className="h-6 w-6" />
                {unreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
                    {unreadMessages}
                  </span>
                )}
              </a>
            </Link>
          </li>
          <li>
            <Link href="/groups">
              <a className={`flex items-center justify-center py-2 ${isActive('/groups') ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}>
                <Users className="h-6 w-6" />
              </a>
            </Link>
          </li>
          <li>
            <Link href="/gaming">
              <a className={`flex items-center justify-center py-2 ${isActive('/gaming') ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}>
                <Gamepad className="h-6 w-6" />
              </a>
            </Link>
          </li>
          <li>
            <Button 
              variant="ghost"
              size="sm"
              className="flex items-center justify-center py-2 text-gray-500"
              onClick={() => setShowMenu(!showMenu)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </li>
        </ul>
      </nav>
      
      {/* Notifications Dropdown */}
      {showNotifications && (
        <NotificationsDropdown 
          onClose={() => setShowNotifications(false)}
        />
      )}
    </header>
  );
}
