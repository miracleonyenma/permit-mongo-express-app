// ./src/controllers/companyController.ts

import Company, { ICompany } from "../models/Company";
import Membership from "../models/Membership";
import mongoose from "mongoose";

/**
 * Creates a new company and automatically assigns the creator as its first member
 * Uses a MongoDB transaction to ensure data consistency
 * @param req Express request object containing user and company details
 * @param res Express response object for sending back results
 */
export const createCompany = async (req, res) => {
  // Start a MongoDB session for transaction management
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { name } = req.body;

    // Verify user authentication before allowing company creation
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Initialize a new Company document with the provided name and creator's ID
    const company = new Company({
      name,
      createdBy: req.user._id,
    });

    // Save the new company within the transaction
    await company.save({ session });

    // Create a membership record to associate the creator with the company
    const membership = new Membership({
      user: req.user._id,
      company: company._id,
      createdBy: req.user._id,
    });

    // Save the membership within the same transaction
    await membership.save({ session });

    // Commit the transaction, ensuring both company and membership are saved atomically
    await session.commitTransaction();
    session.endSession();

    // Respond with successful creation details
    res.status(201).json({
      message: "Company created successfully",
      company: {
        id: company._id,
        name: company.name,
      },
      membership: {
        id: membership._id,
        userId: membership.user,
        companyId: membership.company,
      },
    });
  } catch (error) {
    // If any error occurs, abort the transaction and rollback changes
    await session.abortTransaction();
    session.endSession();

    // Log the error and send a generic server error response
    console.error(error);
    res.status(500).json({ error: "Server error while creating company" });
  }
};

/**
 * Retrieves all companies a user is a member of
 * Populates company details for each membership
 * @param req Express request object containing authenticated user
 * @param res Express response object for sending back company list
 */
export const getCompaniesForUser = async (req, res) => {
  try {
    // Verify user authentication before retrieving companies
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Find all membership records for the user and populate associated company details
    const memberships = await Membership.find({ user: req.user._id }).populate<{
      company: ICompany;
    }>({
      path: "company",
      select: "name createdBy createdAt updatedAt",
    });

    // Transform membership records into a list of company details
    const companies = memberships.map((membership) => ({
      id: membership.company._id,
      name: membership.company.name,
      createdBy: membership.company.createdBy,
      createdAt: membership.company.createdAt,
      updatedAt: membership.company.updatedAt,
    }));

    // Send the list of companies back to the client
    res.json(companies);
  } catch (error) {
    // Log any errors and send a generic server error response
    console.error(error);
    res.status(500).json({ error: "Server error while fetching companies" });
  }
};

/**
 * Adds a new member to an existing company
 * Performs validation to prevent duplicate memberships
 * @param req Express request object containing company and user IDs
 * @param res Express response object for sending back membership result
 */
export const addMemberToCompany = async (req, res) => {
  try {
    const { companyId, userId } = req.body;

    // Verify user authentication before allowing member addition
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Validate that the company exists
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    // Check if the user is already a member of the company
    const existingMembership = await Membership.findOne({
      user: userId,
      company: companyId,
    });

    // Prevent duplicate memberships
    if (existingMembership) {
      return res
        .status(400)
        .json({ error: "User is already a member of this company" });
    }

    // Create a new membership record
    const membership = new Membership({
      user: userId,
      company: companyId,
      createdBy: req.user._id,
    });

    // Save the new membership
    await membership.save();

    // Respond with successful membership creation details
    res.status(201).json({
      message: "Member added successfully",
      membership: {
        id: membership._id,
        userId: membership.user,
        companyId: membership.company,
      },
    });
  } catch (error) {
    // Log any errors and send a generic server error response
    console.error(error);
    res.status(500).json({ error: "Server error while adding member" });
  }
};
