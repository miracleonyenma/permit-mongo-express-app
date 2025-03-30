// ./src/utils/permit/filterTicketsByPermission.ts
import permit from "../../lib/permit";
import { ITicket } from "../../models/Ticket";

/**
 * Filters a list of tickets based on the user's read permissions
 * Performs a bulk permission check to efficiently validate access to multiple tickets
 *
 * @param {string} userId - The unique identifier of the user performing the permission check
 * @param {ITicket[]} tickets - An array of ticket documents to filter
 * @returns {Promise<ITicket[]>} A promise resolving to an array of tickets the user can read
 */
async function filterTicketsByPermission(
  userId: string,
  tickets: ITicket[],
): Promise<ITicket[]> {
  // If no tickets are provided, return an empty array
  if (!tickets.length) return [];

  // Prepare resource objects for bulk permission checking
  // Each resource represents a ticket with its type, ID, and tenant context
  const resources = tickets.map((ticket) => ({
    type: "Ticket",
    key: ticket.id,
    tenant: ticket.company.toString(),
  }));

  // Perform a bulk permission check using Permit.io
  // Checks 'read' action for each ticket across all provided tickets
  const permissionResults = await permit.bulkCheck(
    resources.map((resource) => ({
      user: userId,
      resource,
      action: "read",
    })),
  );

  // Filter the tickets array to include only those where the permission check passed
  // Uses the index from permissionResults to determine ticket visibility
  return tickets.filter((_, index) => permissionResults[index]);
}

export default filterTicketsByPermission;
