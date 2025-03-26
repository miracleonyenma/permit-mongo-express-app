# Permit MongoDB Express Boilerplate

## Overview

This is a boilerplate Express application with TypeScript and Mongoose, designed as a starter for demonstrating multi-tenant Role-Based Access Control (RBAC) in MongoDB applications.

## Project Structure

```text
project-root/
│
├── src/
│   ├── models/      # Mongoose data models
│   ├── routes/      # Express route definitions
│   ├── controllers/ # Request handling logic
│   ├── middleware/  # Express middleware
│   └── index.ts     # Main application entry point
│
├── package.json     # Project dependencies and scripts
├── tsconfig.json    # TypeScript configuration
└── .env            # Environment variables
```

## Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- MongoDB (local or MongoDB Atlas)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/miracleonyenma/permit-mongo-express-app.git
   cd permit-mongo-express-app
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the project root:

   ```bash
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/yourdbname
   JWT_SECRET=your_secret_key_here
   ```

## Authentication System

The application includes a robust authentication system using JSON Web Tokens (JWT):

### Key Features

- User Registration
- User Login
- JWT-based Authentication
- Protected Routes

### Authentication Endpoints

#### Register a New User

- **Endpoint:** `POST /api/auth/register`
- **Payload:**

  ```json
  {
    "username": "johndoe",
    "email": "john@example.com",
    "password": "securepassword"
  }
  ```

- **Response:** Returns user details and JWT token

#### Login

- **Endpoint:** `POST /api/auth/login`
- **Payload:**

  ```json
  {
    "email": "john@example.com",
    "password": "securepassword"
  }
  ```

- **Response:** Returns user details and JWT token

### Using Authentication

- After login, include the token in the `Authorization` header:

  ```http
  Authorization: Bearer <your_jwt_token>
  ```

## Running the Application

### Development Mode

```bash
npm run dev
```

This will start the server with nodemon, enabling hot-reloading during development.

### Production Build

```bash
npm run build    # Compile TypeScript
npm start        # Run the compiled JavaScript
```

## Available Scripts

- `npm run dev`: Start development server with hot-reloading
- `npm run build`: Compile TypeScript to JavaScript
- `npm start`: Run the production build
- `npm run lint`: Run ESLint for code quality checks

## Configuration

### TypeScript

The `tsconfig.json` is configured to:

- Target ES2020
- Use CommonJS modules
- Output compiled files to `./dist`
- Enable strict type checking

### Nodemon

Configured to watch TypeScript files in the `src` directory and restart the server on changes.

## Project Dependencies

### Main Dependencies

- Express: Web application framework
- Mongoose: MongoDB object modeling tool
- JsonWebToken: Authentication token generation
- Bcrypt: Password hashing
- Dotenv: Environment variable management

### Development Dependencies

- TypeScript
- Nodemon
- ESLint with TypeScript support

## Planned Features

This boilerplate is part of a tutorial on implementing multi-tenant RBAC. Upcoming features include:

- Role-based access control
- Multi-tenant user management
- Permission filtering
- Integration with Permit.io

## Security Considerations

- Passwords are hashed using bcrypt
- JWT tokens are used for stateless authentication
- Routes are protected with middleware
- Sensitive information is managed through environment variables

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the ISC License. See `LICENSE` for more information.

## Contact

Miracle Onyenma - [@miracleio](https://twitter.com/miracleio)

Project Link: [https://github.com/miracleonyenma/permit-mongo-express-app](https://github.com/miracleonyenma/permit-mongo-express-app)
