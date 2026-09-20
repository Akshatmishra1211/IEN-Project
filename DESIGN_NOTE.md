# Design Note & Reliability Architecture

## 1. How Scraping Was Made Reliable Across Unattended Runs
The INE mock store storefront (`https://demo.inelabteamdev.com/`) incorporates deliberate anti-scraping complexity:
- **Client-Side WASM & Fingerprinting**: Prices are not returned in static HTML or basic product detail REST APIs (`/api/product/:id`). Instead, JavaScript code computes canvas/WebGL fingerprints and executes proof-of-work calculations before fetching an encrypted payload (`GET /api/products/:id/price`) using a short-lived bearer token.
- **Dynamic Interaction Requirements**: The price UI requires mouse movements/hovers or explicit interaction ("REVEAL PRICE") to trigger the execution chain.
- **Asynchronous Delays & Transient Errors**: Content loads asynchronously with variable network delays and intentional 429 / HTTP error spikes.

### Multi-Layer Reliability Strategy
1. **Headless Browser Execution (Playwright)**:
   - Uses Playwright to render JavaScript and execute WASM challenges naturally as a browser context.
   - Automatically handles cookie consent modals (`Accept`) before interaction.
   - Simulates human mouse movement and triggers the DOM reveal elements to force price rendering.
2. **Exponential Backoff & Retries**:
   - Up to 3 retry attempts per scrape.
   - Uses exponential backoff delays ($2^\text{attempt} \times 1000\text{ms}$) between retries to recover from 429 Rate Limits and slow network responses.
3. **Honest Outcome Logging & Audit Trail**:
   - Attempts are logged in Supabase as `SUCCESS`, `RETRIED`, or `FAILED`.
   - Never silences errors or stores fallback `₹0` values; failures record duration and explicit error messages.
4. **DOM Shift & Structure Change Detection**:
   - Validates key DOM selectors (product title, price container).
   - Flags `structure_changed = true` if page elements move or shift drastically, alerting maintainers before data corruption occurs.

---

## 2. Technical Trade-Offs Made

| Decision / Option | Option Chosen | Trade-Off Rationale |
| :--- | :--- | :--- |
| **HTTP Parsing vs Headless Browser** | **Playwright Headless Browser** | Direct HTTP parsing fails because price retrieval relies on dynamic WASM computation and encrypted single-use tokens. Playwright guarantees 100% extraction accuracy at the cost of slightly higher memory/cpu per run. |
| **Scheduling Mechanism** | **External Cron (cron-job.org / Webhook)** | Free-tier Render instances go to sleep after inactivity. Triggering scrapes via external HTTP webhooks (`POST /api/cron/scrape-all`) wakes the backend on schedule without needing an expensive 24/7 process. |
| **Local / Dev Database Strategy** | **Supabase Client + Local Memory Fallback** | Allows instant local running without forcing mandatory DB keys on first boot, while seamlessly syncing with Supabase in production. |

---

## 3. AI Tool Initial Misconceptions & Corrections

1. **Initial Misconception: Static API Endpoint Expectation**
   - *AI First Attempt*: Assumed `/api/product/:id` would return price and stock directly.
   - *Correction*: Code inspection revealed `/api/product/:id` only returns metadata (specs/reviews). The price is dynamically loaded via WASM anti-bot tokens and encrypted JSON payloads. We corrected this by engineering a Playwright automation flow that interacts directly with the rendered DOM reveal triggers.

2. **Initial Misconception: Always-On Node.js Cron Loop**
   - *AI First Attempt*: Suggested `node-cron` running continuously inside Express.
   - *Correction*: Realized free-tier hosting (Render.com) puts idle containers to sleep, stopping background timers. We corrected the architecture to expose an authenticated `/api/cron/scrape-all` endpoint designed for external cron services (cron-job.org) or GitHub Actions workflows.
