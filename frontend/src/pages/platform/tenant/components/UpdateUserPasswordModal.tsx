import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch } from "react-redux";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { InputWithLabel } from "@/components/ui/input-with-label";
import { toast } from "sonner";
import { KeyRound, XIcon } from "lucide-react";
import {
  updateUserPasswordSchema,
  type UpdateUserPasswordFormData,
} from "@/schemaTypes/userSchemaTypes";
import { updateUserPasswordAction } from "@/redux/actions/userActions";
import type { AppDispatch } from "@/redux/store";

interface UpdateUserPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number | null;
  userName?: string;
  onPasswordUpdated?: () => void;
}

export const UpdateUserPasswordModal: React.FC<
  UpdateUserPasswordModalProps
> = ({ isOpen, onClose, userId, userName, onPasswordUpdated }) => {
  const dispatch = useDispatch<AppDispatch>();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UpdateUserPasswordFormData>({
    resolver: zodResolver(updateUserPasswordSchema),
  });

  const onSubmit = async (data: UpdateUserPasswordFormData) => {
    if (!userId) return;

    try {
      await dispatch(
        updateUserPasswordAction({
          userId,
          password: data.newPassword,
        })
      ).unwrap();

      toast.success("Password Updated Successfully", {
        description: `Password has been updated for ${userName || "the user"}.`,
      });

      reset();
      onClose();
      onPasswordUpdated?.();
    } catch (error) {
      toast.error("Failed to update password. Please try again.");
      console.error("Password update error:", error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Drawer open={isOpen} onOpenChange={handleClose} direction="right">
      <DrawerContent className="h-screen flex flex-col p-0">
        <DrawerHeader className="flex-shrink-0 p-6 pb-4 relative">
          <DrawerTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            Update Password
          </DrawerTitle>
          <DrawerClose className="absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none cursor-pointer">
            <XIcon className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DrawerClose>
          <DrawerDescription className="pt-2">
            {userName
              ? `Update password for ${userName}`
              : "Enter a new password for this user"}
          </DrawerDescription>
        </DrawerHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1 min-h-0"
        >
          <div className="flex-1 overflow-y-auto px-6 min-h-0">
            <div className="space-y-4">
              <InputWithLabel
                id="newPassword"
                label="New Password"
                type="password"
                placeholder="Enter new password"
                required
                register={register}
                error={errors.newPassword?.message as string}
              />

              <InputWithLabel
                id="confirmPassword"
                label="Confirm Password"
                type="password"
                placeholder="Confirm new password"
                required
                register={register}
                error={errors.confirmPassword?.message as string}
              />
            </div>
          </div>

          <DrawerFooter className="flex-shrink-0 p-6 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Password"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
};
