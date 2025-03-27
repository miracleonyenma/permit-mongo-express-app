// ./src/utils/permit/syncUser.ts

import permit from "../../lib/permit";
import { IUser } from "../../models/User";

/**
 * Sync a user to Permit.io when they sign up.
 * This function creates a user entry in Permit.io and assigns them a default role.
 *
 * @param {IUser} user - The user object containing user details.
 * @param {string} tenantId - The ID of the tenant the user belongs to.
 */
const syncUserToPermit = async (user: IUser, tenantId: string) => {
  try {
    // Create or update the user in Permit.io
    await permit.api.syncUser({
      key: user._id.toString(), // Unique identifier for the user
      email: user.email, // User's email address
      first_name: user.username.split(" ")[0], // Extract the first name from the username
      last_name: user.username.split(" ")[1] || "", // Extract the last name or default to an empty string
    });

    // Assign the user a default role ("viewer") in the specified tenant
    await permit.api.users.assignRole({
      user: user._id.toString(), // Reference the user by their unique ID
      role: "viewer", // Assign the "viewer" role
      tenant: tenantId, // Specify the tenant the user belongs to
    });
  } catch (error) {
    // Log any errors encountered during the sync process
    console.error("Error syncing user to Permit:", error);
  }
};

export default syncUserToPermit;
