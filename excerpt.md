### **Integrating Permit.io In our Express App**

Before we can sync data to [Permit.io](http://permit.io), we'll integrate Permit.io into our app by:

- Deploying a local Policy Decision Point (PDP) using Docker
- Installing the Permit SDK in our Express  application
- Creating utility functions for user synchronization and role assignment, permission checks, and more.

**Set up local PDP**

First, we’ll have to set up our Policy Decision Point, which is a network node responsible for answering authorization queries using policies and contextual data.

Pull the PDP container from Docker Hub [**(Click here to install Docker)**](https://docs.docker.com/get-docker/):

```bash
docker pull permitio/pdp-v2:latest
```

Run the container & replace the **`*PDP_API_KEY*`** environment variable with your API key:

```bash
docker run -it \
  -p 7766:7000 \
  --env PDP_API_KEY=<YOUR_API_KEY> \
  --env PDP_DEBUG=True \
  permitio/pdp-v2:latest
```

Now that we have our PDP set up, let’s dive into adding authorization to our app.

**Install Permit in our Express App**

In your terminal, navigate to the project folder and install [**Permit SDK**](https://www.npmjs.com/package/permitio)

```
npm install permitio
```

Create a new file - **`*./lib/permit.ts*`**:

```tsx
// ./src/lib/permit.ts
import { Permit } from "permitio";
const PERMIT_TOKEN = process.env.PERMIT_API_KEY;

const permit = new Permit({
  // you'll have to set the PDP url to the PDP you've deployedin the previous step
  pdp: "http://localhost:7766",
  token: PERMIT_TOKEN,
});
export default permit;
```

Next, we’ll create a few functions for assigning roles, checking permissions, and more using Permit:

### **Sync User**

Syncing a user registers their information in Permit.io, ensuring their roles and permissions are up to date for access control enforcement. [**Learn more**](https://docs.permit.io/overview/sync-your-first-user-with-sdk/).

Let’s create a [Permit.io](http://Permit.io) utility function to sync users. Create a new file - `./src/utils/permit/syncUser.ts`:

```tsx
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
    await permit.api.users.sync({
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
```

Here, we’re using the `permit.api.syncUser` method to synchronize user data with [Permit.io](http://permit.io/), ensuring the user is registered in the system. 

Then, we assign the user a default **"viewer"** role for a specific tenant using `permit.api.users.assignRole`. If anything goes wrong, we catch and log the error.

We’ll use this `syncUserToPermit` function during user registration, so in the `./src/controllers/authController.ts` file, in the `registerUser` function, we will call the `syncUserToPermit` function after the user has been created in MongoDB:

```tsx
// ./src/controllers/authController.ts

// ...

export const registerUser = async (req, res) => {
  try {
    // ...

    await user.save();

    // sync user to permit
    await syncUserToPermit(user, "default");

    // ...
  } catch (error) {
    // ...
  }
};
```

With that, when a user is created, that user is automatically synced to Permit and given a role of **“viewer”** in the **default** tenant:

Here’s how we create a new user:

![Screenshot 2025-03-26 at 19.03.09.png](attachment:f6cf50d9-614b-446f-9ba7-59a9b615b674:Screenshot_2025-03-26_at_19.03.09.png)

Here’s the user in Permit:

![image.png](attachment:45dc21d1-a39b-4531-b92e-b149b2037e1d:image.png)

Awesome. Next, we’re going to create tenants where the users and resources will be assigned to.

### **Create Tenants**

To create a tenant, we’ll use the [**createTenant](https://docs.permit.io/sdk/nodejs/tenant/create-tenant/)** method available in the Permit SDK to create a new tenant when a user creates a company in MongoDB.

Create a new file - `./src/utils/permit/createTenant.ts`:

```tsx
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
```

Here, we’re using the `permit.api.createTenant` method to create a tenant in Permit. 

### **Assign Role**

Let’s also create a helper function we can call whenever we want to perform a role assign ment. Create a new file - `./src/utils/permit/assignRole.ts`:

```tsx
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
}: {
  user: IUser;
  role: string;
  tenantId: string;
}): Promise<void> => {
  try {
    // Use Permit.io API to assign the specified role to the user within the given tenant
    await permit.api.users.assignRole({
      role, // The name of the role
      user: user?.id, // The unique user identifier
      tenant: tenantId, // The tenant context for the role assignment
    });
  } catch (error) {
    // Log any errors encountered during role assignment
    // Fails silently to prevent role assignment from blocking critical workflows
    console.error("Error assigning role:", error);
  }
};

export default assignRole;
```

This function will be used in the `createCompany` method in `./src/controllers/companyController.ts` to assign the user that created the company/tenant, the **admin** role.

Now that we have our `createTenant` and `assignRole` functions, we can go to the `./src/controllers/companyController.ts`, and make the following modifications:

```tsx
// ./src/controllers/companyController.ts

// ...

export const createCompany = async (req, res) => {
  // ...

  try {
    // ...

    // Save the new company within the transaction
    await company.save({ session });
    
    // create tenant in Permit.io
    await createTenant({
      key: company?.id,
      name: company.name,
    });

    // Create a membership record to associate the creator with the company
    const membership = new Membership({
      user: req.user._id,
      company: company._id,
      createdBy: req.user._id,
    });

    // Save the membership within the same transaction
    await membership.save({ session });

    // sync user to new tenant in Permit.io
    await syncUserToPermit(req.user, company?.id);

    // assign admin role to the creator in the new tenant
    await assignRole({
      user: req.user,
      tenantId: company?.id,
      role: "admin",
    });

    // ...
  } catch (error) {
    // ...
  }
};
```

Here, we integrate **Permit.io** for role-based access control (RBAC) when creating a company.

- **`createTenant`** registers the company as a tenant in **Permit.io**, creating an isolated permission space.
- **`syncUserToPermit`** ensures the creator is recognized in this new tenant, linking them to its permission system.
- **`assignRole`** grants the creator the **admin** role, allowing them to manage access and add members.

These changes ensure each company has its own access control structure, with the creator automatically assigned as an admin. 

Now, if we create a company by sending a POST request to [`http://localhost:9316/api/companies`](http://localhost:9316/api/companies):

![Screenshot 2025-03-27 at 12.39.15.png](attachment:0e560e1e-40a9-415e-ae43-4df271da4472:Screenshot_2025-03-27_at_12.39.15.png)

We should see our new tenant when we navigate to **Settings** page by clicking on the **Settings ⚙️** button at the top right of the **Directory** page:

![image.png](attachment:00df5c83-02e3-4016-a1e4-8a49f7bc29b8:image.png)

We will also see the tenant based roles assigned to our user:

![image.png](attachment:46eaeae0-a9cc-43f3-ab73-64e68a2228e7:image.png)

Splendid!

### **Assign Member Roles**

Additionally, we can assign roles to users that are being added to a company such as **customer** and **agent**. We can make this possible by modifying the `addMemberToCompany` function in `./src/controllers/companyController.ts`:

```tsx
// ./src/controllers/companyController.ts
// ...

export const addMemberToCompany = async (req, res) => {
  try {
    const { companyId, userId, role } = req.body;

    // ...
    
    // Save the new membership
    await membership.save();

    // assign "customer" or "agent" role to user in Permit.io
    await assignRole({
      role: role == "agent" ? "agent" : "customer",
      user: await User.findById(userId),
      tenantId: companyId,
    });

    // ...
  } catch (error) {
    // ...
  }
};
```

Here, the `addMemberToCompany` function has been updated to integrate **Permit.io** for role-based access control when adding members to a company.

- **Role Assignment**: Uses `assignRole` to grant the user a **customer** or **agent** role within the company’s tenant.
- **Seamless Integration**: Retrieves the user from the database and assigns their role in **Permit.io**, keeping access control consistent.

This ensures that every new member gets appropriate permissions upon joining a company.

Now, if we send a POST request to [`http://localhost:9316/api/companies/members`](http://localhost:9316/api/companies/members) to add a member using the `userId` and `companyId` of the user and company respectively, along with the **role:**

![Screenshot 2025-03-27 at 13.31.26.png](attachment:dc8ecf29-5457-4c42-881e-008b4369513e:Screenshot_2025-03-27_at_13.31.26.png)

We should see that the user roles have been updated in the dashboard:

![image.png](attachment:1d6dc7be-9218-4947-a1dd-ddb66bcbd4d5:image.png)