# Tracking event reference

| Event | When it fires | Useful parameters |
|---|---|---|
| `demo_page_view` | Initial load / demo view changes | `page_name`, `page_title`, `page_location` |
| `demo_button_click` | CTA button click | `button_name`, `placement` |
| `navigation_click` | Nav click | `destination` |
| `category_filter` | Category filter clicked | `category` |
| `search` | Search submit | `search_term`, `results_count` |
| `product_search` | Search submit (project-specific duplicate for easier exploration) | `search_term`, `results_count` |
| `view_item` | Product detail opened | `currency`, `value`, `items[]` |
| `product_detail_open` | Product detail opened | `product_id`, `product_name`, `product_category`, `price` |
| `add_to_cart` | Add button / quantity increase | `currency`, `value`, `items[]`, `action_source` |
| `remove_from_cart` | Quantity decrease / removal | `currency`, `value`, `items[]` |
| `view_cart` | Cart drawer opened | `currency`, `value`, `items[]` |
| `begin_checkout` | Checkout button pressed | `currency`, `value`, `items[]` |
| `purchase` | Demo purchase completed | `transaction_id`, `currency`, `value`, `tax`, `shipping`, `items[]` |
| `newsletter_signup` | Demo newsletter form submitted | `form_name`, `method`, `email_domain` |
| `form_validation_error` | Newsletter validation failure | `form_name`, `field` |
| `scroll_depth` | Scroll reaches 25/50/75/90% | `percent_scrolled` |
| `page_engagement_summary` | Page hidden/tab switched | `visible_time_ms`, `page_name` |
| `demo_js_error` | JS runtime error | `message`, `source`, `line` |

Events are sent through `gtag` and also added to `dataLayer`. GA4's automatically collected/enhanced measurement events may be recorded separately.
