import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { checkConnection } from './config/database.js';
import { noteRepository, userRepository, purchaseRepository, categoryRepository, favoritesRepository, reviewRepository } from './repositories/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
const allowedOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow non-browser requests
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','x-admin-pass']
}));
app.use(express.json());
app.use(morgan('dev'));

// Static serving for uploaded files
const uploadsDir = path.join(__dirname, '..', 'uploads');
const previewDir = path.join(uploadsDir, 'previews');
const pdfDir = path.join(uploadsDir, 'pdfs');
[uploadsDir, previewDir, pdfDir].forEach((d) => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'preview') cb(null, previewDir);
    else if (file.fieldname === 'pdf') cb(null, pdfDir);
    else cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '_');
    cb(null, `${Date.now()}_${base}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'preview') {
    const allowed = ['image/png', 'image/jpeg', 'image/webp'];
    return cb(null, allowed.includes(file.mimetype));
  }
  if (file.fieldname === 'pdf') {
    return cb(null, file.mimetype === 'application/pdf');
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Admin middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Dev admin bypass helper (for college project simplicity)
const devAdminBypass = async (req, res, next) => {
  try {
    const pass = req.headers['x-admin-pass'];
    if (process.env.ADMIN_DEV_PASSWORD && pass === process.env.ADMIN_DEV_PASSWORD) {
      const admin = await userRepository.findByEmail('admin@pebblenotes.com');
      if (!admin) return res.status(403).json({ error: 'Admin account missing' });
      req.user = { id: admin.id, email: admin.email, role: admin.role, name: admin.name };
      return next();
    }
    // Fallback to normal JWT auth + admin check
    return authenticateToken(req, res, () => requireAdmin(req, res, next));
  } catch (e) {
    return res.status(500).json({ error: 'Admin verification failed' });
  }
};

// ============================================
// HEALTH & STATUS ROUTES
// ============================================

app.get('/api/health', async (req, res) => {
  const dbStatus = await checkConnection();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbStatus
  });
});

// ============================================
// EMAIL / VERIFICATION UTILITIES
// ============================================

const createTransporter = async () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
  }
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass }
  });
};

const sendVerificationEmail = async (user) => {
  const transporter = await createTransporter();
  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });
  const verifyUrl = `${process.env.BACKEND_URL || 'http://localhost:4000'}/api/auth/verify?token=${encodeURIComponent(token)}`;

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || 'PebbleNotes <no-reply@pebblenotes.local>',
    to: user.email,
    subject: 'Verify your PebbleNotes account',
    text: `Hi ${user.name || ''},\n\nPlease verify your account by clicking the link below:\n${verifyUrl}\n\nThis link expires in 24 hours.`,
    html: `<div style="font-family:system-ui, -apple-system, Segoe UI, Roboto;">
             <h2>Verify your PebbleNotes account</h2>
             <p>Hi ${user.name || ''}, please verify your account by clicking the button below.</p>
             <p><a href="${verifyUrl}" style="display:inline-block;padding:10px 16px;background:#1f2937;color:white;border-radius:8px;text-decoration:none">Verify Account</a></p>
             <p>If the button doesn't work, copy this link:<br/><code>${verifyUrl}</code></p>
           </div>`
  });

  if (nodemailer.getTestMessageUrl) {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) console.log('📧 Email preview URL:', previewUrl);
  }
};

// ============================================
// AUTH ROUTES
// ============================================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, university } = req.body;
    
    // Check if user exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Hash password
    const password_hash = await bcrypt.hash(password, 10);
    
    // Create user
    const user = await userRepository.create({
      name,
      email,
      password_hash,
      university,
      role: 'USER'
    });
    // Send verification email
    await sendVerificationEmail(user);
    res.status(201).json({
      message: 'Registration successful. Please check your email to verify your account.'
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await userRepository.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (!user.is_verified) {
      return res.status(403).json({ error: 'Please verify your email before logging in.' });
    }
    
    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Verify email
app.get('/api/auth/verify', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: 'Missing token' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const { id, email } = payload;
    const user = await userRepository.findById(id);
    if (!user || user.email !== email) return res.status(400).json({ error: 'Invalid verification link' });
    if (user.is_verified) return res.json({ message: 'Account already verified.' });
    const updated = await userRepository.update(id, { is_verified: true, email_verified_at: new Date() });
    return res.json({ message: 'Email verified successfully.', user: { id: updated.id, email: updated.email, is_verified: updated.is_verified } });
  } catch (error) {
    console.error('Verify error:', error);
    return res.status(400).json({ error: 'Verification failed' });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await userRepository.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// ============================================
// USER ROUTES
// ============================================

// Update profile
app.put('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone, bio, university, avatar } = req.body;
    const user = await userRepository.update(req.user.id, { name, phone, bio, university, avatar });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get all users (admin only)
app.get('/api/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { limit, offset, role } = req.query;
    const users = await userRepository.findAll({ limit: parseInt(limit), offset: parseInt(offset), role });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// ============================================
// NOTES ROUTES
// ============================================

// Get all notes
app.get('/api/notes', async (req, res) => {
  try {
    const { limit, offset, subject, category_id, search, is_featured } = req.query;
    const notes = await noteRepository.findAll({
      limit: parseInt(limit) || 20,
      offset: parseInt(offset) || 0,
      subject,
      category_id,
      search,
      is_featured: is_featured === 'true'
    });
    res.json(notes);
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Failed to get notes' });
  }
});

// Get note by ID
app.get('/api/notes/:id', async (req, res) => {
  try {
    const note = await noteRepository.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    // Increment view count
    await noteRepository.incrementViews(req.params.id);
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get note' });
  }
});

// Get subjects list
app.get('/api/subjects', async (req, res) => {
  try {
    const subjects = await noteRepository.getSubjects();
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get subjects' });
  }
});

// Create note (admin only) with optional file uploads
app.post('/api/notes', devAdminBypass, upload.fields([{ name: 'preview', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), async (req, res) => {
  try {
    const body = req.body || {};
    const files = req.files || {};

    let preview_image_url = body.preview_image_url;
    if (files.preview && files.preview[0]) {
      preview_image_url = `/uploads/previews/${files.preview[0].filename}`;
    }
    let pdf_url = body.pdf_url;
    if (files.pdf && files.pdf[0]) {
      pdf_url = `/uploads/pdfs/${files.pdf[0].filename}`;
    }

    const noteData = {
      title: body.title,
      description: body.description,
      subject: body.subject,
      category_id: body.category_id || null,
      price: body.price ? Number(body.price) : 0,
      original_price: body.original_price ? Number(body.original_price) : null,
      preview_image_url,
      pdf_url,
      university: body.university || null,
      course_code: body.course_code || null,
      semester: body.semester || null,
      year: body.year ? Number(body.year) : null,
      tags: body.tags ? body.tags.split(',').map(t => t.trim()) : null,
      admin_id: req.user.id,
      slug: body.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    };
    const note = await noteRepository.create(noteData);
    res.status(201).json(note);
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// Update note (admin only)
app.put('/api/notes/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const note = await noteRepository.update(req.params.id, req.body);
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// Delete note (admin only)
app.delete('/api/notes/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await noteRepository.delete(req.params.id);
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// ============================================
// CATEGORIES ROUTES
// ============================================

app.get('/api/categories', async (req, res) => {
  try {
    const categories = await categoryRepository.findAll();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get categories' });
  }
});

// ============================================
// PURCHASES ROUTES
// ============================================

// Get user's purchases
app.get('/api/purchases', authenticateToken, async (req, res) => {
  try {
    const purchases = await purchaseRepository.findByUserId(req.user.id);
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get purchases' });
  }
});

// Create purchase
app.post('/api/purchases', authenticateToken, async (req, res) => {
  try {
    const { note_id, amount, payment_method, transaction_id, payment_reference, payment_response } = req.body;
    
    // Check if already purchased
    const hasPurchased = await purchaseRepository.hasPurchased(req.user.id, note_id);
    if (hasPurchased) {
      return res.status(400).json({ error: 'Already purchased this note' });
    }
    
    const purchase = await purchaseRepository.create({
      user_id: req.user.id,
      note_id,
      amount,
      payment_method,
      transaction_id,
      payment_reference,
      payment_response
    });
    
    res.status(201).json(purchase);
  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({ error: 'Purchase failed' });
  }
});

// Check if user has purchased a note
app.get('/api/purchases/check/:noteId', authenticateToken, async (req, res) => {
  try {
    const hasPurchased = await purchaseRepository.hasPurchased(req.user.id, req.params.noteId);
    res.json({ purchased: hasPurchased });
  } catch (error) {
    res.status(500).json({ error: 'Check failed' });
  }
});

// Get all purchases (admin)
app.get('/api/admin/purchases', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { limit, offset, status } = req.query;
    const purchases = await purchaseRepository.findAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      status
    });
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get purchases' });
  }
});

// ============================================
// REVIEWS ROUTES
// ============================================

// Get reviews for a note
app.get('/api/notes/:id/reviews', async (req, res) => {
  try {
    const reviews = await reviewRepository.findByNoteId(req.params.id);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get reviews' });
  }
});

// Create review
app.post('/api/notes/:id/reviews', authenticateToken, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    // Check if user purchased
    const hasPurchased = await purchaseRepository.hasPurchased(req.user.id, req.params.id);
    
    const review = await reviewRepository.create({
      user_id: req.user.id,
      note_id: req.params.id,
      rating,
      comment,
      is_verified_purchase: hasPurchased
    });
    
    res.status(201).json(review);
  } catch (error) {
    console.error('Review error:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// ============================================
// FAVORITES ROUTES
// ============================================

// Get user's favorites
app.get('/api/favorites', authenticateToken, async (req, res) => {
  try {
    const favorites = await favoritesRepository.findByUserId(req.user.id);
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get favorites' });
  }
});

// Add to favorites
app.post('/api/favorites/:noteId', authenticateToken, async (req, res) => {
  try {
    await favoritesRepository.add(req.user.id, req.params.noteId);
    res.json({ message: 'Added to favorites' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add to favorites' });
  }
});

// Remove from favorites
app.delete('/api/favorites/:noteId', authenticateToken, async (req, res) => {
  try {
    await favoritesRepository.remove(req.user.id, req.params.noteId);
    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove from favorites' });
  }
});

// Check if favorited
app.get('/api/favorites/check/:noteId', authenticateToken, async (req, res) => {
  try {
    const isFavorited = await favoritesRepository.isFavorited(req.user.id, req.params.noteId);
    res.json({ favorited: isFavorited });
  } catch (error) {
    res.status(500).json({ error: 'Check failed' });
  }
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, async () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  
  // Test database connection
  const dbStatus = await checkConnection();
  if (dbStatus.connected) {
    console.log('✅ Database connected:', dbStatus.timestamp);
  } else {
    console.error('❌ Database connection failed:', dbStatus.error);
  }
});
