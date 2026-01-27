import { query } from '../config/database.js';

/**
 * PRODUCTION-READY Rate Limiting Service
 * 
 * ✅ Per-user rate limiting (prevents brute force)
 * ✅ Configurable time windows (default: 1 hour for email resend)
 * ✅ Clear error messages
 * ✅ Database-backed (works across multiple servers)
 */

class RateLimitService {
  /**
   * Check if user has exceeded rate limit for an action
   * @param {string} userId - User ID
   * @param {string} action - Action identifier (e.g., 'resend-verification')
   * @param {number} maxAttempts - Maximum attempts allowed (default: 3)
   * @param {number} windowMinutes - Time window in minutes (default: 60)
   * @returns {Object} { allowed: boolean, remaining: number, resetAt: Date, message: string }
   */
  async checkLimit(userId, action, maxAttempts = 3, windowMinutes = 60) {
    try {
      const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);

      // Get recent attempts
      const result = await query(
        `SELECT COUNT(*) as count, MAX(created_at) as last_attempt
         FROM verification_attempts
         WHERE user_id = $1 
         AND action = $2 
         AND created_at > $3`,
        [userId, action, windowStart]
      );

      const { count, last_attempt } = result.rows[0];
      const remaining = Math.max(0, maxAttempts - count);
      const resetAt = new Date((new Date(last_attempt).getTime() + windowMinutes * 60 * 1000));

      if (count >= maxAttempts) {
        const secondsUntilReset = Math.ceil((resetAt.getTime() - Date.now()) / 1000);
        const minutesUntilReset = Math.ceil(secondsUntilReset / 60);

        return {
          allowed: false,
          remaining: 0,
          resetAt,
          message: `Too many resend attempts. Please try again in ${minutesUntilReset} minute${minutesUntilReset !== 1 ? 's' : ''}.`,
          secondsUntilReset,
          minutesUntilReset
        };
      }

      return {
        allowed: true,
        remaining,
        resetAt: count > 0 ? resetAt : null,
        message: remaining === 1 ? 'This is your last resend attempt' : ''
      };
    } catch (error) {
      console.error('❌ Rate limit check failed:', error.message);
      // Allow request if check fails (fail open)
      return {
        allowed: true,
        remaining: 999,
        error: error.message
      };
    }
  }

  /**
   * Record an attempt for rate limiting
   * @param {string} userId - User ID
   * @param {string} action - Action identifier
   * @returns {boolean} Success
   */
  async recordAttempt(userId, action) {
    try {
      // Create table if not exists
      await query(
        `CREATE TABLE IF NOT EXISTS verification_attempts (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          action VARCHAR(100) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_verification_attempts_user_action 
        ON verification_attempts(user_id, action, created_at);`,
        []
      );

      await query(
        `INSERT INTO verification_attempts (user_id, action)
         VALUES ($1, $2)`,
        [userId, action]
      );

      return true;
    } catch (error) {
      console.error('❌ Failed to record attempt:', error.message);
      return false;
    }
  }

  /**
   * Reset rate limit for user (use after successful action)
   * @param {string} userId - User ID
   * @param {string} action - Action identifier
   * @returns {boolean} Success
   */
  async resetLimit(userId, action) {
    try {
      await query(
        `DELETE FROM verification_attempts
         WHERE user_id = $1 AND action = $2`,
        [userId, action]
      );

      console.log(`✅ Rate limit reset for user ${userId.substring(0, 8)}... action: ${action}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to reset rate limit:', error.message);
      return false;
    }
  }

  /**
   * Clean up old rate limit records (should run periodically)
   * @param {number} hoursToKeep - How many hours of history to keep (default: 24)
   * @returns {number} Number of records deleted
   */
  async cleanupOldAttempts(hoursToKeep = 24) {
    try {
      const cutoffDate = new Date(Date.now() - hoursToKeep * 60 * 60 * 1000);

      const result = await query(
        `DELETE FROM verification_attempts
         WHERE created_at < $1`,
        [cutoffDate]
      );

      console.log(`✅ Cleaned up ${result.rowCount} old rate limit records`);
      return result.rowCount;
    } catch (error) {
      console.error('❌ Failed to cleanup old attempts:', error.message);
      return 0;
    }
  }
}

// Create singleton instance
export const rateLimitService = new RateLimitService();

export default rateLimitService;
