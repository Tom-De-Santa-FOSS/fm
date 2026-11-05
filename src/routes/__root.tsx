import { QueryClientProvider } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useRouteContext,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";

const RootDocument = ({ children }: { children: React.ReactNode }) => (
  <html lang="en">
    <head>
      <HeadContent />
    </head>
    <body>
      {children}

      <Scripts />
    </body>
  </html>
);

const Root = () => {
  const { queryClient } = useRouteContext({ from: "__root__" });

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
};

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    component: Root,
    head: () => ({
      links: [
        {
          href: appCss,
          rel: "stylesheet",
        },
        {
          href: "/favicon.webp",
          rel: "icon",
          type: "image/webp",
        },
      ],
      meta: [
        {
          charSet: "utf-8",
        },
        {
          content: "width=device-width, initial-scale=1",
          name: "viewport",
        },
        {
          title: "Fresh Market | Groceries delivered in Sukkur",
        },
        {
          content:
            "Shop chicken, vegetables, eggs and bakery essentials in Sukkur. Send your order to Fresh Market on WhatsApp.",
          name: "description",
        },
      ],
    }),
    shellComponent: RootDocument,
  }
);
