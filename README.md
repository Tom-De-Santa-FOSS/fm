# Fresh Market storefront

TanStack Start storefront for Fresh Market in Sukkur. The 18-product catalog, prices, image URLs and Rs 1,000 order minimum come from the existing Expo app in `../freshmarket/apps/expo-app/src/lib/products.ts`.

```bash
bun install
bun run dev
```

Customers can search or filter products and open a compact, image-free weight picker from Add to basket. Priced rows offer 250 g, 500 g and 1 kg; the shared input accepts other weights in 250 g / 0.25 kg steps, including 1.5 kg. Off-step entries disable confirmation. The product details sheet also offers chicken cut selection. Baskets are saved in browser storage, with weighted items editable through the same compact picker. Whole chicken and chest cuts are ordered by count and charged by their actual weight, so the basket excludes them from the priced-items subtotal. Ordering opens a prefilled WhatsApp chat; the customer must send the message and the store must confirm availability, delivery charge, payment and final total. There is no payment or order backend.

The picker adapts [Barakat's mobile size sheet](https://barakatfresh.ae/fruits.html), inspected on 3 November 2026: product title, priced size rows, per-row Add/quantity controls and Done. Here, rows select one total weight and the footer confirms it. Images are omitted and a g/kg input supports other weights. [FreshChoice's official FAQ](https://ranui.store.freshchoice.co.nz/pages/frequently-asked-questions) documents entering `0.25` to order 250 g; the 250 g increment restriction is a Fresh Market requirement.

```bash
bun run check
bun run build
```

Product data is currently copied rather than shared between the two repositories. Update both catalogs when prices or availability change. Weights must be multiples of 250 g; count-based products use whole quantities. The existing maximum of 10 priced units per item still applies (10 kg for per-kg products, 5 kg for per-500 g products, 2.5 kg for per-250 g products). Saved basket quantities remain multiples of the catalog's priced unit, so existing valid baskets keep their amounts and prices. Invalid saved weights are rejected on restoration. The Expo app's Meta Pixel, LogRocket and Cloudflare search analytics are not connected in this TanStack app.
