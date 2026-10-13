import 'dotenv/config';
import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import {
  initDB,
  verifyAdminCredentials,
  getProjectsDB,
  saveProjectDB,
  deleteProjectDB,
  voteProjectDB,
  saveMessageDB,
  getVisitorsDB,
  incrementVisitorsDB,
  recordUniqueVisitor
} from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// ----------------- Security Middlewares -----------------

// Set security HTTP headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// JSON body parser with 50MB limit to support high-res project image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Simple in-memory rate limiter to protect against brute-force & spam
const rateLimitMap = new Map();

function rateLimiter(keyPrefix, maxRequests, windowMs) {
  return (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const key = `${keyPrefix}:${ip}`;
    const now = Date.now();
    const record = rateLimitMap.get(key) || { count: 0, resetTime: now + windowMs };

    if (now > record.resetTime) {
      record.count = 0;
      record.resetTime = now + windowMs;
    }

    record.count += 1;
    rateLimitMap.set(key, record);

    if (record.count > maxRequests) {
      return res.status(429).json({
        error: 'Too many requests. Please wait a few minutes before trying again.'
      });
    }

    next();
  };
}

// Token creation & verification
function generateToken(payload) {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('base64url');
  return `${data}.${signature}`;
}

function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [data, signature] = parts;
  const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('base64url');
  if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    try {
      const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
      if (payload.exp && Date.now() > payload.exp) return null; // Expired
      return payload;
    } catch {
      return null;
    }
  }
  return null;
}

// Authentication middleware to protect admin operations
function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Admin authentication token required.' });
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload || !payload.isAdmin) {
    return res.status(403).json({ error: 'Forbidden: Invalid or expired admin credentials.' });
  }

  req.admin = payload;
  next();
}

// Initialize PostgreSQL database
initDB().catch(err => console.error('Database initialization error:', err));

// ----------------- API Endpoints -----------------

// Admin Authentication with rate-limiting & bcrypt verification
app.post('/api/auth/login', rateLimiter('login', 5, 15 * 60 * 1000), async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const isValid = await verifyAdminCredentials(email, password);
    if (isValid) {
      // Create session valid for 7 days
      const token = generateToken({
        email,
        isAdmin: true,
        exp: Date.now() + 30 * 24 * 60 * 60 * 1000
      });

      return res.json({
        success: true,
        user: { email, isAdmin: true },
        token
      });
    }

    return res.status(401).json({ error: 'Invalid email or password.' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server authentication error.' });
  }
});

// Projects API - Public read
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await getProjectsDB();
    res.json(projects);
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Projects API - Admin protected write
app.post('/api/projects', requireAdmin, async (req, res) => {
  try {
    const project = req.body;
    if (!project || !project.id || !project.title) {
      return res.status(400).json({ error: 'Invalid project data.' });
    }
    const saved = await saveProjectDB(project);
    res.json(saved);
  } catch (err) {
    console.error('Error saving project:', err);
    res.status(500).json({ error: 'Failed to save project' });
  }
});

// Projects API - Admin protected delete
app.delete('/api/projects/:id', requireAdmin, async (req, res) => {
  try {
    await deleteProjectDB(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting project:', err);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Projects API - Public vote with rate limiting
app.post('/api/projects/:id/vote', rateLimiter('vote', 30, 60 * 1000), async (req, res) => {
  try {
    const { type } = req.body; // 'like' or 'dislike'
    const updated = await voteProjectDB(req.params.id, type);
    res.json(updated || { success: true });
  } catch (err) {
    console.error('Error voting project:', err);
    res.status(500).json({ error: 'Failed to register vote' });
  }
});

// Contact / Messages API with rate limiting & backend Telegram dispatch
app.post('/api/contact', rateLimiter('contact', 5, 10 * 60 * 1000), async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Input length limits
    if (name.length > 100 || email.length > 150 || message.length > 3000) {
      return res.status(400).json({ error: 'Input exceeds maximum allowed length.' });
    }

    // 1. Save message in PostgreSQL
    await saveMessageDB({ name, email, message });

    // 2. Dispatch Telegram alert securely from backend (Token is NEVER exposed to client)
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      const safeName = name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const safeEmail = email.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const safeMessage = message.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const timeStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      const text = `📬 <b>New Message from Portfolio!</b>\n\n👤 <b>Name:</b> ${safeName}\n✉️ <b>Email:</b> ${safeEmail}\n\n📝 <b>Message:</b>\n${safeMessage}\n\n⏰ <b>Time:</b> ${timeStr}`;

      fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: 'HTML' })
      }).catch(err => console.error('Telegram notification error:', err.message));
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error saving message:', err);
    res.status(500).json({ error: 'Failed to save message' });
  }
});

// Visitor Counter API (Secure, Unique IP deduplicated)
app.get('/api/visitors', async (req, res) => {
  try {
    const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const ip = rawIp.split(',')[0].trim();
    const count = await recordUniqueVisitor(ip);
    res.json({ count });
  } catch (err) {
    console.error('Error in /api/visitors:', err);
    res.status(500).json({ error: 'Failed to fetch visitor count' });
  }
});

app.post('/api/visitors/hit', rateLimiter('visitor_hit', 10, 60 * 1000), async (req, res) => {
  try {
    const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const ip = rawIp.split(',')[0].trim();
    const count = await recordUniqueVisitor(ip);
    res.json({ count });
  } catch (err) {
    console.error('Error in /api/visitors/hit:', err);
    res.status(500).json({ error: 'Failed to increment visitor count' });
  }
});

// ----------------- Static Frontend -----------------

// Serve static assets from Vite build output
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback for all front-end routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Production server running on http://0.0.0.0:${PORT}`);
});
