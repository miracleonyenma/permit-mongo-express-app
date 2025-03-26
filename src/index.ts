import express from "express";
import connectDB from "./config/database";
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";
import { errorHandler } from "./middleware/errorHandler";
import { formatIPUrl } from "@untools/ip-url";

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to Database
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

// Error Handling Middleware
app.use(errorHandler);

// Start Server
app.listen(PORT, async () => {
  // Format a URL with the IP address
  const url = formatIPUrl(PORT as number);
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Network Address at ${url}`);
});
