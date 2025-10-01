import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Building2,
  Plus,
} from 'lucide-react';
import { HeaderLayout } from '@/components/AppLayout';
import { CreateTenantDialog, type Tenant } from './components/CreateTenantDialog';
import { TenantCard } from './components/TenantCard';


// Mock tenant data - replace with actual API calls
const mockTenants = [
  {
    id: 1,
    name: 'acme-corp',
    label: 'ACME Corporation',
    description: 'Leading technology company',
    isArchived: false,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    userCount: 45,
  },
  {
    id: 2,
    name: 'tech-startup',
    label: 'Tech Startup Inc',
    description: 'Innovative startup company',
    isArchived: false,
    createdAt: '2024-02-01T09:30:00Z',
    updatedAt: '2024-02-01T09:30:00Z',
    userCount: 12,
  },
];

export default function TenantManagement() {
  const [tenants, setTenants] = useState(mockTenants);

  const handleTenantCreated = (newTenant: Tenant) => {
    setTenants(prev => [newTenant, ...prev]);
  };

  const handleEditTenant = (tenant: Tenant) => {
    // TODO: Open edit modal or navigate to edit page
    console.log('Edit tenant:', tenant);
  };


  return (
    <>
      <HeaderLayout
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Tenant Management' },
          { label: 'List' },
        ]}
      />
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-foreground'>
              Tenant Management
            </h1>
            <p className='text-muted-foreground'>
              Manage organizations and their administrative users
            </p>
          </div>

          <CreateTenantDialog onTenantCreated={handleTenantCreated} />
        </div>

        {/* Tenants Grid */}
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {tenants.map(tenant => (
            <TenantCard
              key={tenant.id}
              tenant={tenant}
              onEdit={handleEditTenant}
            />
          ))}
        </div>

        {tenants.length === 0 && (
          <Card>
            <CardContent className='flex flex-col items-center justify-center py-12'>
              <Building2 className='h-12 w-12 text-muted-foreground mb-4' />
              <h3 className='text-lg font-semibold mb-2'>No Tenants Found</h3>
              <p className='text-muted-foreground text-center mb-4'>
                Get started by creating your first tenant organization.
              </p>
              <CreateTenantDialog 
                onTenantCreated={handleTenantCreated}
                triggerButton={
                  <Button>
                    <Plus className='h-4 w-4 mr-2' />
                    Create First Tenant
                  </Button>
                }
              />
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
