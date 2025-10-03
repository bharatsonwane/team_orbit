import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Building2,
  Users,
  Calendar,
  Archive,
  ArrowLeft,
  Edit,
  Plus,
  Mail,
  Phone,
  User,
} from 'lucide-react';
import { HeaderLayout } from '@/components/AppLayout';
import { getTenantAction, getTenantUsersAction, updateTenantAction } from '@/redux/actions/tenantActions';
import { selectCurrentTenant, selectTenantUsers, selectTenantLoading, selectTenantError } from '@/redux/slices/tenantSlice';
import type { AppDispatch } from '@/redux/store';
import { EditTenantDialog, type EditTenantFormData } from './components/EditTenantDialog';

export default function TenantDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const tenant = useSelector(selectCurrentTenant);
  const users = useSelector(selectTenantUsers);
  const isLoading = useSelector(selectTenantLoading);
  const error = useSelector(selectTenantError);
  
  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      const tenantId = parseInt(id);
      // Fetch tenant details and users
      dispatch(getTenantAction(tenantId));
      dispatch(getTenantUsersAction(tenantId));
    }
  }, [dispatch, id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleEditTenant = () => {
    setIsEditModalOpen(true);
  };

  const handleSaveTenant = async (data: EditTenantFormData) => {
    if (!tenant) return;
    
    await dispatch(updateTenantAction({
      tenantId: tenant.id,
      updateData: {
        label: data.label,
        description: data.description,
        isArchived: data.isArchived,
      }
    })).unwrap();
  };

  const handleAddUser = () => {
    // TODO: Open add user modal or navigate to add user page
    console.log('Add user to tenant:', tenant?.id);
  };

  const handleEditUser = (userId: number) => {
    // TODO: Navigate to edit user page or open edit modal
    console.log('Edit user:', userId);
  };

  if (isLoading) {
    return (
      <>
        <HeaderLayout
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Tenants', href: '/tenant-list' },
            { label: 'Loading...' },
          ]}
        />
        <div className='flex items-center justify-center py-12'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
            <p className='text-muted-foreground'>Loading tenant details...</p>
          </div>
        </div>
      </>
    );
  }

  // Show error state
  if (error) {
    return (
      <>
        <HeaderLayout
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Tenants', href: '/tenant-list' },
            { label: 'Error' },
          ]}
        />
        <div className='flex items-center justify-center py-12'>
          <div className='text-center'>
            <Building2 className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
            <h2 className='text-2xl font-semibold mb-2'>Error Loading Tenant</h2>
            <p className='text-muted-foreground mb-4'>{error}</p>
            <Button onClick={() => navigate('/tenant-list')}>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back to Tenants
            </Button>
          </div>
        </div>
      </>
    );
  }

  if (!tenant) {
    return (
      <>
        <HeaderLayout
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Tenants', href: '/tenant-list' },
            { label: 'Not Found' },
          ]}
        />
        <div className='flex items-center justify-center py-12'>
          <div className='text-center'>
            <Building2 className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
            <h2 className='text-2xl font-semibold mb-2'>Tenant Not Found</h2>
            <p className='text-muted-foreground mb-4'>
              The requested tenant could not be found.
            </p>
            <Button onClick={() => navigate('/tenant-list')}>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back to Tenants
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <HeaderLayout
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Tenants', href: '/tenant-list' },
          { label: tenant.label },
        ]}
      />
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-4'>
            <div>
              <h1 className='text-3xl font-bold flex items-center gap-3'>
                <Building2 className='h-8 w-8 text-primary' />
                {tenant.label}
              </h1>
              <p className='text-muted-foreground'>
                <code className='text-sm bg-muted px-2 py-1 rounded'>
                  {tenant.name}
                </code>
              </p>
            </div>
          </div>
          <div className='flex items-center space-x-2'>
            {tenant.isArchived && (
              <Badge variant='secondary'>
                <Archive className='h-3 w-3 mr-1' />
                Archived
              </Badge>
            )}
            <Button onClick={handleEditTenant}>
              <Edit className='h-4 w-4 mr-2' />
              Edit Tenant
            </Button>
          </div>
        </div>

        {/* Tenant Information */}
        <Card>
          <CardHeader>
            <CardTitle>Tenant Information</CardTitle>
            <CardDescription>
              Basic information about this organization
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <h4 className='font-medium'>Organization Name</h4>
                <p className='text-sm text-muted-foreground'>{tenant.label}</p>
              </div>
              <div className='space-y-2'>
                <h4 className='font-medium'>Tenant ID</h4>
                <code className='text-sm bg-muted px-2 py-1 rounded'>
                  {tenant.name}
                </code>
              </div>
              <div className='space-y-2'>
                <h4 className='font-medium'>Created</h4>
                <p className='text-sm text-muted-foreground'>
                  {formatDate(tenant.createdAt)}
                </p>
              </div>
              <div className='space-y-2'>
                <h4 className='font-medium'>Last Updated</h4>
                <p className='text-sm text-muted-foreground'>
                  {formatDate(tenant.updatedAt)}
                </p>
              </div>
            </div>
            {tenant.description && (
              <>
                <Separator />
                <div className='space-y-2'>
                  <h4 className='font-medium'>Description</h4>
                  <p className='text-sm text-muted-foreground'>
                    {tenant.description}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Users Section */}
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='flex items-center gap-2'>
                  <Users className='h-5 w-5' />
                  Tenant Users ({users.length})
                </CardTitle>
                <CardDescription>
                  Manage users within this organization
                </CardDescription>
              </div>
              <Button onClick={handleAddUser}>
                <Plus className='h-4 w-4 mr-2' />
                Add User
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className='flex items-center space-x-2'>
                        <User className='h-4 w-4 text-muted-foreground' />
                        <div>
                          <p className='font-medium'>
                            {user.firstName} {user.lastName}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center space-x-2'>
                        <Mail className='h-4 w-4 text-muted-foreground' />
                        <span className='text-sm'>{user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center space-x-2'>
                        <Phone className='h-4 w-4 text-muted-foreground' />
                        <span className='text-sm'>{user.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex flex-wrap gap-1'>
                        {user.userRoles.map(role => (
                          <Badge key={role.id} variant={role.name === 'TENANT_ADMIN' ? 'default' : 'secondary'}>
                            {role.label}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant='default'>
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center space-x-2'>
                        <Calendar className='h-4 w-4 text-muted-foreground' />
                        <span className='text-sm'>
                          {formatDate(user.createdAt)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className='text-right'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleEditUser(user.id)}
                      >
                        <Edit className='h-4 w-4 mr-1' />
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Edit Tenant Modal */}
      <EditTenantDialog
        tenant={tenant}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveTenant}
      />
    </>
  );
}
