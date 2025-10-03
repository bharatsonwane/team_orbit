import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, X, Edit } from 'lucide-react';
import type { Tenant } from '@/schemas/tenant';

// Edit tenant form schema
const editTenantFormSchema = z.object({
  label: z.string().min(2, 'Tenant label must be at least 2 characters').max(255),
  description: z.string().optional(),
  isArchived: z.boolean(),
});

export type EditTenantFormData = z.infer<typeof editTenantFormSchema>;

interface EditTenantDialogProps {
  tenant: Tenant | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EditTenantFormData) => Promise<void>;
}

export function EditTenantDialog({
  tenant,
  isOpen,
  onClose,
  onSave,
}: EditTenantDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<EditTenantFormData>({
    resolver: zodResolver(editTenantFormSchema),
    defaultValues: {
      label: '',
      description: '',
      isArchived: false,
    },
  });

  // Watch the isArchived field for the switch
  const isArchived = watch('isArchived');

  // Reset form when tenant changes or dialog opens
  useEffect(() => {
    if (isOpen && tenant) {
      reset({
        label: tenant.label,
        description: tenant.description || '',
        isArchived: tenant.isArchived,
      });
    }
  }, [isOpen, tenant, reset]);

  const onSubmit = async (data: EditTenantFormData) => {
    try {
      setIsLoading(true);
      await onSave(data);
      onClose();
    } catch (error) {
      console.error('Error saving tenant:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Edit className='h-5 w-5' />
            Edit Tenant
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div className='space-y-4'>
            {/* Tenant Name - Read Only */}
            <div className='space-y-2'>
              <Label htmlFor='name'>Tenant Name</Label>
              <Input
                id='name'
                value={tenant?.name || ''}
                readOnly
                className='bg-gray-50 cursor-not-allowed'
                placeholder='Tenant name (read-only)'
              />
              <p className='text-xs text-gray-500'>Tenant name cannot be changed</p>
            </div>

            {/* Tenant Label */}
            <div className='space-y-2'>
              <Label htmlFor='label'>Display Label *</Label>
              <Input
                id='label'
                {...register('label')}
                placeholder='Enter display label'
                className={errors.label ? 'border-red-500' : ''}
              />
              {errors.label && (
                <p className='text-sm text-red-500'>{errors.label.message}</p>
              )}
            </div>

            {/* Description */}
            <div className='space-y-2'>
              <Label htmlFor='description'>Description</Label>
              <Textarea
                id='description'
                {...register('description')}
                placeholder='Enter tenant description (optional)'
                rows={3}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className='text-sm text-red-500'>{errors.description.message}</p>
              )}
            </div>

            {/* Archive Status */}
            <div className='flex items-center space-x-2'>
              <Switch
                id='isArchived'
                checked={isArchived}
                onCheckedChange={(checked) => setValue('isArchived', checked)}
              />
              <Label htmlFor='isArchived'>Archived</Label>
            </div>
          </div>

          <DialogFooter className='flex gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={handleCancel}
              disabled={isLoading}
            >
              <X className='h-4 w-4 mr-2' />
              Cancel
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  Saving...
                </>
              ) : (
                <>
                  <Save className='h-4 w-4 mr-2' />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
