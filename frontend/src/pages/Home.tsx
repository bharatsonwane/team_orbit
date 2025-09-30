import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Home() {

  return (
    <div className='min-h-screen bg-background relative'>
      {/* Theme Toggle in top right */}
      <div className='absolute top-4 right-4'>
        <ThemeToggle />
      </div>

      <div className='container mx-auto px-4 py-16'>
        <div className='text-center space-y-8'>
          <div className='space-y-4'>
            <h1 className='text-4xl font-bold tracking-tight sm:text-6xl'>
              Welcome to <span className='text-primary'>TeamOrbit</span>
            </h1>
            <p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
              A modern React application built with Vite, TypeScript, and
              shadcn/ui. Experience beautiful theming with dark and light mode
              support.
            </p>
          </div>

          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Button asChild size='lg'>
              <Link to='/login'>Sign In</Link>
            </Button>
            <Button asChild variant='outline' size='lg'>
              <Link to='/signup'>Sign Up</Link>
            </Button>
          </div>

          <div className='grid md:grid-cols-3 gap-6 mt-16'>
            <Card>
              <CardHeader>
                <CardTitle>⚡ Fast Development</CardTitle>
                <CardDescription>
                  Built with Vite for lightning-fast development and hot module
                  replacement.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-muted-foreground'>
                  Experience rapid development with instant feedback and
                  optimized builds.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🎨 Beautiful UI</CardTitle>
                <CardDescription>
                  Stunning components powered by shadcn/ui and Tailwind CSS.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-muted-foreground'>
                  Accessible, customizable components that work seamlessly
                  across themes.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🌙 Theme Support</CardTitle>
                <CardDescription>
                  Full dark and light mode support with system preference
                  detection.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-muted-foreground'>
                  Toggle between themes or let the app follow your system
                  preference.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
