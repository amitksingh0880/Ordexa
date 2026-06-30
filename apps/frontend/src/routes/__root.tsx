// src/routes/__root.tsx
import {
  Outlet,
  Link,
  useNavigate,
  useLocation,
  createRootRoute,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { LayoutDashboard, Boxes, RefreshCw, Copy, ChevronDown } from "lucide-react";

import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarFooter,
  SidebarSeparator,
} from "@ui/components/ui/sidebar";
import { Button } from "@ui/components/ui/button";
import { Input } from "@ui/components/ui/input";
import { Label } from "@ui/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ui/components/ui/dropdown-menu";
import {
  APP,
  ROUTES,
  STORAGE_KEYS,
  USER_ID_HISTORY_LIMIT,
} from "../constants/app";

export const Route = createRootRoute({
  component: RootLayout,
});

const NAV_ITEMS = [
  { to: ROUTES.dashboard, label: "Dashboard", icon: LayoutDashboard },
  { to: ROUTES.inventory, label: "Inventory", icon: Boxes },
] as const;

export function RootLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.userIdHistory);
    if (stored) setHistory(JSON.parse(stored));
    const lastUsed = localStorage.getItem(STORAGE_KEYS.lastUserId);
    if (lastUsed) setUserId(lastUsed);
  }, []);

  useEffect(() => {
    if (userId) localStorage.setItem(STORAGE_KEYS.lastUserId, userId);
  }, [userId]);

  const saveToHistory = (id: string) => {
    const updated = [id, ...history.filter((u) => u !== id)].slice(0, USER_ID_HISTORY_LIMIT);
    setHistory(updated);
    localStorage.setItem(STORAGE_KEYS.userIdHistory, JSON.stringify(updated));
  };

  const handleGoToOrders = () => {
    if (!userId.trim()) {
      setError("Please enter a valid User ID");
      return;
    }
    setError("");
    saveToHistory(userId);
    navigate({ to: ROUTES.ordersByUser(userId) });
  };

  const handleGenerateUUID = () => {
    setUserId(uuidv4());
    toast.success("UUID generated");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(userId);
      toast.success("Copied User ID to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          <SidebarHeader>
            <div className="flex items-center justify-between px-1">
              <span className="font-semibold">{APP.name}</span>
              <SidebarTrigger />
            </div>
          </SidebarHeader>

          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton asChild isActive={pathname === item.to}>
                    <Link to={item.to}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>

          <SidebarSeparator />

          <SidebarFooter>
            <Label htmlFor="userId" className="text-sm font-medium">
              User ID
            </Label>
            <Input
              id="userId"
              placeholder="Enter or generate a User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="mb-2"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleGoToOrders}>
                View Orders
              </Button>
              <Button size="sm" variant="outline" onClick={handleGenerateUUID} aria-label="Generate UUID">
                <RefreshCw />
              </Button>
              <Button size="sm" variant="ghost" onClick={handleCopy} aria-label="Copy User ID">
                <Copy />
              </Button>
              {history.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost" aria-label="Recent User IDs">
                      <ChevronDown />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {history.map((id) => (
                      <DropdownMenuItem key={id} onClick={() => setUserId(id)} className="font-mono">
                        {id.slice(0, 24)}…
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            {error && <p className="text-destructive mt-1 text-xs">{error}</p>}
          </SidebarFooter>
        </SidebarContent>
      </Sidebar>

      <SidebarInset>
        <div className="p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
