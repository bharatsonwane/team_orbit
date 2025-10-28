import { Fragment, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";

export interface BreadcrumbLayoutProps {
  label: string;
  href?: string;
}

export interface HeaderLayoutProps {
  breadcrumbs: BreadcrumbLayoutProps[];
  showBackButton?: boolean;
  handleNavigate?: () => void;
}

export function HeaderLayout({
  breadcrumbs,
  showBackButton = true,
  handleNavigate,
}: HeaderLayoutProps) {
  const navigate = useNavigate();

  // Only render header if there are breadcrumbs
  if (!breadcrumbs || breadcrumbs.length === 0) {
    return null;
  }

  const handleBackClick = () => {
    if (handleNavigate) {
      handleNavigate();
    } else {
      navigate(-1); // Go back to previous page in browser history
    }
  };

  return (
    <header className="flex min-h-10 shrink-0 items-center gap-2 border-b px-4 pl-12 py-2">
      <Separator orientation="vertical" className="h-4" />
      {showBackButton && (
        <Fragment>
          <Button variant="outline" size="sm" onClick={handleBackClick}>
            <ArrowLeft className="h-4 w-4 m-1" />
          </Button>
          <Separator orientation="vertical" className="mr-2 h-4" />
        </Fragment>
      )}
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((breadcrumb, index) => (
            <div key={index} className="flex items-center">
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {breadcrumb.href ? (
                  <BreadcrumbLink href={breadcrumb.href}>
                    {breadcrumb.label}
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </div>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="relative">
        {/* Sidebar trigger - floating above content */}
        <div className="absolute top-6 left-4 z-10">
          <SidebarTrigger className="bg-background/80 backdrop-blur-sm border shadow-sm hover:bg-background" />
        </div>

        {/* Main content area - full height */}
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
