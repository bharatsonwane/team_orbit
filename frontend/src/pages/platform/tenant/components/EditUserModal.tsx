import React, { useEffect, useState, Fragment } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import {
  InputWithLabel,
  SelectWithLabel,
} from "@/components/ui/input-with-label";
import { DatePicker } from "@/components/ui/date-picker";
import {
  updateUserFormSchema,
  type UpdateUserFormData,
  updateUserRequestSchema,
} from "@/schemas/user";
import {
  getUserByIdAction,
  updateUserAction,
} from "@/redux/actions/userActions";
import { selectLookupTypeByName } from "@/redux/slices/lookupSlice";
import type { AppDispatch, RootState } from "@/redux/store";
import { lookupTypeKeys } from "@/utils/constants";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { XIcon } from "lucide-react";

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number | null;
  onUserUpdated?: () => void;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  onClose,
  userId,
  onUserUpdated,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const userRoles = useSelector((state: RootState) =>
    selectLookupTypeByName(state, lookupTypeKeys.USER_ROLE)
  );
  const userStatuses = useSelector((state: RootState) =>
    selectLookupTypeByName(state, lookupTypeKeys.USER_STATUS)
  );

  // Local state
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
  const [selectedDob, setSelectedDob] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(updateUserFormSchema) as any,
  });

  // Fetch user data when modal opens
  useEffect(() => {
    const fetchUserData = async () => {
      if (isOpen && userId) {
        setIsFetching(true);
        try {
          const result = await dispatch(getUserByIdAction(userId)).unwrap();

          // Populate form with user data
          reset({
            title: (result.title || "") as "" | "Mr" | "Mrs" | "Ms" | undefined,
            firstName: result.firstName,
            lastName: result.lastName,
            middleName: result.middleName || "",
            maidenName: result.maidenName || "",
            gender: (result.gender || "") as
              | ""
              | "Male"
              | "Female"
              | "Other"
              | undefined,
            dob: result.dob || "",
            bloodGroup: (result.bloodGroup || "") as
              | ""
              | "A+"
              | "A-"
              | "B+"
              | "B-"
              | "AB+"
              | "AB-"
              | "O+"
              | "O-"
              | undefined,
            marriedStatus: (result.marriedStatus || "") as
              | ""
              | "Single"
              | "Married"
              | "Divorced"
              | "Widowed"
              | undefined,
            email: result.email,
            phone: result.phone,
            password: "", // Don't populate password
            bio: result.bio || "",
            statusId: result.statusId?.toString() || "",
            roleIds: "",
          });

          // Set selected roles
          const roleIds =
            result.roles?.map((role: { id: number }) => role.id) || [];
          setSelectedRoleIds(roleIds);
          setValue("roleIds", roleIds.join(","));

          // Set DOB
          setSelectedDob(result.dob || "");
        } catch (error) {
          console.error("Failed to fetch user:", error);
        } finally {
          setIsFetching(false);
        }
      }
    };

    fetchUserData();
  }, [isOpen, userId, dispatch, reset, setValue]);

  const onSubmit = async (data: UpdateUserFormData) => {
    if (!userId) return;

    setIsLoading(true);
    try {
      // Transform form data for API
      const transformedData = updateUserRequestSchema.parse({
        ...data,
        roleIds: selectedRoleIds.join(","),
      });

      await dispatch(
        updateUserAction({
          userId,
          userData: transformedData,
        })
      ).unwrap();

      onUserUpdated?.();
      onClose();
    } catch (error) {
      console.error("Failed to update user:", error);
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
          <DrawerTitle>Edit User</DrawerTitle>
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
                <div className="space-y-4">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">
                      Personal Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <SelectWithLabel
                        id="title"
                        label="Title"
                        register={register}
                        error={errors.title?.message as string}
                      >
                        <option value="">Select title</option>
                        <option value="Mr">Mr</option>
                        <option value="Mrs">Mrs</option>
                        <option value="Ms">Ms</option>
                      </SelectWithLabel>

                      <InputWithLabel
                        id="firstName"
                        label="First Name"
                        placeholder="Enter first name"
                        required
                        register={register}
                        error={errors.firstName?.message as string}
                      />

                      <InputWithLabel
                        id="lastName"
                        label="Last Name"
                        placeholder="Enter last name"
                        required
                        register={register}
                        error={errors.lastName?.message as string}
                      />

                      <InputWithLabel
                        id="middleName"
                        label="Middle Name"
                        placeholder="Enter middle name"
                        register={register}
                        error={errors.middleName?.message as string}
                      />

                      <InputWithLabel
                        id="maidenName"
                        label="Maiden Name"
                        placeholder="Enter maiden name"
                        register={register}
                        error={errors.maidenName?.message as string}
                      />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">
                      Contact Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputWithLabel
                        id="email"
                        label="Email"
                        type="email"
                        placeholder="Enter email address"
                        required
                        register={register}
                        error={errors.email?.message as string}
                      />

                      <InputWithLabel
                        id="phone"
                        label="Phone"
                        placeholder="Enter phone number"
                        required
                        register={register}
                        error={errors.phone?.message as string}
                      />
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">
                      Additional Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <SelectWithLabel
                        id="gender"
                        label="Gender"
                        register={register}
                        error={errors.gender?.message as string}
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </SelectWithLabel>

                      <div>
                        <DatePicker
                          id="dob"
                          label="Date of Birth"
                          placeholder="Select date of birth"
                          value={selectedDob}
                          onChange={date => {
                            if (date) {
                              // Format date as YYYY-MM-DD in local timezone
                              const year = date.getFullYear();
                              const month = String(
                                date.getMonth() + 1
                              ).padStart(2, "0");
                              const day = String(date.getDate()).padStart(
                                2,
                                "0"
                              );
                              const dobString = `${year}-${month}-${day}`;
                              setSelectedDob(dobString);
                              setValue("dob", dobString, {
                                shouldValidate: true,
                              });
                            } else {
                              setSelectedDob("");
                              setValue("dob", "", { shouldValidate: true });
                            }
                          }}
                          error={errors.dob?.message as string}
                        />
                        {/* Hidden input to register with react-hook-form */}
                        <input type="hidden" {...register("dob")} />
                      </div>

                      <SelectWithLabel
                        id="bloodGroup"
                        label="Blood Group"
                        register={register}
                        error={errors.bloodGroup?.message as string}
                      >
                        <option value="">Select blood group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </SelectWithLabel>

                      <SelectWithLabel
                        id="marriedStatus"
                        label="Marital Status"
                        register={register}
                        error={errors.marriedStatus?.message as string}
                      >
                        <option value="">Select marital status</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                      </SelectWithLabel>
                    </div>

                    <InputWithLabel
                      id="bio"
                      label="Bio"
                      variant="textarea"
                      placeholder="Enter bio"
                      register={register}
                      error={errors.bio?.message as string}
                    />
                  </div>

                  {/* Account Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">
                      Account Information
                    </h3>

                    <InputWithLabel
                      id="password"
                      label="Password (leave empty to keep current)"
                      type="password"
                      placeholder="Enter new password"
                      register={register}
                      error={errors.password?.message as string}
                    />

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

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Roles</label>
                      <div className="grid grid-cols-2 gap-2">
                        {userRoles?.lookups
                          ?.filter(
                            (role: {
                              id: number;
                              label: string;
                              name: string;
                            }) => role.name.startsWith("TENANT_")
                          )
                          .map((role: { id: number; label: string }) => (
                            <label
                              key={role.id}
                              className="flex items-center space-x-2 cursor-pointer"
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
                  Update User
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
