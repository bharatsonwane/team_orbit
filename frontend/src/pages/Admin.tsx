import { ThemeToggle } from '../components/theme-toggle';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';

export default function Admin() {
  return (
    <div className='min-h-screen bg-background relative'>
      <div className='absolute top-4 right-4'>
        <ThemeToggle />
      </div>

      <div className='container mx-auto px-4 py-8'>
        <div className='max-w-4xl mx-auto'>
          <Card>
            <CardHeader>
              <CardTitle>Admin Dashboard</CardTitle>
              <CardDescription>
                Manage users, settings, and system configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg'>Users</CardTitle>
                    <CardDescription>Manage user accounts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className='w-full'>Manage Users</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg'>Settings</CardTitle>
                    <CardDescription>System configuration</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className='w-full'>System Settings</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg'>Analytics</CardTitle>
                    <CardDescription>View system analytics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className='w-full'>View Analytics</Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
