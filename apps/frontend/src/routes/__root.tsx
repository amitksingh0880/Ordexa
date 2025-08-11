import { Outlet, Link } from "@tanstack/react-router";

export const Route = new Route({
  component: RootLayout,
});

function RootLayout() {
  return (
    <div className="p-4">
      <nav className="mb-4 flex gap-4">
        <Link to="/">Home</Link>
        <Link to="/orders/create">Create Order</Link>
      </nav>
      <Outlet />
    </div>
  );
}
