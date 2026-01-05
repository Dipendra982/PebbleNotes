// User Roles
export const USER_ROLE = {
  ADMIN: 'ADMIN',
  USER: 'USER'
};

// Type definitions as JSDoc (for reference)
/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} role - 'ADMIN' | 'USER'
 * @property {string} [avatar]
 */

/**
 * @typedef {Object} Note
 * @property {string} id
 * @property {string} title
 * @property {string} subject
 * @property {string} description
 * @property {number} price
 * @property {string} previewImageUrl
 * @property {string} pdfUrl
 * @property {string} adminId
 * @property {string} createdAt
 */

/**
 * @typedef {Object} Purchase
 * @property {string} id
 * @property {string} userId
 * @property {string} noteId
 * @property {number} amount
 * @property {string} date
 * @property {string} status - 'COMPLETED' | 'FAILED'
 */

/**
 * @typedef {Object} AuthState
 * @property {User | null} user
 * @property {boolean} isAuthenticated
 */
