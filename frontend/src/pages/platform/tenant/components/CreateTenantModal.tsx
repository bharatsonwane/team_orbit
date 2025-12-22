import { useState, Fragment } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  InputWithLabel,
  SelectWithLabel,
} from "@/components/ui/input-with-label";
import { Plus, XIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSelector, useDispatch } from "react-redux";
import {
  createTenantFormSchema,
  type CreateTenantFormData,
} from "@/schemaTypes/tenantSchemaTypes";
import { selectLookupTypeByName } from "@/redux/slices/lookupSlice";
import { createTenantAction } from "@/redux/actions/tenantActions";
import { LoadingSpinner } from "@/components/ui/loading-indicator";
import type { RootState, AppDispatch } from "@/redux/store";

interface CreateTenantModalProps {
  onTenantCreated?: () => void;
  triggerButton?: React.ReactNode;
}

export function CreateTenantModal({
  onTenantCreated,
  triggerButton,
}: CreateTenantModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  // Get tenant status lookup data
  const tenantStatusType = useSelector((state: RootState) =>
    selectLookupTypeByName(state, "TENANT_STATUS")
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
      const selectedStatus = tenantStatusType?.lookups.find(
        item => item.name === data.status
      );
      const statusId = selectedStatus?.id || 12; // Default to ACTIVE status

      // Prepare API request data
      const createTenantData = {
        name: data.name,
        label: data.label,
        description: data.description || "",
        statusId: statusId,
      };

      // Dispatch create tenant action
      await dispatch(createTenantAction(createTenantData)).unwrap();

      // Call the callback if provided
      onTenantCreated?.();

      // Close dialog and reset form
      setIsOpen(false);
      reset();
    } catch (error) {
      console.error("Error creating tenant:", error);
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
    <Drawer open={isOpen} onOpenChange={setIsOpen} direction="right">
      <DrawerTrigger asChild>
        {triggerButton || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Tenant
          </Button>
        )}
      </DrawerTrigger>
      <DrawerContent className="h-screen flex flex-col p-0">
        <DrawerHeader className="flex-shrink-0 p-6 pb-4 relative">
          <DrawerTitle>Create New Tenant</DrawerTitle>
          <DrawerDescription>
            Create a new organization with basic information.
          </DrawerDescription>
          <DrawerClose className="absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none cursor-pointer">
            <XIcon className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DrawerClose>
        </DrawerHeader>

        <form
          onSubmit={handleSubmit(onSubmitCreateTenant)}
          className="flex flex-col flex-1 min-h-0"
        >
          <div className="flex-1 overflow-y-auto px-6 min-h-0">
            <div className="space-y-4">
              {/* Tenant Name */}
              <InputWithLabel
                id="name"
                label="Tenant Name"
                placeholder="acme_corp"
                required
                register={register}
                error={errors.name?.message}
                helperText="Only letters, numbers, and underscores allowed"
              />

              {/* Label */}
              <InputWithLabel
                id="label"
                label="Label"
                placeholder="ACME Corporation"
                maxLength={50}
                required
                register={register}
                error={errors.label?.message}
              />

              {/* Description */}
              <InputWithLabel
                id="description"
                label="Description"
                placeholder="Brief description of the organization"
                variant="textarea"
                register={register}
                error={errors.description?.message}
              />

              {/* Status */}
              <SelectWithLabel
                id="status"
                label="Status"
                required
                register={register}
                error={errors.status?.message}
              >
                <option value="">Select a status</option>
                {tenantStatusType?.lookups.map(item => (
                  <option key={item.id} value={item.name}>
                    {item.label}
                  </option>
                ))}
              </SelectWithLabel>
            </div>
          </div>

          <DrawerFooter className="flex-shrink-0 p-6 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Fragment>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Creating...
                </Fragment>
              ) : (
                "Create Tenant"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
