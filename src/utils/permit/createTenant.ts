// ./src/utils/permit/createTenant.ts
import permit from "../../lib/permit";

/**
 * Creates a new tenant in the Permit.io authorization platform
 * Handles tenant creation and provides error logging
 *
 * @param {Object} options - Configuration options for creating a tenant
 * @param {string} options.name - The name of the tenant to be created
 * @param {string} options.key - A unique identifier or key for the tenant
 * @returns {Promise<Object|null>} The created tenant object or null if creation fails
 */
const createTenant = async ({
  name,
  key,
}: {
  name: string;
  key: string;
}): Promise<object | null> => {
  try {
    // Call Permit.io API to create a new tenant with provided name and key
    const tenant = await permit.api.createTenant({
      name,
      key,
    });

    // Log successful tenant creation for tracking and debugging
    console.log("Tenant created:", tenant);

    // Return the created tenant object
    return tenant;
  } catch (error) {
    // Log any errors encountered during tenant creation
    console.error("Error creating tenant:", error);

    // Return null to indicate tenant creation failure
    return null;
  }
};

export default createTenant;
