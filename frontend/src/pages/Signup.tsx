import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuthService } from '@/contexts/AuthContextProvider';
import { signupSchema, type SignupFormData } from '../schemas/validation';

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
    <div className='min-h-screen flex items-center justify-center bg-background p-4 relative'>
      {/* Theme Toggle in top right */}
      <div className='absolute top-4 right-4'>
        <ThemeToggle />
      </div>

      <Card className='w-full max-w-md'>
        <CardHeader className='space-y-1'>
          <CardTitle className='text-2xl text-center'>
            Create an account
          </CardTitle>
          <CardDescription className='text-center'>
            Enter your information to create your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className='space-y-4'>
            {error && (
              <div className='p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md'>
                {error}
              </div>
            )}

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='firstName'>First Name</Label>
                <Input
                  id='firstName'
                  placeholder='John'
                  {...register('firstName')}
                />
                {errors.firstName && (
                  <p className='text-sm text-destructive'>
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div className='space-y-2'>
                <Label htmlFor='lastName'>Last Name</Label>
                <Input
                  id='lastName'
                  placeholder='Doe'
                  {...register('lastName')}
                />
                {errors.lastName && (
                  <p className='text-sm text-destructive'>
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                placeholder='m@example.com'
                {...register('email')}
              />
              {errors.email && (
                <p className='text-sm text-destructive'>
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='password'>Password</Label>
              <Input id='password' type='password' {...register('password')} />
              {errors.password && (
                <p className='text-sm text-destructive'>
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='confirmPassword'>Confirm Password</Label>
              <Input
                id='confirmPassword'
                type='password'
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className='text-sm text-destructive'>
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className='flex flex-col space-y-4'>
            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>
            <div className='text-center text-sm text-muted-foreground'>
              Already have an account?{' '}
              <Link
                to='/login'
                className='text-primary hover:underline font-medium'
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
