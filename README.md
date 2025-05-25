# Blog API Backend

A complete JavaScript blog application backend built with Node.js, Express, MongoDB, and Mongoose.

## Features

- **RESTful API** for blog management
- **User management** system
- **JavaScript (ES6+)** with Node.js
- **MongoDB** with Mongoose ODM
- **Input validation** with express-validator
- **Pagination** and filtering support
- **Error handling** middleware
- **Database seeding** functionality
- **CORS** and security middleware
- **Swagger/OpenAPI documentation** for interactive API testing

## API Documentation

The API comes with interactive Swagger documentation that allows you to explore and test all endpoints directly in your browser.

**Access the documentation at:** `http://localhost:3000/api-docs`

The Swagger UI provides:

- Complete API endpoint documentation
- Request/response schemas
- Interactive testing interface
- Parameter descriptions and examples
- Response format specifications

## API Endpoints

### Blogs

- `GET /api/blogs` - Get all blogs (supports pagination and tag filtering)
- `GET /api/blogs/:slug` - Get blog by slug
- `POST /api/blogs` - Create new blog
- `PUT /api/blogs/:id` - Update blog by ID
- `DELETE /api/blogs/:id` - Delete blog by ID

### Users

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user by ID
- `DELETE /api/users/:id` - Delete user by ID

## Query Parameters

### GET /api/blogs

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `tags` - Comma-separated tags for filtering

Example: `GET /api/blogs?page=1&limit=10&tags=technology,javascript`

## Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Optional message"
}
```

### Paginated Response

```json
{
  "data": [...],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_items": 50,
    "items_per_page": 10,
    "has_next": true,
    "has_prev": false
  }
}
```

### Error Response

```json
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Yarn or npm

### Installation

1. **Clone and install dependencies**

```bash
cd /Users/muhammadirfan/Desktop/web/api/blogs
yarn install
```

2. **Database Setup**

**Option A: MongoDB Atlas (Recommended)**

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `.env` file with your connection string:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/SampleBlogs?retryWrites=true&w=majority
```

**Option B: Local MongoDB**

1. Install MongoDB:

```bash
# On macOS with Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb/brew/mongodb-community
```

2. Update `.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/SampleBlogs
```

3. **Environment Configuration**
   Copy `.env.example` to `.env` and update the MongoDB URI:

```bash
cp .env.example .env
# Edit .env file with your MongoDB connection string
```

4. **Test Database Connection**

```bash
yarn setup-db
```

This script will test your MongoDB connection and verify everything is working.

5. **Start the application**

**Development mode:**

```bash
yarn dev
```

**Production mode:**

```bash
yarn start
```

The API will be available at `http://localhost:3000`

**Access the API documentation at:** `http://localhost:3000/api-docs`

## Quick Start

1. **Set up MongoDB Atlas (recommended)**:

   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a free cluster
   - Get your connection string
   - Copy `.env.example` to `.env` and update `MONGODB_URI`

2. **Test everything**:

```bash
yarn setup-db    # Test database connection
yarn dev         # Start development server
```

3. **In another terminal, test the API**:

```bash
yarn test-api    # Run automated API tests
```

4. **Access the API documentation**:
   Open `http://localhost:3000/api-docs` in your browser for interactive API documentation

## Development

### Available Scripts

- `yarn start` - Start production server
- `yarn dev` - Start development server with auto-reload
- `yarn setup-db` - Test MongoDB connection and setup
- `yarn seed` - Seed database with sample data
- `yarn test-api` - Run API endpoint tests (server must be running)
- `yarn lint` - Run ESLint
- `yarn lint:fix` - Fix ESLint errors automatically

### Project Structure

```
src/
├── app.js                # Express app configuration
├── index.js              # Application entry point
├── config/
│   ├── database.js       # Database connection
│   └── swagger.js        # Swagger/OpenAPI configuration
├── controllers/
│   ├── index.js          # Controllers export
│   ├── blogController.js # Blog CRUD operations
│   └── userController.js # User CRUD operations
├── middleware/
│   ├── index.js          # Middleware exports
│   ├── errorHandler.js   # Error handling middleware
│   └── validation.js     # Input validation middleware
├── models/
│   ├── index.js          # Models export
│   ├── Blog.js           # Blog mongoose model
│   └── User.js           # User mongoose model
├── routes/
│   ├── index.js          # Routes export
│   ├── blogRoutes.js     # Blog API routes
│   └── userRoutes.js     # User API routes
└── utils/
    ├── index.js          # Utilities export
    ├── responseHelpers.js # API response utilities
    └── seedDatabase.js   # Database seeding utility
```

## Testing the API

### Using curl

**Create a user:**

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "bio": "Software developer"
  }'
```

**Create a blog post:**

```bash
curl -X POST http://localhost:3000/api/blogs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Blog Post",
    "sub_title": "A simple introduction",
    "content": "This is the content of my blog post...",
    "tags": ["technology", "javascript"],
    "author": "USER_ID_HERE"
  }'
```

**Get all blogs:**

```bash
curl http://localhost:3000/api/blogs
```

**Get blogs with pagination and filtering:**

```bash
curl "http://localhost:3000/api/blogs?page=1&limit=5&tags=technology"
```

## Technologies Used

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **JavaScript (ES6+)** - Modern JavaScript with Node.js
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **express-validator** - Input validation
- **swagger-jsdoc** - OpenAPI/Swagger documentation generation
- **swagger-ui-express** - Interactive API documentation interface
- **cors** - Cross-origin resource sharing
- **helmet** - Security middleware
- **morgan** - HTTP request logger
- **slugify** - URL slug generation

## License

MIT License
