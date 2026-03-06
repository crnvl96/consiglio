import { createRootRoute, Outlet } from "@tanstack/react-router";

export const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-tokyonight-night-bg text-tokyonight-night-fg">
      <Outlet />
    </div>
  ),
});
