import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch } from "react-redux";
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
  createUserFormSchema,
  createUserRequestSchema,
  type CreateUserFormData,
} from "@/schemas/user";
import { createUserAction } from "@/redux/actions/userActions";
import type { AppDispatch } from "@/redux/store";
import type { Tenant } from "@/schemas/tenant";
import { toast } from "sonner";
import { XIcon } from "lucide-react";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated?: () => void;
  tenant?: Tenant; // Optional - if not provided, creates platform user
}

export const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onClose,
  onUserCreated,
  tenant,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  // Determine if this is a platform or tenant user
  const isPlatformUser = !tenant;

  // Local state for loading
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserFormSchema),
    defaultValues: {
      tenantId: tenant?.id || 1, // Use tenant ID or default to 1 for platform users
      dob: "",
    },
  });

  const onSubmit = async (data: CreateUserFormData) => {
    setIsLoading(true);
    try {
      // Transform form data for API
      const transformedData = createUserRequestSchema.parse(data);
      await dispatch(createUserAction(transformedData)).unwrap();

      toast.success("User Profile Created Successfully", {
        description:
          "User profile has been created. Set their password, status, and roles next.",
      });

      reset();
      onUserCreated?.();
      onClose();
    } catch (error) {
      console.error(
        `Failed to create ${isPlatformUser ? "platform" : "tenant"} user:`,
        error
      );
      toast.error("Failed to create user. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  const modalTitle = isPlatformUser
    ? "Add New Platform User"
    : `Add New User to ${tenant?.name}`;

  const loadingMessage = isPlatformUser
    ? "Creating platform user..."
    : "Creating user...";

  const submitButtonText = isPlatformUser
    ? "Create Platform User"
    : "Create User";

  return (
    <Drawer open={isOpen} onOpenChange={onClose} direction="right">
      <DrawerContent className="h-screen flex flex-col p-0">
        <DrawerHeader className="flex-shrink-0 p-6 pb-4 relative">
          <DrawerTitle>{modalTitle}</DrawerTitle>
          <DrawerClose className="absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none cursor-pointer">
            <XIcon className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DrawerClose>
        </DrawerHeader>

        {isLoading && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">{loadingMessage}</p>
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
                <h3 className="text-lg font-semibold">Personal Information</h3>

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
                      onChange={date => {
                        if (date) {
                          // Format date as YYYY-MM-DD in local timezone
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(
                            2,
                            "0"
                          );
                          const day = String(date.getDate()).padStart(2, "0");
                          setValue("dob", `${year}-${month}-${day}`, {
                            shouldValidate: true,
                          });
                        } else {
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

                  <InputWithLabel
                    id="bio"
                    label="Bio"
                    variant="textarea"
                    placeholder="Enter bio"
                    register={register}
                    error={errors.bio?.message as string}
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contact Information</h3>

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
            </div>
          </div>

          <DrawerFooter className="flex-shrink-0 p-6 pt-4">
            <Button type="submit" disabled={isLoading}>
              {submitButtonText}
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
      </DrawerContent>
    </Drawer>
  );
};
