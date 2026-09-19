const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const productRoutes = require("./routes/productRoutes");
const mainProductRoutes = require("./routes/mainProductRoutes");
const customizationRoutes = require("./routes/customizationRoutes");
const addonRoutes = require("./routes/addonRoutes");
const adminRoutes = require("./routes/adminRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentConfigRoutes = require("./routes/paymentConfigRoutes");
const portfolioRoutes = require("./routes/portfolioRoutes");
const journalRoutes = require("./routes/journalRoutes");
const newArrivalRoutes = require("./routes/newArrivalRoutes");
const materialRoutes = require("./routes/materialRoutes");
const platformRoutes = require("./routes/platformRoutes");
const relatedContentRoutes = require("./routes/relatedContentRoutes");
const customerRoutes = require("./routes/customerRoutes");
const savedDesignRoutes = require("./routes/savedDesignRoutes");
const savedOrderRoutes = require("./routes/savedOrderRoutes");
const aboutRoutes = require("./routes/aboutRoutes");
const contactRoutes = require("./routes/contactRoutes");
const hubSectionImageRoutes = require("./routes/hubSectionImageRoutes");

const app = express();

// Customer accounts use an httpOnly session cookie, which only reaches the
// backend cross-origin (Vercel frontend -> Render backend) if CORS allows
// credentials for a specific, known origin - a wildcard origin() can't be
// combined with credentials:true at all, browsers reject it outright.
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://goalthalisports.com",
  "https://www.goalthalisports.com",
  "https://goalthalisports.vercel.app",
  "http://localhost:3000",
].filter(Boolean);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "GTS Backend is running",
  });
});

app.use("/api/products", productRoutes);
app.use("/api/main-products", mainProductRoutes);
app.use("/api/customizations", customizationRoutes);
app.use("/api/addons", addonRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment-config", paymentConfigRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/journal", journalRoutes);
app.use("/api/new-arrivals", newArrivalRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/platforms", platformRoutes);
app.use("/api/related-content", relatedContentRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/saved-designs", savedDesignRoutes);
app.use("/api/saved-orders", savedOrderRoutes);
app.use("/api/about", aboutRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/hub-section-images", hubSectionImageRoutes);

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
}

startServer();