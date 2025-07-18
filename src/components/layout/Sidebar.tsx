import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Workflow, 
  FolderOpen,
  MessageSquare, 
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigationItems = [
  {
    name: 'Pipeline Builder',
    href: '/pipeline-builder',
    icon: Workflow,
  },
  {
    name: 'My Workflows',
    href: '/my-workflows',
    icon: FolderOpen,
  },
  {
    name: 'AI Assistant',
    href: '/assistant',
    icon: MessageSquare,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export const Sidebar = () => {
  return (
    <div className="w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex flex-col h-full">
        
        <nav className="flex-1 px-4 space-y-2">
          {navigationItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )
              }
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};