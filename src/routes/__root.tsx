import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";

import { CartProvider } from "../lib/cart";

import appCss from "../styles.css?url";

const RootDocument = ({ children }: { children: React.ReactNode }) => (
  <html lang="en">
    <head>
      <HeadContent />
    </head>
    <body>
      <CartProvider>{children}</CartProvider>

      <Scripts />
    </body>
  </html>
);

export const Route = createRootRoute({
  head: () => ({
    links: [
      {
        href: appCss,
        rel: "stylesheet",
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
});
