import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  Users,
  Calendar,
  Archive,
} from 'lucide-react';
import { type Tenant } from '@/schemas/tenant';

interface TenantCardProps {
  tenant: Tenant;
}

export function TenantCard({ tenant }: TenantCardProps) {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleView = () => {
    // Navigate to tenant detail page
    navigate(`/tenant/${tenant.id}`);
  };

  return (
    <Card key={tenant.id} className='relative' onClick={handleView}>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <Building2 className='h-5 w-5 text-primary' />
            <CardTitle className='text-lg'>{tenant.label}</CardTitle>
          </div>
          {tenant.isArchived && (
            <Badge variant='secondary'>
              <Archive className='h-3 w-3 mr-1' />
              Archived
            </Badge>
          )}
        </div>
        <CardDescription>
          <code className='text-xs bg-muted px-1 py-0.5 rounded'>
            {tenant.name}
          </code>
        </CardDescription>
      </CardHeader>

      <CardContent className='space-y-4'>
        {tenant.description && (
          <p className='text-sm text-muted-foreground'>
            {tenant.description}
          </p>
        )}

        <div className='flex items-center justify-between text-sm'>
          <div className='flex items-center space-x-1'>
            <Users className='h-4 w-4 text-muted-foreground' />
            <span>{tenant.userCount} users</span>
          </div>
          <div className='flex items-center space-x-1'>
            <Calendar className='h-4 w-4 text-muted-foreground' />
            <span>{formatDate(tenant.createdAt)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
