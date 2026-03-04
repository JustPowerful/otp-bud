import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { buttonVariants } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Key, LayoutGrid, LogOut } from "lucide-react";

export function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const userInitials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : "U";

  return (
    <nav className="sticky top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between rounded-2xl bg-background/60 backdrop-blur-md border border-border/40 px-6 py-3 shadow-sm transition-all duration-300">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-bold bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            OTP Bud
          </Link>

          {/* Auth Buttons */}
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger className="outline-none">
                  <Avatar className="h-10 w-10 border border-border/50 transition-transform hover:scale-105 active:scale-95 cursor-pointer hover:border-primary/50 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Account
                      </p>
                      <p className="text-xs leading-none text-muted-foreground truncate">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link
                      to="/applications"
                      className="flex items-center flex-row w-full"
                    >
                      <LayoutGrid className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>Manage Applications</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link
                      to="/api-keys"
                      className="flex items-center flex-row w-full"
                    >
                      <Key className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>Manage API Keys</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex gap-3 items-center">
              <Link
                className={buttonVariants({ variant: "ghost" })}
                to="/signin"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className={buttonVariants({ variant: "default" })}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
