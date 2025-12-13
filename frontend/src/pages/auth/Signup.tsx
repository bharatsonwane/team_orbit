import { useEffect, Fragment } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { InputWithLabel } from "@/components/ui/input-with-label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuthService } from "@/contexts/AuthContextProvider";
import {
  signupSchema,
  type SignupFormData,
} from "@/schemaAndTypes/validationSchema";
import { LoadingSpinner } from "@/components/ui/loading-indicator";

export default function Signup() {
  const {
    register: registerUser,
    error,
    clearError,
    isLoading,
  } = useAuthService();

  // React Hook Form setup with Zod resolver
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  // Clear error when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const onSubmit = async (data: SignupFormData) => {
    try {
      await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });
      // Navigation will be handled by useEffect
    } catch {
      // Error is handled by the auth context
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
      {/* Theme Toggle in top right */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            Create an account
          </CardTitle>
          <CardDescription className="text-center">
            Enter your information to create your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <InputWithLabel
                id="firstName"
                label="First Name"
                placeholder="John"
                register={register}
                error={errors.firstName?.message}
              />
              <InputWithLabel
                id="lastName"
                label="Last Name"
                placeholder="Doe"
                register={register}
                error={errors.lastName?.message}
              />
            </div>

            <InputWithLabel
              id="email"
              label="Email"
              type="email"
              placeholder="m@example.com"
              register={register}
              error={errors.email?.message}
            />

            <InputWithLabel
              id="password"
              label="Password"
              type="password"
              register={register}
              error={errors.password?.message}
            />

            <InputWithLabel
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              register={register}
              error={errors.confirmPassword?.message}
            />
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Fragment>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Creating account...
                </Fragment>
              ) : (
                "Create account"
              )}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
