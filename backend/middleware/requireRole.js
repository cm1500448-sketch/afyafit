/**
 * ROLE-BASED ACCESS CONTROL MIDDLEWARE
 * 
 * This middleware provides role-based authorization for API routes.
 * It ensures that only users with specific roles can access certain endpoints.
 * 
 * Use Cases:
 * - Admin-only routes (user management, system settings)
 * - Coach-only routes (client management, program creation)
 * - Parent-only routes (child monitoring, reports)
 * 
 * Note: This middleware should be used AFTER authMiddleware
 * because it requires req.user to be populated.
 */

/**
 * Require Specific Role Middleware
 * 
 * Creates a middleware function that checks if the user has a specific role.
 * 
 * @param {string} role - The required role (e.g., 'admin', 'coach', 'parent')
 * @returns {Function} Express middleware function
 * 
 * Usage:
 * router.get('/admin-only', authMiddleware, requireRole('admin'), (req, res) => {
 *   // Only admins can access this route
 * });
 */
const requireRole = (role) => (req, res, next) => {
  // Check if user exists and has the required role
  if (req.user && req.user.role === role) {
    // User has the required role, allow access
    return next();
  }
  
  // User doesn't have the required role, deny access
  res.status(403).json({ 
    error: `Access denied. ${role} role required.` 
  });
};

/**
 * Require Any of Multiple Roles Middleware
 * 
 * Creates a middleware function that checks if the user has any of the specified roles.
 * More flexible than requireRole - allows multiple roles to access the same route.
 * 
 * @param {Array<string>} roles - Array of allowed roles (e.g., ['admin', 'coach'])
 * @returns {Function} Express middleware function
 * 
 * Usage:
 * router.get('/staff-only', authMiddleware, requireAnyRole(['admin', 'coach']), (req, res) => {
 *   // Both admins and coaches can access this route
 * });
 */
const requireAnyRole = (roles) => (req, res, next) => {
  // Check if user exists and has any of the allowed roles
  if (req.user && roles.includes(req.user.role)) {
    // User has one of the allowed roles, allow access
    return next();
  }
  
  // User doesn't have any of the allowed roles, deny access
  res.status(403).json({ 
    error: 'Access denied.' 
  });
};

/**
 * Export both middleware functions
 * 
 * HTTP Status Codes Used:
 * - 403 Forbidden: User is authenticated but doesn't have permission
 * - 401 Unauthorized: User is not authenticated (handled by authMiddleware)
 */
module.exports = { requireRole, requireAnyRole };
