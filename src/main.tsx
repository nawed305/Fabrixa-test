import "./react19-r3f-compat";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { routeTree } from "./routeTree.gen";
import "./index.css";

// Suppress Fabric.js internal RAF clearRect errors that fire briefly during
// React StrictMode's double-invoke cleanup cycle. Non-fatal — canvas reinitialises
// correctly on the second mount. Without this, Replit's error overlay blocks the UI.
if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (e) => {
    const msg: string = (e.reason as Error | undefined)?.message ?? "";
    if (msg.includes("clearRect")) {
      e.preventDefault();
    }
  });
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 10_000,
    },
  },
});

const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreloadStaleTime: 0,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootEl = document.getElementById("root");
if (rootEl) {
  createRoot(rootEl).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
}
