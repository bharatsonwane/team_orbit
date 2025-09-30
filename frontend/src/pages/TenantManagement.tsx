import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Plus, 
  Users, 
  Calendar,
  Archive,
  Edit,
  Eye,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Tenant creation form schema
const createTenantFormSchema = z.object({
  name: z.string().min(2, 'Tenant name must be at least 2 characters').max(255),
  label: z.string().min(2, 'Tenant label must be at least 2 characters').max(255),
  description: z.string().optional(),
  adminUser: z.object({
    email: z.string().email('Invalid email format'),
    firstName: z.string().min(1, 'First name is required').max(100),
    lastName: z.string().min(1, 'Last name is required').max(100),
    phone: z.string().optional(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

type CreateTenantFormData = z.infer<typeof createTenantFormSchema>;

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
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateTenantFormData>({
    resolver: zodResolver(createTenantFormSchema),
  });

  const onSubmitCreateTenant = async (data: CreateTenantFormData) => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      console.log('Creating tenant:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock response
      const newTenant = {
        id: tenants.length + 1,
        name: data.name,
        label: data.label,
        description: data.description || '',
        isArchived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userCount: 1, // Just the admin user
      };

      setTenants(prev => [newTenant, ...prev]);
      setIsCreateDialogOpen(false);
      reset();
    } catch (error) {
      console.error('Error creating tenant:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <AppLayout
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Tenant Management' },
      ]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Tenant Management</h1>
            <p className="text-muted-foreground">
              Manage organizations and their administrative users
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Tenant
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Tenant</DialogTitle>
                <DialogDescription>
                  Create a new organization and its administrative user account.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit(onSubmitCreateTenant)}>
                <div className="space-y-6">
                  {/* Tenant Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Tenant Information</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Tenant Name *</Label>
                        <Input
                          id="name"
                          placeholder="acme-corp"
                          {...register('name')}
                        />
                        {errors.name && (
                          <p className="text-sm text-destructive">{errors.name.message}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="label">Display Label *</Label>
                        <Input
                          id="label"
                          placeholder="ACME Corporation"
                          {...register('label')}
                        />
                        {errors.label && (
                          <p className="text-sm text-destructive">{errors.label.message}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Brief description of the organization"
                        {...register('description')}
                      />
                      {errors.description && (
                        <p className="text-sm text-destructive">{errors.description.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Admin User Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Tenant Administrator</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="adminUser.firstName">First Name *</Label>
                        <Input
                          id="adminUser.firstName"
                          placeholder="John"
                          {...register('adminUser.firstName')}
                        />
                        {errors.adminUser?.firstName && (
                          <p className="text-sm text-destructive">{errors.adminUser.firstName.message}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="adminUser.lastName">Last Name *</Label>
                        <Input
                          id="adminUser.lastName"
                          placeholder="Doe"
                          {...register('adminUser.lastName')}
                        />
                        {errors.adminUser?.lastName && (
                          <p className="text-sm text-destructive">{errors.adminUser.lastName.message}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="adminUser.email">Email *</Label>
                      <Input
                        id="adminUser.email"
                        type="email"
                        placeholder="admin@acme-corp.com"
                        {...register('adminUser.email')}
                      />
                      {errors.adminUser?.email && (
                        <p className="text-sm text-destructive">{errors.adminUser.email.message}</p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="adminUser.phone">Phone</Label>
                        <Input
                          id="adminUser.phone"
                          placeholder="+1234567890"
                          {...register('adminUser.phone')}
                        />
                        {errors.adminUser?.phone && (
                          <p className="text-sm text-destructive">{errors.adminUser.phone.message}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="adminUser.password">Password *</Label>
                        <Input
                          id="adminUser.password"
                          type="password"
                          placeholder="Secure password"
                          {...register('adminUser.password')}
                        />
                        {errors.adminUser?.password && (
                          <p className="text-sm text-destructive">{errors.adminUser.password.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <DialogFooter className="mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Create Tenant'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tenants Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tenants.map((tenant) => (
            <Card key={tenant.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{tenant.label}</CardTitle>
                  </div>
                  {tenant.isArchived && (
                    <Badge variant="secondary">
                      <Archive className="h-3 w-3 mr-1" />
                      Archived
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">
                    {tenant.name}
                  </code>
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {tenant.description && (
                  <p className="text-sm text-muted-foreground">
                    {tenant.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{tenant.userCount} users</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(tenant.createdAt)}</span>
                  </div>
                </div>
                
                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {tenants.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Tenants Found</h3>
              <p className="text-muted-foreground text-center mb-4">
                Get started by creating your first tenant organization.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Tenant
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
