import { ReactNode } from "react";
import { Navbar } from "@/components/layout/navbar";
import { LeftSidebar } from "@/components/layout/left-sidebar";
import { RightSidebar } from "@/components/layout/right-sidebar";

interface LayoutProps {
  children: ReactNode;
  hideRightSidebar?: boolean;
}

export function Layout({ children, hideRightSidebar = false }: LayoutProps) {
  return (
    <>
      <Navbar />
      
      <main className="pt-16 md:pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex">
            <LeftSidebar />
            
            <div className={`w-full ${hideRightSidebar ? 'lg:w-3/4 lg:ml-[25%]' : 'lg:w-1/2 lg:ml-[25%]'} pt-4 pb-8`}>
              {children}
            </div>
            
            {!hideRightSidebar && <RightSidebar />}
          </div>
        </div>
      </main>
    </>
  );
}