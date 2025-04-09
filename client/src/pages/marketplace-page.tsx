import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { LeftSidebar } from "@/components/layout/left-sidebar";
import { RightSidebar } from "@/components/layout/right-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, MapPin, Plus, ChevronRight, ChevronDown, 
  Home, Car, Sofa, Tag, ArrowDownUp, SlidersHorizontal
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Demo marketplace listings
const marketplaceListings = [
  {
    id: 1,
    title: "Modern Coffee Table",
    price: 120,
    location: "Brooklyn, NY",
    image: "https://images.unsplash.com/photo-1634712282287-14ed57b9cc89?auto=format&fit=crop&q=80&w=2206&ixlib=rb-4.0.3",
    category: "Furniture",
    createdAt: "2 days ago",
  },
  {
    id: 2,
    title: "iPhone 13 Pro - 256GB",
    price: 800,
    location: "Manhattan, NY",
    image: "https://images.unsplash.com/photo-1678911820864-e2c567c655d7?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3",
    category: "Electronics",
    createdAt: "5 hours ago",
  },
  {
    id: 3,
    title: "Vintage Record Player",
    price: 95,
    location: "Queens, NY",
    image: "https://images.unsplash.com/photo-1603964555917-9f1cc7c57084?auto=format&fit=crop&q=80&w=1974&ixlib=rb-4.0.3",
    category: "Electronics",
    createdAt: "Yesterday",
  },
  {
    id: 4,
    title: "Mountain Bike - Trek",
    price: 350,
    location: "Bronx, NY",
    image: "https://images.unsplash.com/photo-1593764592116-bfb2a97c642a?auto=format&fit=crop&q=80&w=1939&ixlib=rb-4.0.3",
    category: "Sports",
    createdAt: "3 days ago",
  },
  {
    id: 5,
    title: "Designer Desk Chair",
    price: 150,
    location: "Staten Island, NY",
    image: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&q=80&w=2000&ixlib=rb-4.0.3",
    category: "Furniture",
    createdAt: "1 week ago",
  },
  {
    id: 6,
    title: "Acoustic Guitar",
    price: 220,
    location: "Brooklyn, NY",
    image: "https://images.unsplash.com/photo-1588449668365-d15e397f6787?auto=format&fit=crop&q=80&w=1964&ixlib=rb-4.0.3",
    category: "Music",
    createdAt: "4 days ago",
  }
];

export default function MarketplacePage() {
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  
  const categories = [
    { name: "All Categories", icon: <Tag className="h-5 w-5" /> },
    { name: "Vehicles", icon: <Car className="h-5 w-5" /> },
    { name: "Real Estate", icon: <Home className="h-5 w-5" /> },
    { name: "Furniture", icon: <Sofa className="h-5 w-5" /> },
    { name: "Electronics", icon: <Tag className="h-5 w-5" /> },
    { name: "Sports", icon: <Tag className="h-5 w-5" /> },
    { name: "Music", icon: <Tag className="h-5 w-5" /> },
    { name: "Clothing", icon: <Tag className="h-5 w-5" /> },
  ];
  
  // Filter listings by category if a category is selected
  const filteredListings = categoryFilter
    ? marketplaceListings.filter(listing => listing.category === categoryFilter)
    : marketplaceListings;

  return (
    <>
      <Navbar />
      
      <main className="pt-16 md:pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex">
            <LeftSidebar />
            
            <div className="w-full lg:w-1/2 lg:ml-[25%] pt-4 pb-8">
              <div className="bg-white rounded-lg shadow mb-6">
                <div className="p-4 border-b">
                  <h1 className="text-2xl font-bold">Marketplace</h1>
                  <p className="text-gray-600">Buy and sell items with people in your community</p>
                </div>
                
                <div className="p-4 border-b">
                  <div className="relative mb-3">
                    <Input
                      type="text"
                      placeholder="Search Marketplace"
                      className="pl-10 pr-4 py-2 w-full"
                    />
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                  
                  <div className="flex justify-between">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span className="hidden sm:inline">New York</span>
                        <span className="sm:hidden">NY</span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      
                      <Select>
                        <SelectTrigger className="h-9 min-w-[130px]">
                          <SelectValue placeholder="Distance" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 miles</SelectItem>
                          <SelectItem value="10">10 miles</SelectItem>
                          <SelectItem value="20">20 miles</SelectItem>
                          <SelectItem value="50">50 miles</SelectItem>
                          <SelectItem value="any">Any Distance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button variant="default" size="sm" className="flex items-center gap-1">
                      <Plus className="h-4 w-4" />
                      <span>Sell</span>
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 p-4 border-b">
                  {categories.map((category) => (
                    <Button
                      key={category.name}
                      variant={categoryFilter === (category.name === "All Categories" ? null : category.name) ? "default" : "outline"}
                      className="flex flex-col items-center justify-center h-20 py-2"
                      onClick={() => setCategoryFilter(category.name === "All Categories" ? null : category.name)}
                    >
                      <div className="mb-1">{category.icon}</div>
                      <span className="text-xs text-center">{category.name}</span>
                    </Button>
                  ))}
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">
                      {categoryFilter ? `${categoryFilter} Items` : "Today's Picks"}
                    </h2>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <ArrowDownUp className="h-4 w-4" />
                        <span>Sort</span>
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <SlidersHorizontal className="h-4 w-4" />
                        <span>Filters</span>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredListings.map((listing) => (
                      <Card key={listing.id} className="overflow-hidden">
                        <div className="h-40 overflow-hidden">
                          <img 
                            src={listing.image} 
                            alt={listing.title}
                            className="w-full h-full object-cover transition-transform hover:scale-105"
                          />
                        </div>
                        <CardContent className="p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold truncate">${listing.price}</h3>
                              <p className="text-sm truncate">{listing.title}</p>
                              <div className="flex items-center text-gray-500 text-xs mt-1">
                                <MapPin className="h-3 w-3 mr-1" />
                                <span>{listing.location}</span>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">{listing.createdAt}</div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  {filteredListings.length === 0 && (
                    <div className="text-center py-12">
                      <Tag className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <h3 className="text-lg font-medium mb-1">No listings found</h3>
                      <p className="text-gray-500 mb-4">Try changing your search or filters</p>
                      <Button 
                        variant="outline"
                        onClick={() => setCategoryFilter(null)}
                      >
                        Clear filters
                      </Button>
                    </div>
                  )}
                  
                  {filteredListings.length > 0 && (
                    <div className="mt-8 text-center">
                      <Button variant="outline" className="w-full">
                        See More
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <RightSidebar />
          </div>
        </div>
      </main>
    </>
  );
}