import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch } from "react-redux";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { XIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { AppDispatch } from "@/redux/store";
import {
  createTenantLookupByIdAction,
  getTenantLookupListByTypeIdAction,
  updateTenantLookupByIdAction,
} from "@/redux/actions/tenantLookupActions";
import {
  createTenantLookupFormSchema,
  type CreateTenantLookupFormData,
} from "@/schemaTypes/tenantLookupSchemaTypes";

interface DepartmentModalProps {
  mode: "create" | "update";
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  departmentId?: number | null; // only for update
  departmentName?: string;
  lookupTypeId?: number; // only for create
  lookupType?: string;
  departmentData?: Partial<{
    id: number;
    label: string;
    name: string;
    description?: string | null;
    isArchived: boolean;
  }>;
}

export const DepartmentModal: React.FC<DepartmentModalProps> = ({
  mode,
  isOpen,
  onClose,
  onSuccess,
  departmentId,
  lookupTypeId,
  departmentName,
  departmentData,
  lookupType,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CreateTenantLookupFormData>({
    resolver: zodResolver(createTenantLookupFormSchema),
    defaultValues: {
      name: "",
      label: "",
      description: "",
      lookupTypeId: lookupTypeId ?? 0,
    },
  });

  // ✅ Reset form when data changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (mode === "update" && departmentData) {
        form.reset({
          name: departmentData.name ?? "",
          label: departmentData.label ?? "",
          description: departmentData.description ?? "",
          lookupTypeId: lookupTypeId ?? 0,
          isArchived: departmentData.isArchived ?? false,
        });
      } else if (mode === "create") {
        form.reset({
          name: "",
          label: "",
          description: "",
          lookupTypeId: lookupTypeId ?? 0,
        });
      }
    }
  }, [isOpen, mode, departmentData, lookupTypeId, form]);

  // ✅ Unified submit handler
  const onSubmit = async (data: CreateTenantLookupFormData) => {
    setIsLoading(true);

    try {
      if (mode === "update") {
        if (!departmentId) {
          toast.error("Department ID not found");
          return;
        }

        await dispatch(
          updateTenantLookupByIdAction({
            id: departmentId,
            data: {
              label: data.label,
              description: data.description,
              name: data.name,
              lookupTypeId: lookupTypeId,
              isArchived: data.isArchived,
            },
          })
        ).unwrap();

        toast.success("Department Updated", {
          description: `${data.label} has been updated successfully.`,
        });
      } else {
        if (!lookupTypeId) {
          toast.error("Type ID not found for creation");
          return;
        }

        await dispatch(
          createTenantLookupByIdAction({
            label: data.label,
            name: data.name,
            description: data.description,
            lookupTypeId: lookupTypeId,
            isArchived: data?.isArchived,
          })
        ).unwrap();

        toast.success("Department Created", {
          description: `${data.label} has been created successfully.`,
        });
      }

      await dispatch(getTenantLookupListByTypeIdAction(Number(lookupTypeId)));

      onSuccess?.();
      onClose();
      form.reset();
    } catch (error) {
      console.error("Department save failed:", error);
      toast.error("Failed to save department", {
        description: "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    form.reset({
      label: "",
      description: "",
    });
    onClose();
  };

  const isUpdate = mode === "update";

  return (
    <Drawer open={isOpen} onOpenChange={onClose} direction="right">
      <DrawerContent className="h-screen flex flex-col p-0">
        <DrawerHeader className="flex-shrink-0 p-6 pb-4 relative">
          <DrawerTitle>
            {isUpdate ? "Edit" : "Add New"} {lookupType}
          </DrawerTitle>

          <DrawerClose className="absolute top-4 right-4 cursor-pointer opacity-70 hover:opacity-100">
            <XIcon className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DrawerClose>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col flex-1 justify-between"
          >
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Label</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Sales"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Sales"
                        {...field}
                        // readOnly={mode === "update"} // 👈 only read-only when editing
                        disabled={isLoading} // still disable when submitting
                        // className={
                        //   mode === "update"
                        //     ? "bg-gray-100 cursor-not-allowed"
                        //     : ""
                        // }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Responsible for sales operations"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DrawerFooter className="border-t p-6 flex flex-col gap-2">
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isLoading
                  ? isUpdate
                    ? "Updating..."
                    : "Creating..."
                  : `${isUpdate ? "Update" : "Create"} ${lookupType}`}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </DrawerFooter>
          </form>
        </Form>
      </DrawerContent>
    </Drawer>
  );
};
