import {
  Outlet,
  Link,
  useLocation,
  useNavigate,
  createRootRoute,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  Boxes,
  Package,
  Star,
  Mail,
  Moon,
  Sun,
  LogOut,
  ShieldCheck,
  Loader2,
  KeyRound,
  Users,
  Settings,
  Ticket,
} from "lucide-react";

import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarInset,
  SidebarFooter,
} from "@ui/components/ui/sidebar";
import { Button } from "@ui/components/ui/button";
import { Separator } from "@ui/components/ui/separator";
import {
  APP,
  ROUTES,
  RESOURCES,
  ARN_MODULES,
  ARN_ACTIONS,
  ORDER_STATUS,
  REVIEW_STATUS,
  MESSAGE_STATUS,
  THEME_STORAGE_KEY,
} from "../constants/app";
import { orders, reviews, messages } from "../lib/resources";
import { useAuth } from "../context/auth-context";
import { TenantPicker } from "../components/TenantPicker";

export const Route = createRootRoute({
  component: RootLayout,
});

const NAV_ITEMS = [
  { to: ROUTES.dashboard, label: "Dashboard", icon: LayoutDashboard, badge: null, requires: null },
  { to: ROUTES.orders, label: "Orders", icon: ShoppingBag, badge: RESOURCES.orders, requires: null },
  { to: ROUTES.inventory, label: "Inventory", icon: Boxes, badge: null, requires: null },
  { to: ROUTES.products, label: "Products", icon: Package, badge: null, requires: null },
  { to: ROUTES.reviews, label: "Reviews", icon: Star, badge: RESOURCES.reviews, requires: null },
  { to: ROUTES.messages, label: "Messages", icon: Mail, badge: RESOURCES.messages, requires: null },
  {
    to: ROUTES.coupons,
    label: "Coupons",
    icon: Ticket,
    badge: null,
    requires: { module: ARN_MODULES.coupons, action: ARN_ACTIONS.write },
  },
  {
    to: ROUTES.customers,
    label: "Customers",
    icon: Users,
    badge: null,
    requires: { module: ARN_MODULES.accessManagement, action: ARN_ACTIONS.users },
  },
  {
    to: ROUTES.access,
    label: "Access",
    icon: KeyRound,
    badge: null,
    requires: { module: ARN_MODULES.accessManagement, action: ARN_ACTIONS.roles },
  },
  { to: ROUTES.settings, label: "Settings", icon: Settings, badge: null, requires: null },
] as const;

const PAGE_TITLES: Record<string, string> = {
  [ROUTES.dashboard]: "Dashboard",
  [ROUTES.orders]: "Orders",
  [ROUTES.inventory]: "Inventory & Pricing",
  [ROUTES.products]: "Products",
  [ROUTES.reviews]: "Reviews",
  [ROUTES.messages]: "Messages",
  [ROUTES.coupons]: "Coupons",
  [ROUTES.customers]: "Customers",
  [ROUTES.access]: "Access Management",
  [ROUTES.settings]: "Settings",
};

function useTheme() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    const isDark = stored === "dark";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggle = () => {
    setDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem(THEME_STORAGE_KEY, next ? "dark" : "light");
      return next;
    });
  };

  return { dark, toggle };
}

export function RootLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const onLoginRoute = pathname === ROUTES.login;

  useEffect(() => {
    if (!loading && !user && !onLoginRoute) {
      navigate({ to: ROUTES.login });
    }
  }, [loading, user, onLoginRoute, navigate]);

  if (onLoginRoute) return <Outlet />;

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <AdminShell />;
}

function AdminShell() {
  const { pathname } = useLocation();
  const { dark, toggle } = useTheme();
  const { user, logout, can } = useAuth();
  const navigate = useNavigate();

  const navItems = NAV_ITEMS.filter(
    (item) => !item.requires || can(item.requires.module, item.requires.action),
  );

  const onLogout = async () => {
    await logout();
    navigate({ to: ROUTES.login });
  };

  const pendingOrders = orders.useList({ status: ORDER_STATUS.Pending });
  const pendingReviews = reviews.useList({ status: REVIEW_STATUS.Pending });
  const unreadMessages = messages.useList({ status: MESSAGE_STATUS.Unread });

  const badgeCounts: Record<string, number | undefined> = {
    [RESOURCES.orders]: pendingOrders.data?.length,
    [RESOURCES.reviews]: pendingReviews.data?.length,
    [RESOURCES.messages]: unreadMessages.data?.length,
  };

  const title = PAGE_TITLES[pathname] ?? APP.name;

  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1">
            <div className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold">
              O
            </div>
            <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-semibold">{APP.name}</span>
              <span className="text-muted-foreground text-xs">{APP.tagline}</span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Management</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const count = item.badge ? badgeCounts[item.badge] : undefined;
                  const isActive =
                    item.to === ROUTES.dashboard
                      ? pathname === item.to
                      : pathname.startsWith(item.to);
                  return (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                        <Link to={item.to}>
                          <item.icon className="size-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                      {count ? <SidebarMenuBadge>{count}</SidebarMenuBadge> : null}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <span className="text-muted-foreground px-2 text-xs group-data-[collapsible=icon]:hidden">
            © {new Date().getFullYear()} {APP.name}
          </span>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="bg-background/80 sticky top-0 z-10 flex h-14 items-center gap-2 border-b px-4 backdrop-blur">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-1 h-5" />
          <h1 className="text-base font-semibold">{title}</h1>
          <div className="ml-auto flex items-center gap-1">
            <TenantPicker />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              aria-label="Toggle theme"
            >
              {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
            <Separator orientation="vertical" className="mx-1 h-5" />
            <span className="hidden items-center gap-1.5 text-sm text-muted-foreground sm:flex">
              <ShieldCheck className="size-4" />
              {user?.name}
            </span>
            <Button variant="ghost" size="icon" onClick={onLogout} aria-label="Sign out">
              <LogOut className="size-4" />
            </Button>
          </div>
        </header>
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
