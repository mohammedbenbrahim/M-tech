const { config } = require("../config");
const { mainLogger } = require("../utils/logger");
const logger = mainLogger;

/**
 * Function to check if a user has a specific role
 * @param {Array<number | { id: number }>} userRoles - Array of role IDs or objects with IDs
 * @param {Array<number>} targetRoles - Array of role IDs to check against
 * @returns {boolean} - Returns true if the user has at least one of the target roles
 */
function hasRole(userRoles, targetRoles) {
  if (!Array.isArray(userRoles) || !Array.isArray(targetRoles)) {
    throw new Error("Both userRoles and targetRoles must be arrays");
  }

  // Extract role IDs if objects are passed
  const roleIds = userRoles.map((role) =>
    typeof role === "object" ? role.id : role
  );

  // Check if user has at least one of the target roles
  return roleIds.some((roleId) => targetRoles.includes(roleId));
}

/**
 * Role hierarchy: Defines which roles inherit other roles' permissions.
 */
const roleHierarchy = {
  sysAdmin: [config.roles.sysAdmin, config.roles.admin], // sysAdmin inherits admin
  admin: [config.roles.admin], // Admin has only admin rights
  chefEquipe: [config.roles.chefEquipe], // ChefEquipe has only chefEquipe rights
  technicien: [config.roles.technicien], // Technicien has only technicien rights
};

/**
 * Generic function to check if a user has a specific role, considering role hierarchy
 * @param {Array<number | { id: number }>} roles - User roles
 * @param {string} roleName - The role name (as defined in config.roles)
 * @returns {boolean}
 */
function checkUserRole(roles, roleName) {
  const roleIds = roleHierarchy[roleName] || []; // Get inherited roles
  if (roleIds.length === 0) {
    logger.error(`Invalid role name: ${roleName}`);
    return false;
  }

  const hasAccess = hasRole(roles, roleIds);
  hasAccess
    ? logger.info(`The user has ${roleName} role.`)
    : logger.error(`The user does not have ${roleName} role.`);

  return hasAccess;
}

// Predefined Role Checkers
const isSysAdmin = (roles) => checkUserRole(roles, "sysAdmin");
const isAdmin = (roles) => checkUserRole(roles, "admin");
const isChefEquipe = (roles) => checkUserRole(roles, "chefEquipe");
const isTechnicien = (roles) => checkUserRole(roles, "technicien");

// Export functions
module.exports = {
  isSysAdmin,
  isAdmin,
  isChefEquipe,
  isTechnicien,
  hasRole,
};
