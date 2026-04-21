import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogIn, LogOut, Menu, Package, ShoppingCart, UserCog, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/features/auth/context/AuthContext";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

function getInitials(name) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || "U";
}

export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    setOpen(false);
    setProfileOpen(false);
    await logout();
    navigate("/");
  };

  const handleEditProfile = () => {
    setOpen(false);
    setProfileOpen(false);
    navigate("/profile");
  };

  const closeAnd = (fn) => () => {
    setOpen(false);
    fn?.();
  };

  const navLinkClasses = ({ isActive }) =>
    cn(
      "inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
      isActive ? "text-primary" : "text-foreground/70 hover:text-primary"
    );

  const mobileLinkClasses = ({ isActive }) =>
    cn(
      "flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors",
      isActive
        ? "bg-primary/10 text-primary"
        : "text-foreground/80 hover:bg-secondary hover:text-foreground"
    );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center" aria-label="Bashundhara LP Gas — Home">
          <img
            src={logo}
            alt="Bashundhara LP Gas"
            className="h-10 w-auto sm:h-11"
            loading="eager"
          />
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden items-center gap-2 sm:flex sm:gap-3">
          {user ? (
            <>
              <NavLink to="/order" className={navLinkClasses}>
                <ShoppingCart className="h-4 w-4" />
                Order
              </NavLink>
              <NavLink to="/orders" className={navLinkClasses}>
                My Orders
              </NavLink>
              <Popover open={profileOpen} onOpenChange={setProfileOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    aria-label="Open profile menu"
                    className="ml-1 rounded-full ring-offset-background transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <Avatar className="h-9 w-9 border border-border bg-primary/10">
                      <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                        {getInitials(user.fullName)}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-60 p-3">
                  <div className="flex items-center gap-3 border-b border-border pb-3">
                    <Avatar className="h-10 w-10 bg-primary/10">
                      <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                        {getInitials(user.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {user.fullName}
                      </p>
                      {user.email && (
                        <p className="truncate text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 space-y-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={handleEditProfile}
                    >
                      <UserCog className="h-4 w-4" />
                      Edit profile
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start hover:bg-destructive hover:text-destructive-foreground"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild size="sm" className="bg-primary hover:bg-primary/90">
                <Link to="/signup">Sign up</Link>
              </Button>
            </>
          )}
        </nav>

        {/* MOBILE TOGGLE */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="sm:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-56 border-l border-border bg-white/70 p-0 backdrop-blur-md"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>

            {user && (
              <div className="border-b border-border/60 bg-background/40 px-4 py-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Signed in as
                </p>
                <p className="mt-0.5 truncate text-sm font-semibold text-foreground">
                  {user.fullName}
                </p>
              </div>
            )}

            <nav className="flex flex-col gap-1 p-3">
              {user ? (
                <>
                  <NavLink
                    to="/order"
                    className={mobileLinkClasses}
                    onClick={closeAnd()}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Place Order
                  </NavLink>
                  <NavLink
                    to="/orders"
                    className={mobileLinkClasses}
                    onClick={closeAnd()}
                  >
                    <Package className="h-4 w-4" />
                    My Orders
                  </NavLink>
                  <NavLink
                    to="/profile"
                    className={mobileLinkClasses}
                    onClick={closeAnd()}
                  >
                    <UserCog className="h-4 w-4" />
                    Edit Profile
                  </NavLink>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-2 flex items-center gap-3 rounded-md border border-border px-3 py-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink
                    to="/login"
                    className={mobileLinkClasses}
                    onClick={closeAnd()}
                  >
                    <LogIn className="h-4 w-4" />
                    Login
                  </NavLink>
                  <NavLink
                    to="/signup"
                    className={mobileLinkClasses}
                    onClick={closeAnd()}
                  >
                    <UserPlus className="h-4 w-4" />
                    Sign up
                  </NavLink>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
