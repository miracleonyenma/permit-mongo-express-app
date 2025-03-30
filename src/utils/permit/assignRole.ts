// ./src/utils/permit/assignRole.ts
import permit from "../../lib/permit";
import { IUser } from "../../models/User";

/**
 * Assigns a specific role to a user within a given tenant in the Permit.io authorization platform
 * Provides a centralized method for managing user roles across the application
 *
 * @param {Object} options - Configuration options for role assignment
 * @param {IUser} options.user - The user to whom the role will be assigned
 * @param {string} options.role - The name of the role to be assigned
 * @param {string} options.tenantId - The unique identifier of the tenant context
 * @returns {Promise<void>} A promise that resolves when the role is assigned or fails silently
 */
const assignRole = async ({
  user,
  role,
  tenantId,
  resource_instance,
}: {
  user: IUser;
  role: string;
  tenantId: string;
  resource_instance?: string;
}): Promise<void> => {
  try {
    // Use Permit.io API to assign the specified role to the user within the given tenant
    await permit.api.assignRole({
      role, // The name of the role
      user: user?.id, // The unique user identifier
      tenant: tenantId, // The tenant context for the role assignment
      ...(resource_instance && { resource_instance }), // The unique identifier of the resource instance
    });
  } catch (error) {
    // Log any errors encountered during role assignment
    // Fails silently to prevent role assignment from blocking critical workflows
    console.error("Error assigning role:", error);
  }
};

export default assignRole;
