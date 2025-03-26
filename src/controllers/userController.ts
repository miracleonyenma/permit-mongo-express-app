import { Request, Response } from "express";
import User from "../models/User";

export const createUser = async (req, res) => {
  try {
    const { username, email } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const newUser = new User({ username, email });
    await newUser.save();

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({
      message: "Error creating user",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching users",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
