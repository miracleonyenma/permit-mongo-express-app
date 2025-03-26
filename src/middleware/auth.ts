import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

// Extend the Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Get token from header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "No token, authorization denied" });
    }

    // Verify token
    const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    // Find user
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Please authenticate" });
  }
};

// Generate JWT Token
export const generateToken = (userId: string) => {
  const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
};
