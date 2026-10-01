require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/auth.routes");
const userRoutes = require("./src/routes/user.routes");
const { notFound, errorHandler } = require("./src/middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
connectDB();

app.get("/", (req, res) => res.send("EventHorizon API is running"));

// No frontend yet, so the emailed link (CLIENT_URL/verify-email?token=...) lands here
// and forwards to the real API endpoint. Remove once a frontend handles this page.
app.get("/verify-email", (req, res) =>
  res.redirect(`/api/auth/verify-email?token=${encodeURIComponent(req.query.token || "")}`)
);

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

app.use(notFound);      // must come after all routes
app.use(errorHandler);  // must be last

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));