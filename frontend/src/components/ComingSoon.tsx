import { useLocation } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Construction, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface ComingSoonProps {
  title?: string;
  description?: string;
}

export function ComingSoon({ title, description }: ComingSoonProps) {
  const location = useLocation();
  
  // Generate breadcrumbs from the current path
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => ({
    label: segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' '),
    href: index === pathSegments.length - 1 ? undefined : `/${pathSegments.slice(0, index + 1).join('/')}`,
  }));

  // Add "Dashboard" as the first breadcrumb if there are segments
  if (breadcrumbs.length > 0) {
    breadcrumbs.unshift({ label: 'Dashboard', href: '/dashboard' });
  }

  const pageTitle = title || pathSegments[pathSegments.length - 1]?.charAt(0).toUpperCase() + 
    pathSegments[pathSegments.length - 1]?.slice(1).replace('-', ' ') || 'Feature';
  
  const pageDescription = description || 'This feature is currently under development and will be available soon.';

  return (
      <div className="flex flex-1 items-center justify-center">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center">
                <Construction className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl">{pageTitle}</CardTitle>
            <CardDescription className="text-center">
              {pageDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Badge variant="secondary" className="text-sm">
              Coming Soon
            </Badge>
            <p className="text-sm text-muted-foreground">
              This feature is being developed and will be available in a future update.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
  );
}
