import { type ReactNode } from 'react';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export interface BreadcrumbLayoutProps {
  label: string;
  href?: string;
}

export function HeaderLayout({
  breadcrumbs,
}: {
  breadcrumbs: BreadcrumbLayoutProps[];
}) {
  // Only render header if there are breadcrumbs
  if (!breadcrumbs || breadcrumbs.length === 0) {
    return null;
  }

  return (
    <header className='flex h-10 shrink-0 items-center gap-2 border-b px-4 pl-12'>
      <Separator orientation='vertical' className='mr-2 h-4' />
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((breadcrumb, index) => (
            <div key={index} className='flex items-center'>
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
      <SidebarInset className='relative'>
        {/* Sidebar trigger - floating above content */}
        <div className='absolute top-5 left-4 z-10'>
          <SidebarTrigger className='bg-background/80 backdrop-blur-sm border shadow-sm hover:bg-background' />
        </div>

        {/* Main content area - full height */}
        <div className='flex flex-1 flex-col gap-4 p-4'>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
