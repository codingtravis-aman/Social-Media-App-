import { useState } from "react";
import { Link } from "wouter";
import { Collection } from "@shared/schema";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FolderIcon, 
  Pencil, 
  Trash2, 
  ImageIcon, 
  Eye, 
  Clock,
  Settings,
  MoreVertical
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { EditCollectionDialog } from "./edit-collection-dialog";
import { format } from "date-fns";

interface CollectionCardProps {
  collection: Collection;
}

export function CollectionCard({ collection }: CollectionCardProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  const getItemCount = () => {
    if (!collection.items) return 0;
    return collection.items.length;
  };

  return (
    <>
      <Card className="group overflow-hidden transition-all hover:shadow-md">
        <Link href={`/collections/${collection.id}`}>
          <div className="aspect-video bg-muted relative overflow-hidden">
            {collection.coverImage ? (
              <img 
                src={collection.coverImage} 
                alt={collection.name}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <FolderIcon className="h-12 w-12 text-muted-foreground opacity-50" />
              </div>
            )}
            
            {collection.isDefault && (
              <Badge 
                className="absolute top-2 left-2 bg-primary/80 hover:bg-primary/80"
                variant="secondary"
              >
                Default
              </Badge>
            )}
            
            {!collection.isDefault && (
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-background/80 hover:bg-background"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setEditDialogOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </Link>
        
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Link href={`/collections/${collection.id}`} className="hover:underline">
              <h3 className="font-semibold text-lg truncate">{collection.name}</h3>
            </Link>
            
            {!collection.isDefault && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setEditDialogOpen(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          
          {collection.description && (
            <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
              {collection.description}
            </p>
          )}
          
          <div className="flex items-center mt-3 text-xs text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            <span>
              Created {collection.createdAt ? format(new Date(collection.createdAt), 'MMM d, yyyy') : 'recently'}
            </span>
          </div>
        </CardContent>
        
        <CardFooter className="p-4 pt-0 flex justify-between">
          <div className="text-sm text-muted-foreground">
            {getItemCount()} items
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            asChild
            className="h-8 hover:bg-primary/10 hover:text-primary"
          >
            <Link href={`/collections/${collection.id}`}>
              <Eye className="mr-1 h-3.5 w-3.5" />
              View
            </Link>
          </Button>
        </CardFooter>
      </Card>
      
      {/* Edit Collection Dialog */}
      <EditCollectionDialog
        collection={collection}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </>
  );
}