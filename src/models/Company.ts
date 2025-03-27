// ./src/models/Company.ts

import { Document, model, Schema } from "mongoose";

/**
 * Interface defining the structure of a Company document
 * Extends Mongoose Document to provide TypeScript type safety
 * Includes core fields for company information and metadata
 */
export interface ICompany extends Document {
  // Company name
  name: string;

  // Reference to the user who created the company
  createdBy: Schema.Types.ObjectId;

  // Automatically managed timestamps for creation and last update
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mongoose schema definition for Company
 * Defines the structure, validation, and metadata for company documents
 * Uses timestamps option to automatically manage createdAt and updatedAt fields
 */
export const CompanySchema = new Schema<ICompany>(
  {
    // Company name field
    // Required and must be a string
    name: { type: String, required: true },

    // Reference to the user who created the company
    // Links to the User model and is a required field
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    // Automatically add and manage createdAt and updatedAt timestamps
    timestamps: true,
  }
);

// Create and export the Company model based on the schema
// This model provides an interface to interact with the companies collection in the database
const Company = model<ICompany>("Company", CompanySchema);

export default Company;
