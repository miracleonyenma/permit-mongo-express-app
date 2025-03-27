// ./src/controllers/authController.ts

import bcrypt from "bcryptjs";
import User from "../models/User";
import { generateToken } from "../middleware/auth";

/**
 * Handles user registration process
 * Validates input, checks for existing users, and creates a new user account
 * @param req Express request object containing user registration details
 * @param res Express response object for sending back registration result
 */
export const registerUser = async (req, res) => {
  try {
    // Extract user registration details from request body
    const { username, email, password } = req.body;

    // Validate that all required fields are provided
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: "Please provide all required fields" });
    }

    // Check if a user with the same email or username already exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Generate a salt and hash the password for secure storage
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user document with hashed password
    user = new User({
      username,
      email,
      password: hashedPassword,
    });

    // Save the new user to the database
    await user.save();

    // Generate an authentication token for the new user
    const token = generateToken(user._id.toString());

    // Respond with user details and authentication token
    res.status(201).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    // Log any errors during registration and send a generic server error response
    console.error(error);
    res.status(500).json({ error: "Server error during registration" });
  }
};

/**
 * Handles user login process
 * Validates credentials and generates an authentication token
 * @param req Express request object containing user login credentials
 * @param res Express response object for sending back login result
 */
export const loginUser = async (req, res) => {
  try {
    // Extract login credentials from request body
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // Return generic error to prevent user enumeration
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Compare provided password with stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Return generic error to prevent user enumeration
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Generate an authentication token for the user
    const token = generateToken(user._id.toString());

    // Respond with user details and authentication token
    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    // Log any errors during login and send a generic server error response
    console.error(error);
    res.status(500).json({ error: "Server error during login" });
  }
};
