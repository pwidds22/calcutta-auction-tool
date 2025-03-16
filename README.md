# Calcutta Auction Tool

A web application for managing Calcutta auctions with user authentication and data persistence.

## Features

- User registration and login
- Secure password storage
- JWT authentication
- Data persistence across sessions
- Team management
- Payout rule customization
- Auction tracking
- Profit projections

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)

## Installation

1. Clone the repository:
```
git clone <repository-url>
cd calcutta-auction-tool
```

2. Install dependencies:
```
npm install
```

3. Configure environment variables:
   - Create a `.env` file in the root directory
   - Add the following variables:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/calcutta-auction
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRE=30d
```

4. Start the server:
```
npm start
```

5. Access the application:
   - Open your browser and navigate to `http://localhost:5000`
   - Register a new account
   - Start using the Calcutta Auction Tool

## Development

For development with automatic server restart:
```
npm run dev
```

## Deployment

For production deployment:

1. Set appropriate environment variables
2. Use a process manager like PM2:
```
npm install -g pm2
pm2 start server.js
```

## Database

The application uses MongoDB to store:
- User accounts
- Team data
- Payout rules
- Auction results

## Security

- Passwords are hashed using bcrypt
- Authentication uses JSON Web Tokens (JWT)
- Protected API routes

## Scaling

The application is designed to handle approximately 100 users. For larger deployments:
- Consider using a MongoDB Atlas cluster
- Implement caching mechanisms
- Set up load balancing

## License

[MIT License](LICENSE) 