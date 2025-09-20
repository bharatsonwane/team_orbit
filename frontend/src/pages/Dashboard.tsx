import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { useAuthService } from '../contexts/AuthContextProvider';
import { hasRoleAccess } from '../utils/authHelper';

export default function Dashboard() {
  const { loggedInUser, logout } = useAuthService();

  // Check user roles using the new authHelper
  const isAdmin = loggedInUser
    ? hasRoleAccess({
        allowedRoles: ['ADMIN', 'SUPER'],
        userRoles: [loggedInUser.role],
      })
    : false;

  const isSuper = loggedInUser
    ? hasRoleAccess({
        allowedRoles: ['SUPER'],
        userRoles: [loggedInUser.role],
      })
    : false;

  const handleLogout = () => {
    logout();
  };

  return (
    <div className='space-y-8'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-foreground mb-2'>
            Welcome back, {loggedInUser?.first_name}!
          </h1>
          <p className='text-muted-foreground'>
            You are logged in as{' '}
            <span className='font-semibold capitalize'>
              {loggedInUser?.role?.toLowerCase()}
            </span>
            . This page demonstrates role-based access and the theme system.
          </p>
        </div>
        <div className='flex items-center gap-4'>
          <Button asChild variant='outline'>
            <Link to='/profile'>Profile</Link>
          </Button>
          <Button onClick={handleLogout} variant='outline'>
            Logout
          </Button>
        </div>
      </div>

      <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle className='text-primary'>Theme Colors</CardTitle>
            <CardDescription>
              All colors automatically adapt to the current theme
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='p-4 bg-background border rounded-lg'>
              <p className='text-foreground'>Background & Foreground</p>
            </div>
            <div className='p-4 bg-card border rounded-lg'>
              <p className='text-card-foreground'>Card Background</p>
            </div>
            <div className='p-4 bg-muted border rounded-lg'>
              <p className='text-muted-foreground'>Muted Colors</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-primary'>Interactive Elements</CardTitle>
            <CardDescription>
              Buttons and inputs follow the theme
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <Button className='w-full'>Primary Button</Button>
            <Button variant='outline' className='w-full'>
              Outline Button
            </Button>
            <Button variant='secondary' className='w-full'>
              Secondary Button
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-primary'>Navigation</CardTitle>
            <CardDescription>Easy navigation between pages</CardDescription>
          </CardHeader>
          <CardContent className='space-y-2'>
            <Button asChild variant='ghost' className='w-full justify-start'>
              <Link to='/profile'>Profile</Link>
            </Button>
            {isAdmin && (
              <Button asChild variant='ghost' className='w-full justify-start'>
                <Link to='/admin'>Admin Panel</Link>
              </Button>
            )}
            {isSuper && (
              <Button asChild variant='ghost' className='w-full justify-start'>
                <Link to='/super-admin'>Super Admin</Link>
              </Button>
            )}
            <Button asChild variant='ghost' className='w-full justify-start'>
              <Link to='/'>Home Page</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-primary'>Theme Information</CardTitle>
          <CardDescription>
            Current theme settings and capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid md:grid-cols-2 gap-4 text-sm'>
            <div>
              <h4 className='font-semibold mb-2'>Available Themes:</h4>
              <ul className='space-y-1 text-muted-foreground'>
                <li>• Light Mode</li>
                <li>• Dark Mode</li>
                <li>• System Preference</li>
              </ul>
            </div>
            <div>
              <h4 className='font-semibold mb-2'>Features:</h4>
              <ul className='space-y-1 text-muted-foreground'>
                <li>• CSS Variables</li>
                <li>• Smooth Transitions</li>
                <li>• Persistent Storage</li>
                <li>• System Detection</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
