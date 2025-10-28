import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import {
  getUserAuthEmailAction,
  updateUserAuthEmailAction,
} from "@/redux/actions/userActions";
import type { AppDispatch } from "@/redux/store";

const updateAuthEmailSchema = z.object({
  authEmail: z
    .string()
    .email("Invalid email format")
    .min(1, "Email is required"),
});

type UpdateAuthEmailFormData = z.infer<typeof updateAuthEmailSchema>;

interface UpdateUserAuthEmailModalProps {
  isOpen: boolean;
  userId: number | null;
  userName?: string;
  onClose: () => void;
  onEmailUpdated?: () => void;
}

export function UpdateUserAuthEmailModal({
  isOpen,
  userId,
  userName,
  onClose,
  onEmailUpdated,
}: UpdateUserAuthEmailModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(false);
  const [currentAuthEmail, setCurrentAuthEmail] = useState<string | null>(null);
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);

  const form = useForm<UpdateAuthEmailFormData>({
    resolver: zodResolver(updateAuthEmailSchema),
    defaultValues: {
      authEmail: "",
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = form;

  // Fetch current auth email when modal opens
  useEffect(() => {
    const fetchAuthEmail = async () => {
      if (isOpen && userId) {
        try {
          setIsLoadingEmail(true);
          const result = await dispatch(
            getUserAuthEmailAction(userId)
          ).unwrap();
          setCurrentAuthEmail(result.authEmail);
          reset({
            authEmail: result.authEmail || "",
          });
        } catch (error) {
          console.error("Error fetching auth email:", error);
          setCurrentAuthEmail(null);
          reset({
            authEmail: "",
          });
        } finally {
          setIsLoadingEmail(false);
        }
      }
    };

    fetchAuthEmail();
  }, [isOpen, userId, dispatch, reset]);

  const onSubmit = async (data: UpdateAuthEmailFormData) => {
    if (!userId) return;

    try {
      setIsLoading(true);
      await dispatch(
        updateUserAuthEmailAction({
          userId,
          authEmail: data.authEmail,
        })
      ).unwrap();
      onEmailUpdated?.();
      onClose();
    } catch (error) {
      console.error("Error updating user authentication email:", error);
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
      <DrawerContent className="h-screen top-0 right-0 left-auto mt-0 w-[500px] rounded-none">
        <DrawerHeader className="text-left">
          <DrawerTitle>Update Login Email</DrawerTitle>
          <DrawerDescription>
            {userName
              ? `Update login email for ${userName}`
              : "Update user login email"}
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 flex-1 overflow-y-auto">
          {isLoadingEmail ? (
            <div className="flex items-center justify-center py-8">
              <LoadingIndicator message="Loading current email..." />
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {currentAuthEmail && (
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      Current Login Email:
                    </p>
                    <p className="text-sm text-gray-700 font-mono">
                      {currentAuthEmail}
                    </p>
                  </div>
                )}

                <FormField
                  control={control}
                  name="authEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {currentAuthEmail
                          ? "New Login Email Address"
                          : "Login Email Address"}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter login email address"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">
                    Important Notes:
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>
                      • This email will be used for user authentication and
                      login
                    </li>
                    <li>• The email must be unique across all users</li>
                    <li>
                      • User will need to use this email to log into the system
                    </li>
                    {!currentAuthEmail && (
                      <li>
                        • This user currently has no login email configured
                      </li>
                    )}
                  </ul>
                </div>
              </form>
            </Form>
          )}
        </div>

        <DrawerFooter className="pt-2">
          {isLoading && <LoadingIndicator message="Updating login email..." />}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit(onSubmit)}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? "Updating..." : "Update Email"}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
