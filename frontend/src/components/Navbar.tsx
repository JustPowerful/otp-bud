import { Link, useNavigate, useLocation } from "react-router-dom";
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
import { Key, LayoutGrid, LogOut, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout, user } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const userInitials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : "U";

  const isCurrentPath = (path: string) => location.pathname.startsWith(path);

  return (
    <nav className="sticky top-0 left-0 right-0 z-50 pt-4 px-4 sm:px-6 pointer-events-none">
      <div className="mx-auto max-w-5xl pointer-events-auto">
        <div className="flex items-center justify-between rounded-full bg-white/80 backdrop-blur-xl border border-slate-200/60 px-4 py-2.5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300">
          {/* Logo & Main Nav */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm group-hover:shadow-md transition-all group-hover:scale-105">
                <Zap className="h-4 w-4 fill-current" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-primary transition-colors">
                OTP Bud
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            {isAuthenticated && (
              <div className="hidden md:flex items-center gap-1 bg-slate-100/50 p-1 rounded-full border border-slate-200/50">
                <Link
                  to="/applications"
                  className={cn(
                    "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
                    isCurrentPath("/applications")
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50",
                  )}
                >
                  Applications
                </Link>
                <Link
                  to="/api-keys"
                  className={cn(
                    "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
                    isCurrentPath("/api-keys")
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50",
                  )}
                >
                  API Keys
                </Link>
              </div>
            )}
          </div>

          {/* Auth Buttons */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link to="/applications" className="hidden sm:flex">
                <span
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "rounded-full h-8 px-3 border-dashed",
                  )}
                >
                  Dashboard
                </span>
              </Link>

              <div className="h-4 w-px bg-slate-200 hidden sm:block mx-1"></div>

              <DropdownMenu>
                <DropdownMenuTrigger className="outline-none group">
                  <Avatar className="h-9 w-9 border-2 border-transparent transition-all group-hover:scale-105 group-hover:border-primary/20 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    <AvatarFallback className="bg-slate-100 text-slate-700 font-medium text-sm group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64 mt-2 rounded-xl p-1 shadow-[0_10px_40px_rgb(0,0,0,0.08)] border-slate-200/60"
                >
                  <DropdownMenuLabel className="font-normal p-3">
                    <div className="flex flex-col space-y-1.5">
                      <p className="text-sm font-semibold text-slate-900">
                        My Account
                      </p>
                      <p className="text-xs text-slate-500 truncate font-medium">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-100 mb-1" />

                  <div className="px-1 py-1">
                    <DropdownMenuItem
                      asChild
                      className="cursor-pointer rounded-lg mb-1 focus:bg-slate-50"
                    >
                      <Link
                        to="/applications"
                        className="flex items-center flex-row w-full py-2"
                      >
                        <LayoutGrid className="mr-2.5 h-4 w-4 text-slate-400" />
                        <span className="font-medium">Applications</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      asChild
                      className="cursor-pointer rounded-lg focus:bg-slate-50"
                    >
                      <Link
                        to="/api-keys"
                        className="flex items-center flex-row w-full py-2"
                      >
                        <Key className="mr-2.5 h-4 w-4 text-slate-400" />
                        <span className="font-medium">API Keys</span>
                      </Link>
                    </DropdownMenuItem>
                  </div>

                  <DropdownMenuSeparator className="bg-slate-100 mt-1 mb-1" />

                  <div className="px-1 pb-1">
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700 rounded-lg py-2 mt-1"
                    >
                      <LogOut className="mr-2.5 h-4 w-4" />
                      <span className="font-medium">Log out</span>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "rounded-full font-medium hover:bg-slate-100 hidden sm:inline-flex px-4",
                )}
                to="/signin"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className={cn(
                  buttonVariants({ variant: "default", size: "sm" }),
                  "rounded-full font-medium shadow-sm px-5",
                )}
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
