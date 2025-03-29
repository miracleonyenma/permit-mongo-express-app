// ./src/utils/permit/checkUserPermission.ts
import { IResource } from "permitio";
import permit from "../../lib/permit";

/**
 * Checks if a user has permission to perform a specific action on a resource
 * Utilizes Permit.io's authorization API to validate user permissions
 *
 * @param {Object} options - Configuration options for permission checking
 * @param {string} options.user - The unique identifier of the user
 * @param {string} options.action - The action being attempted (e.g., 'read', 'write', 'delete')
 * @param {string | IResource} options.resource - The resource being accessed
 * @param {Record<string, any>} [options.context] - Optional context for more granular permission checks
 * @returns {Promise<boolean>} A promise resolving to whether the user has permission
 * @throws {Error} Throws an error if the permission check fails
 */
const checkUserPermission = async ({
  user,
  action,
  resource,
  context,
}: {
  user: string;
  action: string;
  resource: string | IResource;
  context?: Record<string, any>;
}): Promise<boolean> => {
  try {
    // Use Permit.io's check method to validate user permissions
    // Performs a comprehensive permission check based on user, action, resource, and optional context
    const check = await permit.check(user, action, resource, context);

    // Log the permission check result for debugging and auditing purposes
    console.log("Permission check result:", check);

    // Return the boolean result of the permission check
    return check;
  } catch (error) {
    // Log any errors encountered during the permission check
    console.error("Error checking user permission:", error);

    // Throw a descriptive error to provide more context about the permission check failure
    throw new Error(`Failed to check user permission: ${error.message}`);
  }
};

export default checkUserPermission;
