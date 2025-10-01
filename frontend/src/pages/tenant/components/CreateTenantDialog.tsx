import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTenantFormSchema, type CreateTenantFormData, type Tenant } from '@/schemas/tenant';

interface CreateTenantDialogProps {
  onTenantCreated?: (tenant: Tenant) => void;
  triggerButton?: React.ReactNode;
}

export function CreateTenantDialog({ 
  onTenantCreated, 
  triggerButton 
}: CreateTenantDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
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
        id: Date.now(), // Using timestamp as mock ID
        name: data.name,
        label: data.label,
        description: data.description || '',
        isArchived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userCount: 1, // Just the admin user
      };

      // Call the callback if provided
      onTenantCreated?.(newTenant);

      // Close dialog and reset form
      setIsOpen(false);
      reset();
    } catch (error) {
      console.error('Error creating tenant:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button>
            <Plus className='h-4 w-4 mr-2' />
            Create Tenant
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Create New Tenant</DialogTitle>
          <DialogDescription>
            Create a new organization and its administrative user account.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitCreateTenant)}>
          <div className='space-y-6'>
            {/* Tenant Information */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold'>Tenant Information</h3>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='name'>Tenant Name *</Label>
                  <Input
                    id='name'
                    placeholder='acme-corp'
                    {...register('name')}
                  />
                  {errors.name && (
                    <p className='text-sm text-destructive'>
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='label'>Display Label *</Label>
                  <Input
                    id='label'
                    placeholder='ACME Corporation'
                    {...register('label')}
                  />
                  {errors.label && (
                    <p className='text-sm text-destructive'>
                      {errors.label.message}
                    </p>
                  )}
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='description'>Description</Label>
                <Textarea
                  id='description'
                  placeholder='Brief description of the organization'
                  {...register('description')}
                />
                {errors.description && (
                  <p className='text-sm text-destructive'>
                    {errors.description.message}
                  </p>
                )}
              </div>
            </div>

            {/* Admin User Information */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold'>Tenant Administrator</h3>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='adminUser.firstName'>First Name *</Label>
                  <Input
                    id='adminUser.firstName'
                    placeholder='John'
                    {...register('adminUser.firstName')}
                  />
                  {errors.adminUser?.firstName && (
                    <p className='text-sm text-destructive'>
                      {errors.adminUser.firstName.message}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='adminUser.lastName'>Last Name *</Label>
                  <Input
                    id='adminUser.lastName'
                    placeholder='Doe'
                    {...register('adminUser.lastName')}
                  />
                  {errors.adminUser?.lastName && (
                    <p className='text-sm text-destructive'>
                      {errors.adminUser.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='adminUser.email'>Email *</Label>
                <Input
                  id='adminUser.email'
                  type='email'
                  placeholder='admin@acme-corp.com'
                  {...register('adminUser.email')}
                />
                {errors.adminUser?.email && (
                  <p className='text-sm text-destructive'>
                    {errors.adminUser.email.message}
                  </p>
                )}
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='adminUser.phone'>Phone</Label>
                  <Input
                    id='adminUser.phone'
                    placeholder='+1234567890'
                    {...register('adminUser.phone')}
                  />
                  {errors.adminUser?.phone && (
                    <p className='text-sm text-destructive'>
                      {errors.adminUser.phone.message}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='adminUser.password'>Password *</Label>
                  <Input
                    id='adminUser.password'
                    type='password'
                    placeholder='Secure password'
                    {...register('adminUser.password')}
                  />
                  {errors.adminUser?.password && (
                    <p className='text-sm text-destructive'>
                      {errors.adminUser.password.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className='mt-6'>
            <Button type='button' variant='outline' onClick={handleCancel}>
              Cancel
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Tenant'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
