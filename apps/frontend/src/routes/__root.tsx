// src/routes/__root.tsx
import { Outlet, Link, useNavigate } from '@tanstack/react-router';
import { createRootRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';


import { toast } from 'sonner';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';

export const Route = createRootRoute({
  component: RootLayout,
});

const STORAGE_KEY = 'ordexa-user-id-history';

function RootLayout() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [error, setError] = useState('');
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setHistory(JSON.parse(stored));

    const lastUsed = localStorage.getItem('ordexa-user-id');
    if (lastUsed) setUserId(lastUsed);
  }, []);

  useEffect(() => {
    if (userId) {
      localStorage.setItem('ordexa-user-id', userId);
    }
  }, [userId]);

  const saveToHistory = (id: string) => {
    const updated = [id, ...history.filter((u) => u !== id)].slice(0, 5); // max 5
    setHistory(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleGoToOrders = () => {
    if (!userId.trim()) {
      setError('Please enter a valid User ID');
      return;
    }
    setError('');
    saveToHistory(userId);
    navigate({ to: `/orders/${userId}` });
  };

  const handleGenerateUUID = () => {
    const newId = uuidv4();
    setUserId(newId);
    toast.success('✅ UUID generated');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(userId);
      toast.success('📋 Copied User ID to clipboard');
    } catch {
      toast.error('❌ Failed to copy');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <nav className="flex flex-wrap items-end gap-4 mb-6">
        {/* <Link to="/" className="text-blue-600 underline font-medium">
          Home
        </Link> */}
        <Link to="/orders/create" className="text-blue-600 underline font-medium">
          Create Order
        </Link>

        {/* User ID Tools */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="userId" className="text-sm font-medium">
            User ID
          </Label>

          <div className="flex gap-2">
            <Input
              id="userId"
              placeholder="Enter or generate a User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-[300px]"
            />

            <Button variant="default" onClick={handleGoToOrders}>
              View Orders
            </Button>

            <Button variant="outline" onClick={handleGenerateUUID}>
              🔁 Generate
            </Button>

            <Button variant="secondary" onClick={handleCopy}>
              📋 Copy
            </Button>

            {history.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost">⏷ Recent</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {history.map((id) => (
                    <DropdownMenuItem key={id} onClick={() => setUserId(id)}>
                      {id.slice(0, 30)}...
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </nav>

      <Outlet />
    </div>
  );
}
