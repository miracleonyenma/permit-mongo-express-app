import express from "express";
import {
  createCompany,
  getCompaniesForUser,
  addMemberToCompany,
} from "../controllers/companyController";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

// Create a new company (requires authentication)
router.post("/", authMiddleware, createCompany);

// Get companies for the authenticated user
router.get("/", authMiddleware, getCompaniesForUser);

// Add a member to a company (requires authentication)
router.post("/members", authMiddleware, addMemberToCompany);

export default router;
