import { useState, useEffect, Fragment } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSelector, useDispatch } from "react-redux";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, X, Edit, XIcon } from "lucide-react";
import { SelectWithLabel } from "@/components/ui/input-with-label";
import { selectLookupTypeByName } from "@/redux/slices/lookupSlice";
import { lookupTypeKeys } from "@/utils/constants";
import { updateTenantAction } from "@/redux/actions/tenantActions";
import type { AppDispatch } from "@/redux/store";
import type { Tenant } from "@/schemas/tenant";

// Edit tenant form schema
const editTenantFormSchema = z.object({
  label: z
    .string()
    .min(2, "Tenant label must be at least 2 characters")
    .max(255),
  description: z.string().optional(),
  statusId: z.string().min(1, "Status is required"),
  isArchived: z.boolean(),
});

export type EditTenantFormData = z.infer<typeof editTenantFormSchema>;

interface EditTenantModalProps {
  tenant: Tenant | null;
  isOpen: boolean;
  onClose: () => void;
  onTenantUpdated?: () => void;
}

export function EditTenantModal({
  tenant,
  isOpen,
  onClose,
  onTenantUpdated,
}: EditTenantModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(false);

  // Get tenant statuses from lookup
  const tenantStatuses = useSelector((state: { lookup: any }) =>
    selectLookupTypeByName(state, lookupTypeKeys.TENANT_STATUS)
  );

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
      label: "",
      description: "",
      statusId: "",
      isArchived: false,
    },
  });

  // Watch the isArchived field for the switch
  const isArchived = watch("isArchived");

  // Reset form when tenant changes or dialog opens
  useEffect(() => {
    if (isOpen && tenant) {
      reset({
        label: tenant.label,
        description: tenant.description || "",
        statusId: tenant.statusId?.toString() || "",
        isArchived: tenant.isArchived,
      });
    }
  }, [isOpen, tenant, reset]);

  const onSubmit = async (data: EditTenantFormData) => {
    if (!tenant) return;

    try {
      setIsLoading(true);
      await dispatch(
        updateTenantAction({
          tenantId: tenant.id,
          updateData: {
            label: data.label,
            description: data.description,
            statusId: Number(data.statusId),
            isArchived: data.isArchived,
          },
        })
      ).unwrap();
      onTenantUpdated?.();
      onClose();
    } catch (error) {
      console.error("Error saving tenant:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose} direction="right">
      <DrawerContent className="h-screen flex flex-col p-0">
        <DrawerHeader className="flex-shrink-0 p-6 pb-4 relative">
          <DrawerTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Tenant
          </DrawerTitle>
          <DrawerClose className="absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none cursor-pointer">
            <XIcon className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DrawerClose>
        </DrawerHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1 min-h-0"
        >
          <div className="flex-1 overflow-y-auto px-6 min-h-0">
            <div className="space-y-4">
              {/* Tenant Name - Read Only */}
              <div className="space-y-2">
                <Label htmlFor="name">Tenant Name</Label>
                <Input
                  id="name"
                  value={tenant?.name || ""}
                  readOnly
                  className="bg-gray-50 cursor-not-allowed"
                  placeholder="Tenant name (read-only)"
                />
                <p className="text-xs text-gray-500">
                  Tenant name cannot be changed
                </p>
              </div>

              {/* Tenant Label */}
              <div className="space-y-2">
                <Label htmlFor="label">Display Label *</Label>
                <Input
                  id="label"
                  {...register("label")}
                  placeholder="Enter display label"
                  className={errors.label ? "border-red-500" : ""}
                />
                {errors.label && (
                  <p className="text-sm text-red-500">{errors.label.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Enter tenant description (optional)"
                  rows={3}
                  className={errors.description ? "border-red-500" : ""}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Status */}
              <SelectWithLabel
                id="statusId"
                label="Status"
                required
                register={register}
                error={errors.statusId?.message}
              >
                <option value="">Select status</option>
                {tenantStatuses?.lookups?.map(
                  (status: { id: number; label: string }) => (
                    <option key={status.id} value={status.id}>
                      {status.label}
                    </option>
                  )
                )}
              </SelectWithLabel>

              {/* Archive Status */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="isArchived"
                  checked={isArchived}
                  onCheckedChange={checked => setValue("isArchived", checked)}
                />
                <Label htmlFor="isArchived">Archived</Label>
              </div>
            </div>
          </div>

          <DrawerFooter className="flex-shrink-0 p-6 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Fragment>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </Fragment>
              ) : (
                <Fragment>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Fragment>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
