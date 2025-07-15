// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import {
  initDatabase,
  runQuery,
  getRow,
  getAllRows,
  runTransaction,
  closeDatabase,
} from "./database.js";
import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import PrivacyWebhookHandlers from "./privacy.js";

const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();

// Initialize database
try {
  initDatabase();
  console.log("Database initialized successfully");
} catch (error) {
  console.error("Failed to initialize database:", error);
}

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: PrivacyWebhookHandlers })
);

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

app.use(express.json());
app.use("/api/*", shopify.validateAuthenticatedSession());

app.post("/api/price-rule", async (req, res) => {
  const {
    title,
    value,
    targetType,
    targetSelection,
    allocationMethod,
    customerSelection,
    startsAt,
    endsAt,
  } = req.body;
  const client = new shopify.api.clients.Rest({
    session: res.locals.shopify.session,
  });
  try {
    const priceRuleResponse = await client.post({
      path: "price_rules",
      data: {
        price_rule: {
          title: title || "Bundle Discount",
          value: value || "-25.0", // negative for discount
          target_type: targetType || "line_item",
          target_selection: targetSelection || "all",
          allocation_method: allocationMethod || "across",
          customer_selection: customerSelection || "all",
          starts_at: startsAt || new Date().toISOString(),
          ends_at: endsAt || null,
        },
      },
    });
    res
      .status(201)
      .json({ success: true, priceRule: priceRuleResponse.body.price_rule });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Get all products
app.get("/api/products", async (req, res) => {
  const client = new shopify.api.clients.Rest({
    session: res.locals.shopify.session,
  });
  try {
    const response = await client.get({
      path: "products",
      query: { limit: 50 },
    });
    res.status(200).json(response.body.products);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get all bundles
app.get("/api/bundles", async (req, res) => {
  try {
    const bundles = await getAllRows("SELECT * FROM bundles");
    res.status(200).json(bundles);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Create a bundle
app.post("/api/bundles", async (req, res) => {
  const { name, products, discountType, discountValue, isActive, totalValue } =
    req.body;
  try {
    await runQuery(
      "INSERT INTO bundles (name, products, discountType, discountValue, isActive, totalValue) VALUES (?, ?, ?, ?, ?, ?)",
      [
        name,
        JSON.stringify(products),
        discountType,
        discountValue,
        isActive ? 1 : 0,
        totalValue,
      ]
    );
    res.status(201).json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Update a bundle
app.put("/api/bundles/:id", async (req, res) => {
  const { name, products, discountType, discountValue, isActive, totalValue } =
    req.body;
  try {
    await runQuery(
      "UPDATE bundles SET name=?, products=?, discountType=?, discountValue=?, isActive=?, totalValue=? WHERE id=?",
      [
        name,
        JSON.stringify(products),
        discountType,
        discountValue,
        isActive ? 1 : 0,
        totalValue,
        req.params.id,
      ]
    );
    res.status(200).json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Delete a bundle
app.delete("/api/bundles/:id", async (req, res) => {
  try {
    await runQuery("DELETE FROM bundles WHERE id=?", [req.params.id]);
    res.status(200).json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
// app.get("/api/products/count", async (_req, res) => {
//   const client = new shopify.api.clients.Graphql({
//     session: res.locals.shopify.session,
//   });

//   const countData = await client.request(`
//     query shopifyProductCount {
//       productsCount {
//         count
//       }
//     }
//   `);

//   res.status(200).send({ count: countData.data.productsCount.count });
// });

// app.post("/api/products", async (_req, res) => {
//   let status = 200;
//   let error = null;

//   try {
//     await productCreator(res.locals.shopify.session);
//   } catch (e) {
//     console.log(`Failed to process products/create: ${e.message}`);
//     status = 500;
//     error = e.message;
//   }
//   res.status(status).send({ success: status === 200, error });
// });

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), (req, res, next) => {
  res
    .status(200)
    .set("Content-Type", "text/html")
    .send(
      readFileSync(join(STATIC_PATH, "index.html"))
        .toString()
        .replace("%VITE_SHOPIFY_API_KEY%", process.env.SHOPIFY_API_KEY || "")
    );
});

app.listen(PORT);
