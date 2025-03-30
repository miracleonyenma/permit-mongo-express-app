// ./src/models/Ticket.ts

import { Document, model, Schema } from "mongoose";

/**
 * ITicket interface extends Mongoose's Document interface,
 * defining the structure of a support ticket.
 */
export interface ITicket extends Document {
  /** The subject/title of the ticket */
  subject: string;

  /** A detailed description of the issue */
  description: string;

  /** The current status of the ticket */
  status: "open" | "in-progress" | "resolved";

  /** The user who created the ticket (referencing the User model) */
  createdBy: Schema.Types.ObjectId;

  /** The user assigned to handle the ticket (optional, referencing the User model) */
  assignedTo?: Schema.Types.ObjectId;

  /** Reference to the company associated with the ticket (optional, referencing the Company model) */
  company?: Schema.Types.ObjectId;

  /** The date when the ticket was created (automatically managed by Mongoose) */
  createdAt: Date;

  /** The date when the ticket was last updated (optional, automatically managed by Mongoose) */
  updatedAt?: Date;
}

/**
 * Mongoose schema definition for the Ticket model.
 */
const TicketSchema = new Schema<ITicket>(
  {
    /** Subject of the ticket (required) */
    subject: { type: String, required: true },

    /** Description of the issue (required) */
    description: { type: String, required: true },

    /** Status of the ticket, with predefined allowed values */
    status: {
      type: String,
      enum: ["open", "in-progress", "resolved"],
      default: "open",
    },

    /** Reference to the user who created the ticket (required) */
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },

    /** Reference to the user assigned to the ticket (optional) */
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },

    /** Reference to the company associated with the ticket (optional) */
    company: { type: Schema.Types.ObjectId, ref: "Company" },
  },
  {
    /** Enables automatic `createdAt` and `updatedAt` timestamps */
    timestamps: true,
  },
);

/**
 * Mongoose model for the Ticket schema, representing a support ticket in the database.
 */
const Ticket = model<ITicket>("Ticket", TicketSchema);

export default Ticket;
