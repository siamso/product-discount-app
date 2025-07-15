
# Product Discount App

This app allows store owners to create and manage product bundles with custom discount rules. It fetches products directly from the Shopify store, lets you group them into bundles, set percentage or fixed discounts, and activate or deactivate bundle offers. 


## Features

- Fetches and displays all products from your Shopify store.
- Allows creation of product bundles by selecting multiple products.
- Supports setting bundle discounts (percentage or fixed amount).
- Stores bundle configurations and their products in a local SQLite database.
- Lets you activate or deactivate bundle offers.
- Provides a UI to view, edit, and delete bundles.


## Demo

[![IMAGE ALT TEXT HERE](https://img.youtube.com/vi/4NHz4u3UjsM/0.jpg)](https://www.youtube.com/watch?v=4NHz4u3UjsM)



## Installation

Clone the repository:

```bash
git clone https://github.com/siamso/product-discount-app.git
cd product-discount-app
```
Install dependencies for backend and frontend:

```bash
cd web
npm install
cd ../web/frontend
npm install
```
Configure Shopify app:

Set up environment variables:

Copy .env.example to .env in the web directory and fill in your Shopify API credentials and app URLs.

Update shopify.app.toml with your app’s client ID, URLs, and required scopes.
Make sure your app is registered in the Shopify Partners dashboard.
Database setup:

Ensure web/schema.sql exists (it will auto-create the SQLite database on first run).
## Deployment

Start the backend server:
go to root direactory
```bash
npm run dev
```
## Tech Stack

Backend: Node.js, Express.js

Database: SQLite (using sqlite3 package)

Frontend: React (with Vite as the build tool,react router)

Shopify Integration: Shopify Admin API, Shopify App Bridge, Shopify Polaris (UI components)

Authentication: Shopify OAuth (handled via Shopify CLI and app bridge)

Other Tools: Cloudflare Tunnel or ngrok (for local development/public URL), cross-env, nodemon

Package Management: npm