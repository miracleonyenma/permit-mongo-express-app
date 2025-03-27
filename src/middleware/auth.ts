// ./src/middleware/auth.ts

import jwt from "jsonwebtoken";
import User from "../models/User";

// Extend the Express Request interface to support attaching user information
// This allows TypeScript to recognize the custom 'user' property on request objects
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Authentication middleware to validate JWT token and attach user to request
 * Checks for valid authorization token, verifies its authenticity, and adds user to request
 * @param req Express request object containing authorization header
 * @param res Express response object for sending authentication errors
 * @param next Express next function to continue to next middleware/route handler
 */
export const authMiddleware = async (req, res, next) => {
  try {
    // Extract the JWT token from the Authorization header
    // Removes the "Bearer " prefix if present
    const token = req.header("Authorization")?.replace("Bearer ", "");

    // Reject request if no token is provided
    if (!token) {
      return res.status(401).json({ error: "No token, authorization denied" });
    }

    // Retrieve JWT secret from environment variables with a fallback default
    // Note: In production, always use a strong, unique secret from environment variables
    const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

    // Verify the token's validity and decode its payload
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    // Find the user associated with the token's userId
    const user = await User.findById(decoded.userId);

    // Throw an error if no user is found for the given token
    if (!user) {
      throw new Error("User not found");
    }

    // Attach the user object to the request for use in subsequent middleware/routes
    req.user = user;

    // Continue to the next middleware or route handler
    next();
  } catch (error) {
    // Handle any errors in token verification (expired, invalid, etc.)
    // Send a generic authentication error response
    res.status(401).json({ error: "Please authenticate" });
  }
};

/**
 * Generates a JSON Web Token (JWT) for user authentication
 * @param userId Unique identifier of the user
 * @returns A signed JWT token valid for 7 days
 */
export const generateToken = (userId: string) => {
  // Retrieve JWT secret from environment variables with a fallback default
  // Note: In production, always use a strong, unique secret from environment variables
  const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

  // Create a JWT token with:
  // - Payload containing the user ID
  // - Signed with a secret key
  // - Expiration set to 7 days
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
};
