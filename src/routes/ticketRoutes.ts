// ./src/routes/ticketRoutes.ts

import express from "express";
import {
  createTicket,
  getTicketsForUser,
  updateTicket,
  deleteTicket,
} from "../controllers/ticketController";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

// Create a new ticket (requires authentication)
router.post("/", authMiddleware, createTicket);

// Get tickets for the authenticated user
router.get("/", authMiddleware, getTicketsForUser);

// Update a specific ticket (requires authentication)
router.put("/:ticketId", authMiddleware, updateTicket);

// Delete a specific ticket (requires authentication)
router.delete("/:ticketId", authMiddleware, deleteTicket);

export default router;
