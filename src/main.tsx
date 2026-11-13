import { createRoot } from "react-dom/client";
import {
  Link,
  Outlet,
  RouterProvider,
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { ArrowLeft, Factory } from "lucide-react";
import { Workspace } from "@/components/flex/workspace";
import "./styles.css";

function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-8">
      <p className="text-sm font-medium text-copper">غرفة الخطوط</p>
      <h1 className="mt-2 text-3xl font-semibold text-ink">خطوط الإنتاج</h1>
      <p className="mt-2 max-w-xl text-sm text-muted">
        ادخل الخط المطلوب. خط الفليكسيبل هو الموجود الآن، والخطوط التالية تتضاف من نفس الباب من غير ما تختلط حساباتها.
      </p>
      <Link
        to="/flex"
        className="mt-8 flex items-center gap-4 rounded-2xl bg-steel p-5 text-steel-ink shadow-card"
      >
        <span className="inline-flex size-14 items-center justify-center rounded-xl bg-copper text-copper-ink">
          <Factory className="size-7" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-xl font-semibold">خط الفليكسيبل</span>
          <span className="mt-1 block text-sm text-steel-ink/75">
            استهلاك · زمن تصنيع · قائمة مواد · تكاليف · رصيد خامات
          </span>
        </span>
        <ArrowLeft className="size-5 shrink-0" aria-hidden="true" />
      </Link>
    </main>
  );
}

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
});

const flexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/flex",
  component: Workspace,
});

const router = createRouter({
  routeTree: rootRoute.addChildren([indexRoute, flexRoute]),
  history: createHashHistory(),
});

const root = document.getElementById("root");
if (!root) throw new Error("missing root");
createRoot(root).render(<RouterProvider router={router} />);
