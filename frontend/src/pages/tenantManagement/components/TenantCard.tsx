import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
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
  Edit,
  Eye,
} from 'lucide-react';
import { type Tenant } from './CreateTenantDialog';

interface TenantCardProps {
  tenant: Tenant;
  onEdit?: (tenant: Tenant) => void;
}

export function TenantCard({ tenant, onEdit }: TenantCardProps) {
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
    navigate(`/tenant-management/${tenant.id}`);
  };

  const handleEdit = () => {
    // Call the onEdit callback if provided, otherwise navigate to edit page
    if (onEdit) {
      onEdit(tenant);
    } else {
      // TODO: Navigate to edit page when implemented
      console.log('Edit tenant:', tenant);
    }
  };

  return (
    <Card key={tenant.id} className='relative'>
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

        <div className='flex space-x-2 pt-2'>
          <Button 
            variant='outline' 
            size='sm' 
            className='flex-1'
            onClick={handleView}
          >
            <Eye className='h-4 w-4 mr-1' />
            View
          </Button>
          <Button 
            variant='outline' 
            size='sm' 
            className='flex-1'
            onClick={handleEdit}
          >
            <Edit className='h-4 w-4 mr-1' />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
