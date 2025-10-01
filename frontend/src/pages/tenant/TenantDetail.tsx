import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { type Tenant } from './components/CreateTenantDialog';

// Mock tenant user data - replace with actual API calls
const mockTenantUsers = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@acme-corp.com',
    phone: '+1234567890',
    title: 'Mr',
    role: 'Admin',
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@acme-corp.com',
    phone: '+1234567891',
    title: 'Ms',
    role: 'User',
    isActive: true,
    createdAt: '2024-01-20T14:30:00Z',
  },
  {
    id: 3,
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike.johnson@acme-corp.com',
    phone: '+1234567892',
    title: 'Dr',
    role: 'Manager',
    isActive: false,
    createdAt: '2024-02-01T09:15:00Z',
  },
];

// Mock tenant data - replace with actual API call
const mockTenantData: Tenant = {
  id: 1,
  name: 'acme-corp',
  label: 'ACME Corporation',
  description: 'Leading technology company specializing in innovative solutions',
  isArchived: false,
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
  userCount: 3,
};

export default function TenantDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [users, setUsers] = useState(mockTenantUsers);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API call
    const fetchTenantData = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data - in real app, fetch by ID from params
        setTenant(mockTenantData);
        setUsers(mockTenantUsers);
      } catch (error) {
        console.error('Error fetching tenant data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTenantData();
  }, [id]);

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
    // TODO: Navigate to edit page or open edit modal
    console.log('Edit tenant:', tenant);
  };

  const handleAddUser = () => {
    // TODO: Open add user modal or navigate to add user page
    console.log('Add user to tenant:', tenant?.id);
  };

  const handleEditUser = (userId: number) => {
    // TODO: Navigate to edit user page or open edit modal
    console.log('Edit user:', userId);
  };

  if (loading) {
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
            <Button
              variant='outline'
              size='sm'
              onClick={() => navigate('/tenant-list')}
            >
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back
            </Button>
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
                            {user.title} {user.firstName} {user.lastName}
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
                      <Badge variant={user.role === 'Admin' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? 'default' : 'secondary'}>
                        {user.isActive ? 'Active' : 'Inactive'}
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
    </>
  );
}
