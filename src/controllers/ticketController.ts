// ./src/controllers/ticketController.ts

import Ticket from "../models/Ticket";
import Membership from "../models/Membership";
import mongoose from "mongoose";
import checkUserPermission from "../utils/permit/checkUserPermission";
import createResourceInstance from "../utils/permit/createResourceInstance";
import filterTicketsByPermission from "../utils/permit/filterTicketsByPermission";
import { ICompany } from "../models/Company";
import permit from "../lib/permit";
import assignRole from "../utils/permit/assignRole";

/**
 * Creates a new ticket within a specific company
 * Uses a MongoDB transaction to ensure data consistency
 * @param req Express request object containing ticket details
 * @param res Express response object for sending back results
 */
export const createTicket = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { subject, description, companyId } = req.body;

    // Verify user authentication and company membership
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Check if user is a member of the specified company
    // const membership = await Membership.findOne({
    //   user: req.user._id,
    //   company: companyId,
    // });

    // if (!membership) {
    //   return res.status(403).json({ error: "Not a member of this company" });
    // }

    // Check permission to create ticket in this company
    const permitted = await checkUserPermission({
      user: req.user._id.toString(),
      action: "create",
      resource: {
        type: "Ticket",
        tenant: companyId.toString(),
      },
    });

    if (!permitted) {
      return res.status(403).json({ error: "Permission denied" });
    }

    // Create new ticket
    const ticket = new Ticket({
      subject,
      description,
      createdBy: req.user._id,
      company: companyId,
      status: "open",
    });

    // Save ticket within transaction
    await ticket.save({ session });

    // Create resource in Permit.io
    await createResourceInstance({
      key: ticket._id.toString(),
      resource: "Ticket",
      tenant: companyId.toString(),
    });

    // assign viewer instance role
    await assignRole({
      user: req.user,
      role: "viewer",
      resource_instance: `Ticket:${ticket._id.toString()}`,
      tenantId: companyId.toString(),
    });

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Ticket created successfully",
      ticket: {
        id: ticket._id,
        subject: ticket.subject,
        description: ticket.description,
        status: ticket.status,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error(error);
    res.status(500).json({ error: "Server error while creating ticket" });
  }
};

/**
 * Retrieves tickets for a user based on their permissions
 * @param req Express request object containing authenticated user
 * @param res Express response object for sending back ticket list
 */
export const getTicketsForUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Find memberships to get all companies the user belongs to
    const memberships = await Membership.find({
      user: req.user._id,
    }).select("company");

    const companyIds = memberships.map((m) => m.company);

    // Find all tickets across user's companies
    const tickets = await Ticket.find({
      company: { $in: companyIds },
    });

    // Perform permission filtering
    const authorizedTickets = await filterTicketsByPermission(
      req.user._id.toString(),
      tickets,
    );

    res.json(authorizedTickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error while fetching tickets" });
  }
};

/**
 * Updates an existing ticket
 * @param req Express request object containing ticket update details
 * @param res Express response object for sending back update result
 */
export const updateTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const updateData = req.body;

    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Find the ticket and ensure it exists
    const ticket = await Ticket.findById(ticketId).populate<{
      company: ICompany;
    }>("company");
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    // Check permission to update ticket
    const permitted = await checkUserPermission({
      user: req.user._id.toString(),
      action: "update",
      resource: {
        type: "Ticket",
        tenant: ticket.company._id.toString(),
      },
    });

    if (!permitted) {
      return res.status(403).json({ error: "Permission denied" });
    }

    // Update ticket
    Object.assign(ticket, updateData);
    await ticket.save();

    res.json({
      message: "Ticket updated successfully",
      ticket: {
        id: ticket._id,
        subject: ticket.subject,
        status: ticket.status,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error while updating ticket" });
  }
};

/**
 * Deletes a ticket
 * @param req Express request object containing ticket ID
 * @param res Express response object for sending back deletion result
 */
export const deleteTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;

    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Find the ticket and ensure it exists
    const ticket = await Ticket.findById(ticketId).populate<{
      company: ICompany;
    }>("company");
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    // Check permission to delete ticket
    const permitted = await checkUserPermission({
      user: req.user._id.toString(),
      action: "delete",
      resource: {
        type: "Ticket",
        tenant: ticket.company._id.toString(),
      },
    });

    if (!permitted) {
      return res.status(403).json({ error: "Permission denied" });
    }

    // Delete ticket
    await Ticket.findByIdAndDelete(ticketId);

    // Delete resource instance from Permit.io
    await permit.api.resourceInstances.delete(ticketId);

    res.json({
      message: "Ticket deleted successfully",
      ticketId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error while deleting ticket" });
  }
};
