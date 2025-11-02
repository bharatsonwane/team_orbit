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
  createTenantLookupsByTypeIdAction,
  updateTenantLookupsByTypeIdAction,
} from "@/redux/actions/tenantLookupActions";

// ✅ Validation schema
const departmentSchema = z.object({
  label: z.string().min(1, "Label is required").max(100),
  description: z.string().min(1, "Description is required").max(200),
});

type DepartmentFormData = z.infer<typeof departmentSchema>;

interface DepartmentModalProps {
  mode: "create" | "update";
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  departmentId?: number | null; // only for update
  departmentName?: string;
  typeId?: number; // only for create
  departmentData?: Partial<{
    id: number;
    label: string;
    description?: string | null;
  }>;
}

export const DepartmentModal: React.FC<DepartmentModalProps> = ({
  mode,
  isOpen,
  onClose,
  onSuccess,
  departmentId,
  typeId,
  departmentName,
  departmentData,
}) => {
  console.log(mode);
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      label: departmentData?.label ?? "",
      description: departmentData?.description ?? "",
    },
  });

  // ✅ Reset form when data changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (mode === "update" && departmentData) {
        form.reset({
          label: departmentData.label ?? "",
          description: departmentData.description ?? "",
        });
      } else if (mode === "create") {
        form.reset({
          label: "",
          description: "",
        });
      }
    }
  }, [isOpen, mode, departmentData, form]);

  // ✅ Unified submit handler
  const onSubmit = async (data: DepartmentFormData) => {
    setIsLoading(true);

    try {
      if (mode === "update") {
        if (!departmentId) {
          toast.error("Department ID not found");
          return;
        }

        await dispatch(
          updateTenantLookupsByTypeIdAction({
            id: departmentId,
            data: {
              // id: departmentId,
              label: data.label,
              description: data.description,
            },
          })
        ).unwrap();

        toast.success("Department Updated", {
          description: `${data.label} has been updated successfully.`,
        });
      } else {
        if (!typeId) {
          toast.error("Type ID not found for creation");
          return;
        }

        await dispatch(
          createTenantLookupsByTypeIdAction({
            id: typeId,
            data: {
              label: data.label,
              name: (data.label || "").toLocaleUpperCase().replace(/\s+/g, "_"),
              description: data.description,
            },
          })
        ).unwrap();

        toast.success("Department Created", {
          description: `${data.label} has been created successfully.`,
        });
      }

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

  console.log(isUpdate);

  return (
    <Drawer open={isOpen} onOpenChange={onClose} direction="right">
      <DrawerContent className="h-screen flex flex-col p-0">
        <DrawerHeader className="flex-shrink-0 p-6 pb-4 relative">
          <DrawerTitle>
            {mode === "update"
              ? `Edit ${departmentName || "Department"}`
              : `Add New ${departmentName || "Department"}`}
          </DrawerTitle>
          <DrawerClose className="absolute top-4 right-4 cursor-pointer opacity-70 hover:opacity-100">
            <XIcon className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DrawerClose>
          <DrawerDescription>
            {/* {isUpdate
              ? `Edit details for ${departmentName || "this department"}.`
              : `Fill out the form to create a new ${departmentName || "department"}.`} */}
          </DrawerDescription>
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
                    <FormLabel>Name</FormLabel>
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
                {isUpdate
                  ? isLoading
                    ? "Updating..."
                    : "Update Department"
                  : isLoading
                    ? "Creating..."
                    : "Create Department"}
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
