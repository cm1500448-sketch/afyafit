/**
 * AUTHENTICATION MIDDLEWARE
 * This middleware protects API routes by verifying JWT tokens.
 * It ensures that only authenticated users can access protected endpoints.
 * How it works:
 * 1. Extracts JWT token from the Authorization header
 * 2. Verifies the token is valid and not expired
 * 3. Attaches user data to the request object
 * 4. Allows the request to proceed to the route handler
 * Usage in routes:
 * router.get('/protected-route', authMiddleware, (req, res) => {
 *   // req.user contains the authenticated user's data
 * });
 */

// Import JWT library for token verification
const jwt = require("jsonwebtoken");

/**
 * Authentication Middleware Function
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const authMiddleware = (req, res, next) => {
  // ========== STEP 1: EXTRACT TOKEN ==========
  // Get the Authorization header from the request
  // Format: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  const authHeader = req.header("Authorization");
  
  // Extract the token part (after "Bearer ")
  // split(" ")[1] gets the second part after splitting by space
  const token = authHeader && authHeader.split(" ")[1];

  // If no token is provided, deny access
  if (!token) {
    return res.status(401).json({ 
      message: "No token, authorization denied" 
    });
  }

  try {
    // ========== STEP 2: VERIFY TOKEN ==========
    // Verify the token using the secret key from environment variables
    // This checks:
    // - Token signature is valid
    // - Token hasn't expired
    // - Token was issued by our server
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // ========== STEP 3: ATTACH USER DATA ==========
    // The decoded token contains user information (id, email, role, etc.)
    // Attach it to the request object so route handlers can access it
    // Now any route using this middleware can access req.user.id, req.user.role, etc.
    req.user = decoded; 
    
    // ========== STEP 4: PROCEED TO NEXT MIDDLEWARE/ROUTE ==========
    // Token is valid, allow the request to continue
    next();
  } catch (err) {
    // Token verification failed (invalid, expired, or tampered)
    res.status(401).json({ 
      message: "Token is not valid" 
    });
  }
};

// Export the middleware for use in route files
module.exports = authMiddleware;