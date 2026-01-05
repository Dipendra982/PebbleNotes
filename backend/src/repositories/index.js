import { query, transaction } from '../config/database.js';

// ============================================
// USER REPOSITORY - CRUD Operations
// ============================================

export const userRepository = {
  // Create a new user
  async create(userData) {
    const { name, email, password_hash, role = 'USER', avatar, phone, university } = userData;
    const result = await query(
      `INSERT INTO users (name, email, password_hash, role, avatar, phone, university)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, email, role, avatar, phone, university, created_at`,
      [name, email, password_hash, role, avatar, phone, university]
    );
    return result.rows[0];
  },

  // Find user by ID
  async findById(id) {
    const result = await query(
      `SELECT id, name, email, role, avatar, phone, bio, university, is_verified, created_at
       FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  },

  // Find user by email
  async findByEmail(email) {
    const result = await query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );
    return result.rows[0];
  },

  // Update user
  async update(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      }
    });

    values.push(id);
    const result = await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount}
       RETURNING id, name, email, role, avatar, phone, bio, university`,
      values
    );
    return result.rows[0];
  },

  // Delete user
  async delete(id) {
    await query('DELETE FROM users WHERE id = $1', [id]);
    return true;
  },

  // Get all users (admin only)
  async findAll({ limit = 50, offset = 0, role } = {}) {
    let queryText = `SELECT id, name, email, role, avatar, is_verified, created_at FROM users`;
    const values = [];
    
    if (role) {
      queryText += ` WHERE role = $1`;
      values.push(role);
    }
    
    queryText += ` ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, offset);
    
    const result = await query(queryText, values);
    return result.rows;
  }
};

// ============================================
// NOTE REPOSITORY - CRUD Operations
// ============================================

export const noteRepository = {
  // Create a new note
  async create(noteData) {
    const {
      title, slug, description, content, subject, category_id, price,
      preview_image_url, pdf_url, admin_id, university, course_code,
      semester, year, tags, ai_summary
    } = noteData;

    const result = await query(
      `INSERT INTO notes (
        title, slug, description, content, subject, category_id, price,
        preview_image_url, pdf_url, admin_id, university, course_code,
        semester, year, tags, ai_summary
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *`,
      [title, slug, description, content, subject, category_id, price,
       preview_image_url, pdf_url, admin_id, university, course_code,
       semester, year, tags, ai_summary]
    );
    return result.rows[0];
  },

  // Find note by ID
  async findById(id) {
    const result = await query(
      `SELECT n.*, u.name as admin_name, u.avatar as admin_avatar, c.name as category_name
       FROM notes n
       LEFT JOIN users u ON n.admin_id = u.id
       LEFT JOIN categories c ON n.category_id = c.id
       WHERE n.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  // Find note by slug
  async findBySlug(slug) {
    const result = await query(
      `SELECT n.*, u.name as admin_name, c.name as category_name
       FROM notes n
       LEFT JOIN users u ON n.admin_id = u.id
       LEFT JOIN categories c ON n.category_id = c.id
       WHERE n.slug = $1 AND n.is_published = TRUE`,
      [slug]
    );
    return result.rows[0];
  },

  // Get all notes with filters
  async findAll({ limit = 20, offset = 0, subject, category_id, search, adminId, is_featured } = {}) {
    let queryText = `
      SELECT n.*, u.name as admin_name, c.name as category_name
      FROM notes n
      LEFT JOIN users u ON n.admin_id = u.id
      LEFT JOIN categories c ON n.category_id = c.id
      WHERE n.is_published = TRUE
    `;
    const values = [];
    let paramCount = 1;

    if (subject) {
      queryText += ` AND n.subject = $${paramCount}`;
      values.push(subject);
      paramCount++;
    }

    if (category_id) {
      queryText += ` AND n.category_id = $${paramCount}`;
      values.push(category_id);
      paramCount++;
    }

    if (search) {
      queryText += ` AND (n.title ILIKE $${paramCount} OR n.description ILIKE $${paramCount})`;
      values.push(`%${search}%`);
      paramCount++;
    }

    if (adminId) {
      queryText += ` AND n.admin_id = $${paramCount}`;
      values.push(adminId);
      paramCount++;
    }

    if (is_featured !== undefined) {
      queryText += ` AND n.is_featured = $${paramCount}`;
      values.push(is_featured);
      paramCount++;
    }

    queryText += ` ORDER BY n.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    const result = await query(queryText, values);
    return result.rows;
  },

  // Update note
  async update(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      }
    });

    values.push(id);
    const result = await query(
      `UPDATE notes SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0];
  },

  // Delete note
  async delete(id) {
    await query('DELETE FROM notes WHERE id = $1', [id]);
    return true;
  },

  // Increment view count
  async incrementViews(id) {
    await query('UPDATE notes SET view_count = view_count + 1 WHERE id = $1', [id]);
  },

  // Get subjects list
  async getSubjects() {
    const result = await query(
      `SELECT DISTINCT subject FROM notes WHERE is_published = TRUE ORDER BY subject`
    );
    return result.rows.map(r => r.subject);
  }
};

// ============================================
// PURCHASE REPOSITORY - CRUD Operations
// ============================================

export const purchaseRepository = {
  // Create purchase
  async create(purchaseData) {
    const { user_id, note_id, amount, payment_method, transaction_id, payment_reference, payment_response } = purchaseData;
    
    const result = await query(
      `INSERT INTO purchases (user_id, note_id, amount, status, payment_method, transaction_id, payment_reference, payment_response)
       VALUES ($1, $2, $3, 'COMPLETED', $4, $5, $6, $7)
       RETURNING *`,
      [user_id, note_id, amount, payment_method, transaction_id, payment_reference, JSON.stringify(payment_response)]
    );
    return result.rows[0];
  },

  // Check if user purchased a note
  async hasPurchased(userId, noteId) {
    const result = await query(
      `SELECT id FROM purchases WHERE user_id = $1 AND note_id = $2 AND status = 'COMPLETED'`,
      [userId, noteId]
    );
    return result.rows.length > 0;
  },

  // Get user's purchases
  async findByUserId(userId, { limit = 50, offset = 0 } = {}) {
    const result = await query(
      `SELECT p.*, n.title, n.preview_image_url, n.pdf_url
       FROM purchases p
       JOIN notes n ON p.note_id = n.id
       WHERE p.user_id = $1 AND p.status = 'COMPLETED'
       ORDER BY p.purchased_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  },

  // Get purchases for a note
  async findByNoteId(noteId) {
    const result = await query(
      `SELECT p.*, u.name as user_name, u.email as user_email
       FROM purchases p
       JOIN users u ON p.user_id = u.id
       WHERE p.note_id = $1
       ORDER BY p.purchased_at DESC`,
      [noteId]
    );
    return result.rows;
  },

  // Get all purchases (admin)
  async findAll({ limit = 50, offset = 0, status } = {}) {
    let queryText = `
      SELECT p.*, n.title as note_title, u.name as user_name, u.email as user_email
      FROM purchases p
      JOIN notes n ON p.note_id = n.id
      JOIN users u ON p.user_id = u.id
    `;
    const values = [];

    if (status) {
      queryText += ` WHERE p.status = $1`;
      values.push(status);
    }

    queryText += ` ORDER BY p.purchased_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, offset);

    const result = await query(queryText, values);
    return result.rows;
  },

  // Update purchase status
  async updateStatus(id, status, refundReason = null) {
    const result = await query(
      `UPDATE purchases SET status = $1, refund_reason = $2, refunded_at = CASE WHEN $1 = 'REFUNDED' THEN NOW() ELSE NULL END
       WHERE id = $3 RETURNING *`,
      [status, refundReason, id]
    );
    return result.rows[0];
  }
};

// ============================================
// REVIEW REPOSITORY - CRUD Operations
// ============================================

export const reviewRepository = {
  // Create review
  async create(reviewData) {
    const { user_id, note_id, rating, comment, is_verified_purchase } = reviewData;
    const result = await query(
      `INSERT INTO reviews (user_id, note_id, rating, comment, is_verified_purchase)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [user_id, note_id, rating, comment, is_verified_purchase]
    );
    return result.rows[0];
  },

  // Get reviews for a note
  async findByNoteId(noteId, { limit = 50, offset = 0 } = {}) {
    const result = await query(
      `SELECT r.*, u.name as user_name, u.avatar as user_avatar
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.note_id = $1 AND r.is_approved = TRUE
       ORDER BY r.created_at DESC
       LIMIT $2 OFFSET $3`,
      [noteId, limit, offset]
    );
    return result.rows;
  },

  // Update review
  async update(id, { rating, comment }) {
    const result = await query(
      `UPDATE reviews SET rating = $1, comment = $2 WHERE id = $3 RETURNING *`,
      [rating, comment, id]
    );
    return result.rows[0];
  },

  // Delete review
  async delete(id) {
    await query('DELETE FROM reviews WHERE id = $1', [id]);
    return true;
  }
};

// ============================================
// CATEGORY REPOSITORY - CRUD Operations
// ============================================

export const categoryRepository = {
  // Get all categories
  async findAll() {
    const result = await query(
      `SELECT * FROM categories WHERE is_active = TRUE ORDER BY sort_order, name`
    );
    return result.rows;
  },

  // Find by slug
  async findBySlug(slug) {
    const result = await query(
      `SELECT * FROM categories WHERE slug = $1`,
      [slug]
    );
    return result.rows[0];
  },

  // Create category
  async create(categoryData) {
    const { name, slug, description, icon, color } = categoryData;
    const result = await query(
      `INSERT INTO categories (name, slug, description, icon, color)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, slug, description, icon, color]
    );
    return result.rows[0];
  }
};

// ============================================
// FAVORITES REPOSITORY
// ============================================

export const favoritesRepository = {
  // Add to favorites
  async add(userId, noteId) {
    const result = await query(
      `INSERT INTO favorites (user_id, note_id) VALUES ($1, $2)
       ON CONFLICT (user_id, note_id) DO NOTHING
       RETURNING *`,
      [userId, noteId]
    );
    return result.rows[0];
  },

  // Remove from favorites
  async remove(userId, noteId) {
    await query(
      `DELETE FROM favorites WHERE user_id = $1 AND note_id = $2`,
      [userId, noteId]
    );
    return true;
  },

  // Get user's favorites
  async findByUserId(userId) {
    const result = await query(
      `SELECT n.*, f.created_at as favorited_at
       FROM favorites f
       JOIN notes n ON f.note_id = n.id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [userId]
    );
    return result.rows;
  },

  // Check if note is favorited
  async isFavorited(userId, noteId) {
    const result = await query(
      `SELECT id FROM favorites WHERE user_id = $1 AND note_id = $2`,
      [userId, noteId]
    );
    return result.rows.length > 0;
  }
};
