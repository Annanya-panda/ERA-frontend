# ERA Marketplace Web

React, Redux Toolkit, Tailwind CSS, and React Router client for the ERA marketplace learning app.

## Run locally

1. Start the API and MongoDB using the setup instructions in the [ERA-backend repository](https://github.com/Annanya-panda/ERA-backend).
2. Copy `.env.example` to `.env` and set `VITE_API_URL=http://localhost:4000/api`.
3. Run `npm install` and `npm run dev`.
4. Open the Vite URL (normally `http://localhost:5173`).

Use seeded accounts `buyer@example.com`, `seller@example.com`, and `admin@example.com` with password `Demo123!`. The buyer flow demonstrates browse, filters, cart, checkout, and payment; the seller flow covers product/stock management and fulfillment; the admin flow covers seller approval and dashboards.

Run client tests with `npm test` and create a production bundle with `npm run build`. Payments are either Razorpay Test Mode or an explicitly local simulation, never live processing.
