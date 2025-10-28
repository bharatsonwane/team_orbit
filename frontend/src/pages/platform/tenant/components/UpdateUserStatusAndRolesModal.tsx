import React, { useEffect, useState, Fragment } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { z } from "zod";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { SelectWithLabel } from "@/components/ui/input-with-label";
import { toast } from "sonner";
import { UserCog, XIcon } from "lucide-react";
import {
  getUserPersonalDataByIdAction,
  updateUserStatusAndRolesAction,
} from "@/redux/actions/userActions";
import { selectLookupTypeByName } from "@/redux/slices/lookupSlice";
import type { AppDispatch, RootState } from "@/redux/store";
import { lookupTypeKeys } from "@/utils/constants";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { selectCurrentTenant } from "@/redux/slices/tenantSlice";

// Form schema for updating status and roles
const updateStatusAndRolesSchema = z.object({
  statusId: z.string().min(1, "Status is required"),
  roleIds: z.string().refine(
    val => {
      if (!val) return false;
      const roleIds = val
        .split(",")
        .map(Number)
        .filter(n => !isNaN(n));
      return roleIds.length > 0;
    },
    { message: "At least one role is required" }
  ),
});

type UpdateStatusAndRolesFormData = z.infer<typeof updateStatusAndRolesSchema>;

interface UpdateUserStatusAndRolesModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number | null;
  userName?: string;
  onUpdated?: () => void;
}

export const UpdateUserStatusAndRolesModal: React.FC<
  UpdateUserStatusAndRolesModalProps
> = ({ isOpen, onClose, userId, userName, onUpdated }) => {
  const dispatch = useDispatch<AppDispatch>();

  const currentTenant = useSelector((state: RootState) =>
    selectCurrentTenant(state)
  );

  const userRoles = useSelector((state: RootState) =>
    selectLookupTypeByName(state, lookupTypeKeys.USER_ROLE)
  );
  const userStatuses = useSelector((state: RootState) =>
    selectLookupTypeByName(state, lookupTypeKeys.USER_STATUS)
  );

  // Local state
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<UpdateStatusAndRolesFormData>({
    resolver: zodResolver(updateStatusAndRolesSchema),
  });

  // Fetch user data when modal opens
  useEffect(() => {
    const fetchUserData = async () => {
      if (isOpen && userId) {
        setIsFetching(true);
        try {
          const result = await dispatch(
            getUserPersonalDataByIdAction(userId)
          ).unwrap();

          // Populate form with user data
          reset({
            statusId: result.statusId?.toString() || "",
            roleIds: "",
          });

          // Set selected roles
          const roleIds =
            result.roles?.map((role: { id: number }) => role.id) || [];
          setSelectedRoleIds(roleIds);
          setValue("roleIds", roleIds.join(","));
        } catch (error) {
          console.error("Failed to fetch user:", error);
          toast.error("Failed to load user data");
        } finally {
          setIsFetching(false);
        }
      }
    };

    fetchUserData();
  }, [isOpen, userId, dispatch, reset, setValue]);

  const onSubmit = async (data: UpdateStatusAndRolesFormData) => {
    if (!userId) return;

    setIsLoading(true);
    try {
      await dispatch(
        updateUserStatusAndRolesAction({
          userId,
          statusId: Number(data.statusId),
          roleIds: selectedRoleIds,
        })
      ).unwrap();

      toast.success("User Updated Successfully", {
        description: `Status and roles have been updated for ${userName || "the user"}.`,
      });

      reset();
      onClose();
      onUpdated?.();
    } catch (error) {
      console.error("Failed to update user:", error);
      toast.error("Failed to update user. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    setSelectedRoleIds([]);
    onClose();
  };

  const handleRoleChange = (roleId: number) => {
    let newRoleIds;
    if (selectedRoleIds.includes(roleId)) {
      newRoleIds = selectedRoleIds.filter(id => id !== roleId);
    } else {
      newRoleIds = [...selectedRoleIds, roleId];
    }
    setSelectedRoleIds(newRoleIds);
    setValue("roleIds", newRoleIds.join(","));
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose} direction="right">
      <DrawerContent className="h-screen flex flex-col p-0">
        <DrawerHeader className="flex-shrink-0 p-6 pb-4 relative">
          <DrawerTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Update Status & Roles
          </DrawerTitle>
          <DrawerClose className="absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none cursor-pointer">
            <XIcon className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DrawerClose>
        </DrawerHeader>

        {isFetching ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <LoadingIndicator message="Loading user data..." />
          </div>
        ) : (
          <Fragment>
            {isLoading && (
              <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="text-muted-foreground">Updating user...</p>
                </div>
              </div>
            )}

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col flex-1 min-h-0"
            >
              <div className="flex-1 overflow-y-auto px-6 min-h-0">
                <div className="space-y-6">
                  {userName && (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">
                        Updating status and roles for
                      </p>
                      <p className="font-semibold text-lg">{userName}</p>
                    </div>
                  )}

                  {/* Status Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">User Status</h3>
                    <SelectWithLabel
                      id="statusId"
                      label="Status"
                      required
                      register={register}
                      error={errors.statusId?.message as string}
                    >
                      <option value="">Select status</option>
                      {userStatuses?.lookups?.map(
                        (status: { id: number; label: string }) => (
                          <option key={status.id} value={status.id}>
                            {status.label}
                          </option>
                        )
                      )}
                    </SelectWithLabel>
                  </div>

                  {/* Roles Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">User Roles</h3>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Select Roles (at least one required)
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {userRoles?.lookups
                          ?.filter(
                            (role: {
                              id: number;
                              label: string;
                              name: string;
                            }) => {
                              // If current tenant is "platform", show all roles
                              if (currentTenant?.name === "platform") {
                                return true;
                              }
                              // Otherwise, filter for TENANT_ roles only
                              return role.name.startsWith("TENANT_");
                            }
                          )
                          .map((role: { id: number; label: string }) => (
                            <label
                              key={role.id}
                              className="flex items-center space-x-2 cursor-pointer p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={selectedRoleIds.includes(role.id)}
                                onChange={() => handleRoleChange(role.id)}
                                className="rounded cursor-pointer"
                              />
                              <span className="text-sm">{role.label}</span>
                            </label>
                          ))}
                      </div>
                      {errors.roleIds && (
                        <p className="text-sm text-red-600">
                          {errors.roleIds.message as string}
                        </p>
                      )}
                      {/* Hidden input for form validation */}
                      <input type="hidden" {...register("roleIds")} />
                    </div>
                  </div>
                </div>
              </div>

              <DrawerFooter className="flex-shrink-0 p-6 pt-4">
                <Button type="submit" disabled={isLoading}>
                  Update Status & Roles
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </DrawerFooter>
            </form>
          </Fragment>
        )}
      </DrawerContent>
    </Drawer>
  );
};
