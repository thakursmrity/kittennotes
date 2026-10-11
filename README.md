# Kitten Notes

Static HTML version of kittennotes.com. Plain HTML, CSS and JavaScript, no build step and no Shopify.

## Pages

- `index.html` home
- `shop.html` all products with filters
- `product/*.html` one page per product (6 journals, notepads with 13 design options)
- `cart.html` cart saved in the browser, plus an order form that emails the order to info@kittennotes.com
- `about.html`, `contact.html`
- `policies/` shipping, refund, privacy, terms

## Going live on GitHub Pages

1. Repo Settings > Pages > Source: deploy from branch `main`, folder `/ (root)`.
2. When ready to leave Shopify, add your custom domain `kittennotes.com` in the same Pages settings and update the domain's DNS records as GitHub shows.

## Product images

Images currently load from the Shopify CDN. Before cancelling Shopify, download them into an `images/` folder in this repo and update the image links, or they will stop loading.

## Taking payments

Orders currently arrive by email for manual confirmation. To accept online payment, add Razorpay Payment Links or a Razorpay checkout button on the cart page.
