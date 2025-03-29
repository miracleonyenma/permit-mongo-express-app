import { ResourceInstanceRead } from "permitio/build/main/openapi";
import permit from "../../lib/permit";

// Function to create a new resource instance
const createResourceInstance = async ({
  key,
  resource,
  tenant = "default",
}: {
  key: string;
  resource: string;
  tenant: string;
}): Promise<ResourceInstanceRead> => {
  try {
    console.log("Creating resource instance:", { key, resource, tenant });

    // Create resource instance using Permit.io API
    const resourceInstance = await permit.api.resourceInstances.create({
      key,
      resource,
      tenant,
    });

    console.log("Resource instance created successfully:", resourceInstance);
    return resourceInstance;
  } catch (error) {
    console.error("Error creating resource instance:", error);
    throw new Error(`Failed to create resource instance: ${error.message}`);
  }
};

export default createResourceInstance;
