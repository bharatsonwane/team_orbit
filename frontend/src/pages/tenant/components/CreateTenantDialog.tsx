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
import { InputWithLabel, SelectWithLabel } from '@/components/ui/input-with-label';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSelector, useDispatch } from 'react-redux';
import { createTenantFormSchema, type CreateTenantFormData, type Tenant } from '@/schemas/tenant';
import { selectLookupTypeByName } from '@/redux/slices/lookupSlice';
import { createTenantAction } from '@/redux/actions/tenantActions';
import { LoadingSpinner } from '@/components/ui/loading-indicator';
import type { RootState, AppDispatch } from '@/redux/store';


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
  const dispatch = useDispatch<AppDispatch>();

  // Get tenant status lookup data
  const tenantStatusType = useSelector((state: RootState) => 
    selectLookupTypeByName(state, 'TENANT_STATUS')
  );

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
      // Find statusId from lookup data
      const selectedStatus = tenantStatusType?.lookups.find(item => item.name === data.status);
      const statusId = selectedStatus?.id || 12; // Default to ACTIVE status

      // Prepare API request data
      const createTenantData = {
        name: data.name,
        label: data.label,
        description: data.description || '',
        statusId: statusId,
      };

      // Dispatch create tenant action
      const result = await dispatch(createTenantAction(createTenantData)).unwrap();

      // Call the callback if provided
      onTenantCreated?.(result);

      // Close dialog and reset form
      setIsOpen(false);
      reset();
    } catch (error) {
      console.error('Error creating tenant:', error);
      // TODO: Show toast notification for error
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
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle>Create New Tenant</DialogTitle>
          <DialogDescription>
            Create a new organization with basic information.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitCreateTenant)}>
          <div className='space-y-4'>
            {/* Tenant Name */}
            <InputWithLabel
              id='name'
              label='Tenant Name'
              placeholder='acme_corp'
              required
              register={register}
              error={errors.name?.message}
              helperText='Only letters, numbers, and underscores allowed'
            />

            {/* Label */}
            <InputWithLabel
              id='label'
              label='Label'
              placeholder='ACME Corporation'
              maxLength={50}
              required
              register={register}
              error={errors.label?.message}
            />

            {/* Description */}
            <InputWithLabel
              id='description'
              label='Description'
              placeholder='Brief description of the organization'
              variant='textarea'
              register={register}
              error={errors.description?.message}
            />

            {/* Status */}
            <SelectWithLabel
              id='status'
              label='Status'
              required
              register={register}
              error={errors.status?.message}
            >
              <option value=''>Select a status</option>
              {tenantStatusType?.lookups.map((item) => (
                <option key={item.id} value={item.name}>
                  {item.label}
                </option>
              ))}
            </SelectWithLabel>
          </div>

          <DialogFooter className='mt-6'>
            <Button type='button' variant='outline' onClick={handleCancel}>
              Cancel
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading ? (
                <>
                  <LoadingSpinner size='sm' className='mr-2' />
                  Creating...
                </>
              ) : (
                'Create Tenant'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
