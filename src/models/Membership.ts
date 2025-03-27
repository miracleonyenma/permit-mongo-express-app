// ./src/models/Membership.ts

import { Document, model, Schema } from "mongoose";

/**
 * Interface defining the structure of a Membership document
 * Represents the relationship between a user and a company
 * Extends Mongoose Document to provide TypeScript type safety
 */
export interface IMembership extends Document {
  // Reference to the user who is a member
  user: Schema.Types.ObjectId;

  // Reference to the company the user is a member of
  company: Schema.Types.ObjectId;

  // Timestamp of membership creation
  createdAt: Date;

  // Reference to the user who created this membership
  createdBy: Schema.Types.ObjectId;
}

/**
 * Mongoose schema definition for Membership
 * Defines the structure, validation, and metadata for membership documents
 * Creates a many-to-many relationship between Users and Companies
 * Uses timestamps option to automatically manage createdAt field
 */
export const MembershipSchema = new Schema<IMembership>(
  {
    // Reference to the user who is a member
    // Links to the User model and is a required field
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },

    // Reference to the company the user is a member of
    // Links to the Company model and is a required field
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
  },
  {
    // Automatically add and manage createdAt and updatedAt timestamps
    timestamps: true,
  }
);

// Create and export the Membership model based on the schema
// This model provides an interface to interact with the memberships collection in the database
const Membership = model<IMembership>("Membership", MembershipSchema);

export default Membership;
