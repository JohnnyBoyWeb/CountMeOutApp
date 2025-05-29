import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useSettings } from '@/hooks/useSettings';
import { InstallPrompt } from './InstallPrompt';
import { Calculator, Home, BarChart3, Trophy, Settings, Moon, Sun, Menu, Accessibility } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { settings, toggleDarkMode, toggleHighContrast } = useSettings();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Initialize database on app start
    import('@/lib/db').then(({ initializeDB }) => {
      initializeDB();
    });
  }, []);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Practice', href: '/practice', icon: Calculator },
    { name: 'Progress', href: '/progress', icon: BarChart3 },
    { name: 'Achievements', href: '/achievements', icon: Trophy },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const NavLink = ({ item, mobile = false }: { item: typeof navigation[0]; mobile?: boolean }) => {
    const isActive = location === item.href;
    const Icon = item.icon;
    
    return (
      <Link href={item.href}>
        <Button
          variant={isActive ? "default" : "ghost"}
          className={cn(
            mobile
              ? "w-full justify-start"
              : "flex-col h-auto p-3 text-xs",
            isActive && "bg-primary text-primary-foreground"
          )}
          onClick={() => mobile && setIsMobileMenuOpen(false)}
        >
          <Icon className={cn("h-5 w-5", mobile ? "mr-2" : "mb-1")} />
          {item.name}
        </Button>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Calculator className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Count Me Out</h1>
              <p className="text-xs text-muted-foreground">Mental Math Practice</p>
            </div>
          </div>

          <div className="ml-auto flex items-center space-x-2">
            {/* Accessibility Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleHighContrast}
              className="h-9 w-9"
            >
              <Accessibility className="h-4 w-4" />
              <span className="sr-only">Toggle high contrast</span>
            </Button>

            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="h-9 w-9"
            >
              {settings.darkMode ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <div className="flex flex-col space-y-3 mt-8">
                  {navigation.map((item) => (
                    <NavLink key={item.href} item={item} mobile />
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <div className="flex-1">
        {/* Desktop Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background md:top-16 md:left-0 md:w-20 md:border-r md:border-t-0">
          <div className="flex justify-around p-2 md:flex-col md:space-y-2">
            {navigation.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <main className="pb-20 md:ml-20 md:pb-4">
          {children}
        </main>
      </div>

      {/* PWA Install Prompt */}
      <InstallPrompt />
    </div>
  );
}
