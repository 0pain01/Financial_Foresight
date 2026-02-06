import { Search, Bell, Menu, Settings, User, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

export default function Topbar() {
  const { user, getUserInitials, logout } = useAuth();
  
  const handleLogout = () => {
    logout();
    // Redirect to login page
    window.location.href = '/login';
  };

  return (
    <header className="bg-card shadow-sm border-b border-border">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center lg:hidden">
            <button className="text-muted-foreground hover:text-foreground">
              <Menu className="h-6 w-6" />
            </button>
          </div>
          
          <div className="flex-1 flex justify-center lg:justify-start">
            <div className="max-w-lg w-full lg:max-w-xs">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input 
                  className="pl-10 pr-3 py-2" 
                  placeholder="Search transactions..." 
                  type="search"
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="text-muted-foreground hover:text-foreground relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
                3
              </span>
            </button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <div className="w-8 h-8 bg-finance-blue rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">{getUserInitials()}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">
                      {user?.firstName && user?.lastName 
                        ? `${user.firstName} ${user.lastName}`
                        : user?.username || 'User'
                      }
                    </p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user?.email || `${user?.username || 'user'}@example.com`}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}