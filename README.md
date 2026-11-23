# Shoply Demo Store — GA4 Tracking Playground

A generic static e-commerce demo site for practicing GA4 tracking and collecting event data for an **Ask Your Data** analytics agent.

## Run it
1. Extract the ZIP.
2. Open `index.html` in a browser (for basic local demo) or serve the folder using a local web server.
3. To enable GA4, replace `G-XXXXXXXXXX` in `index.html` with your GA4 Measurement ID.
4. Deploy/host the site (or run a local server) and use GA4 DebugView to verify events.

> Do not use real customer details. This site is demo-only; it does not process real payments.

## Local server option
From this folder run:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Main events implemented
- `demo_page_view` — custom view tracking (page_name, page_title, page_location)
- `demo_button_click` — generic button action tracking (button_name, placement)
- `navigation_click` — navigation destination
- `category_filter` — category selection
- `search` and `product_search` — search term and results count
- `view_item` — GA4 recommended ecommerce event when opening a product
- `product_detail_open` — custom product detail event
- `add_to_cart`, `remove_from_cart`, `view_cart`, `begin_checkout`, `purchase` — ecommerce events
- `newsletter_signup` — demo form signup (email domain only, not the email address)
- `form_validation_error` — demo form validation error
- `scroll_depth` — custom 25/50/75/90% milestones
- `page_engagement_summary` — custom visibility duration summary on page hide
- `demo_js_error` — custom JavaScript error signal

## Event payload privacy note
The demo signup event sends only the email domain, not the full address. No email is sent or stored by this demo.
Do not collect names, email addresses, payment details, or sensitive personal data in analytics.

## Test scenarios
1. Load home page.
2. Click **Explore collection**.
3. Filter a category.
4. Search for a term that exists (`speaker`) and a term that doesn't (`zzzz`).
5. Open a product detail.
6. Add one or more products to cart; increase/decrease quantity.
7. View cart, proceed to checkout, complete demo purchase.
8. Scroll through page to trigger scroll-depth events.
9. Try newsletter signup with a valid-looking email (only domain is sent in event).

Use GA4 **DebugView** to test events while working, and **Reports → Engagement → Events** for event counts after data processing.
