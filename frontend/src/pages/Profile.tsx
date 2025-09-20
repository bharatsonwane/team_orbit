import { useAuthService } from '@/contexts/AuthContextProvider';
import { ThemeToggle } from '../components/theme-toggle';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';

export default function Profile() {
  const { loggedInUser, logout } = useAuthService();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className='min-h-screen bg-background relative'>
      <div className='absolute top-4 right-4'>
        <ThemeToggle />
      </div>

      <div className='container mx-auto px-4 py-8'>
        <div className='max-w-2xl mx-auto'>
          <Card>
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
              <CardDescription>
                Manage your account information and settings
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              {loggedInUser && (
                <div className='space-y-4'>
                  <div>
                    <label className='text-sm font-medium text-muted-foreground'>
                      Name
                    </label>
                    <p className='text-lg'>
                      {loggedInUser.first_name} {loggedInUser.last_name}
                    </p>
                  </div>

                  <div>
                    <label className='text-sm font-medium text-muted-foreground'>
                      Email
                    </label>
                    <p className='text-lg'>{loggedInUser.email}</p>
                  </div>

                  <div>
                    <label className='text-sm font-medium text-muted-foreground'>
                      Role
                    </label>
                    <p className='text-lg capitalize'>
                      {loggedInUser.role.toLowerCase()}
                    </p>
                  </div>

                  <div>
                    <label className='text-sm font-medium text-muted-foreground'>
                      Member Since
                    </label>
                    <p className='text-lg'>
                      {new Date(loggedInUser.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              <div className='pt-4 border-t'>
                <Button onClick={handleLogout} variant='outline'>
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
