import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Bot, User } from 'lucide-react';

export const Header = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex items-center space-x-2">
          <Bot className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">AI Agent Builder</span>
        </div>
        
        <div className="flex flex-1 items-center justify-end space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="text-sm text-muted-foreground">{user.email}</span>
              </div>
              <Button variant="outline" size="sm" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          ) : (
            <Button variant="default" size="sm">
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};