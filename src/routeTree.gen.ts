import { Route as rootRoute } from "./routes/__root";
import { Route as indexRoute } from "./routes/index";
import { Route as loginRoute } from "./routes/login";
import { Route as registerRoute } from "./routes/register";
import { Route as dashboardIndexRoute } from "./routes/dashboard/index";
import { Route as dashboardOnboardingRoute } from "./routes/dashboard/onboarding";

const indexRouteWithParent = indexRoute.update({
  id: "/",
  path: "/",
  getParentRoute: () => rootRoute,
} as any);

const loginRouteWithParent = loginRoute.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => rootRoute,
} as any);

const registerRouteWithParent = registerRoute.update({
  id: "/register",
  path: "/register",
  getParentRoute: () => rootRoute,
} as any);

const dashboardIndexRouteWithParent = dashboardIndexRoute.update({
  id: "/dashboard/",
  path: "/dashboard/",
  getParentRoute: () => rootRoute,
} as any);

const dashboardOnboardingRouteWithParent = dashboardOnboardingRoute.update({
  id: "/dashboard/onboarding",
  path: "/dashboard/onboarding",
  getParentRoute: () => rootRoute,
} as any);

export const routeTree = rootRoute.addChildren([
  indexRouteWithParent,
  loginRouteWithParent,
  registerRouteWithParent,
  dashboardIndexRouteWithParent,
  dashboardOnboardingRouteWithParent,
]);