import { Route as rootRoute } from "./routes/__root";
import { Route as indexRoute } from "./routes/index";
import { Route as loginRoute } from "./routes/login";
import { Route as registerRoute } from "./routes/register";
import { Route as dashboardIndexRoute } from "./routes/dashboard/index";
import { Route as dashboardLeadsRoute } from "./routes/dashboard/leads";
import { Route as dashboardCrmRoute } from "./routes/dashboard/crm";
import { Route as dashboardOnboardingRoute } from "./routes/dashboard/onboarding";
import { Route as dashboardSocialRoute } from "./routes/dashboard/social";

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

const dashboardLeadsRouteWithParent = dashboardLeadsRoute.update({
  id: "/dashboard/leads",
  path: "/dashboard/leads",
  getParentRoute: () => rootRoute,
} as any);

const dashboardCrmRouteWithParent = dashboardCrmRoute.update({
  id: "/dashboard/crm",
  path: "/dashboard/crm",
  getParentRoute: () => rootRoute,
} as any);

const dashboardSocialRouteWithParent = dashboardSocialRoute.update({
  id: "/dashboard/social",
  path: "/dashboard/social",
  getParentRoute: () => rootRoute,
} as any);

export const routeTree = rootRoute.addChildren([
  indexRouteWithParent,
  loginRouteWithParent,
  registerRouteWithParent,
  dashboardIndexRouteWithParent,
  dashboardOnboardingRouteWithParent,
  dashboardLeadsRouteWithParent,
  dashboardCrmRouteWithParent,
  dashboardSocialRouteWithParent,
]);

