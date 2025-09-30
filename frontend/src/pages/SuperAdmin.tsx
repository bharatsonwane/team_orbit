import { ThemeToggle } from '../components/theme-toggle';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';

export default function SuperAdmin() {
  return (
    <div className='min-h-screen bg-background relative'>
      <div className='absolute top-4 right-4'>
        <ThemeToggle />
      </div>

      <div className='container mx-auto px-4 py-8'>
        <div className='max-w-6xl mx-auto'>
          <Card>
            <CardHeader>
              <CardTitle>Super Admin Dashboard</CardTitle>
              <CardDescription>
                Full system administration and control
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg'>System Users</CardTitle>
                    <CardDescription>Manage all system users</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className='w-full'>Manage Users</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg'>
                      Roles & Permissions
                    </CardTitle>
                    <CardDescription>Configure user roles</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className='w-full'>Manage Roles</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg'>System Settings</CardTitle>
                    <CardDescription>Global configuration</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className='w-full'>Settings</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg'>Audit Logs</CardTitle>
                    <CardDescription>System activity logs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className='w-full'>View Logs</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg'>Database</CardTitle>
                    <CardDescription>Database management</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className='w-full'>DB Tools</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg'>Backups</CardTitle>
                    <CardDescription>System backups</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className='w-full'>Manage Backups</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg'>Monitoring</CardTitle>
                    <CardDescription>System monitoring</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className='w-full'>View Metrics</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg'>Security</CardTitle>
                    <CardDescription>Security settings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className='w-full'>Security</Button>
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
