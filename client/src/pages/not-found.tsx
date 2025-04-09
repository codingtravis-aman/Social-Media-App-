import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Search, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLocation, Link } from "wouter";
import { useEffect } from "react";
import DynamicMetadata from "@/components/seo/dynamic-metadata";

export default function NotFound() {
  const [_, navigate] = useLocation();

  // For SEO, let search engines know this is a 404 page
  useEffect(() => {
    // Set HTTP status code to 404 for web crawlers (this helps SEO)
    const metaRobots = document.createElement('meta');
    metaRobots.name = 'robots';
    metaRobots.content = 'noindex';
    document.head.appendChild(metaRobots);

    return () => {
      document.head.removeChild(metaRobots);
    };
  }, []);

  return (
    <>
      <DynamicMetadata 
        title="Page Not Found" 
        description="The page you're looking for doesn't exist or has been moved."
      />
      
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="w-full max-w-md mx-4 overflow-hidden shadow-lg border-foreground/10">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center mb-6">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ rotate: 10, scale: 0.9 }}
                  className="text-destructive bg-destructive/10 p-3 rounded-full mb-3"
                >
                  <AlertCircle className="h-8 w-8" />
                </motion.div>
                
                <h1 className="text-4xl font-extrabold tracking-tight mb-2">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">
                    404
                  </span>
                </h1>
                
                <h2 className="text-2xl font-bold tracking-tight mb-4">Page Not Found</h2>
                
                <p className="text-muted-foreground">
                  The page you are looking for doesn't exist or has been moved.
                </p>
              </div>
              
              <div className="space-y-3">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    className="w-full flex gap-2" 
                    onClick={() => navigate("/")}
                  >
                    Return to Home
                  </Button>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    variant="outline" 
                    className="w-full gap-2" 
                    onClick={() => window.history.back()}
                  >
                    <ArrowLeft className="h-4 w-4" /> Go Back
                  </Button>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    variant="ghost" 
                    className="w-full gap-2"
                    onClick={() => navigate("/search")}
                  >
                    <Search className="h-4 w-4" /> Search Yoop
                  </Button>
                </motion.div>
              </div>
              
              <div className="mt-6 pt-4 border-t text-center text-sm text-muted-foreground">
                If you believe this is a mistake, please <Link href="/help" className="text-primary hover:underline">contact support</Link>.
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
}
