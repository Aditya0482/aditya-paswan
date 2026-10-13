import 'dotenv/config';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
const { Pool } = pg;

let pool = null;

export function getPool() {
  if (!pool && process.env.DATABASE_URL) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
    });
  }
  return pool;
}

// In-memory fallback if DATABASE_URL is not configured locally
const memoryStore = {
  visitors: 48,
  visited_ips: new Set(),
  admin_users: [],
  projects: [], // Clean start - NO fake data
  messages: []
};

export async function initDB() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  let adminPasswordHash = null;

  if (adminEmail && adminPassword) {
    adminPasswordHash = await bcrypt.hash(adminPassword, 10);
    const existingIdx = memoryStore.admin_users.findIndex(
      u => u.email.toLowerCase() === adminEmail.toLowerCase()
    );
    if (existingIdx >= 0) {
      memoryStore.admin_users[existingIdx].password_hash = adminPasswordHash;
    } else {
      memoryStore.admin_users.push({
        email: adminEmail,
        password_hash: adminPasswordHash
      });
    }
  }

  const p = getPool();
  if (!p) {
    console.log('ℹ️ DATABASE_URL not detected. Running with in-memory storage.');
    return;
  }

  try {
    const client = await p.connect();
    console.log('✅ Connected to PostgreSQL database successfully!');

    // Clean up unused goals table if it exists
    await client.query('DROP TABLE IF EXISTS goals CASCADE;');

    // Create projects table
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        tech JSONB NOT NULL DEFAULT '[]'::jsonb,
        result TEXT,
        demo_url TEXT,
        github_url TEXT,
        image TEXT,
        likes INTEGER DEFAULT 0,
        dislikes INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Delete fake demo projects so they never appear again in PostgreSQL
    await client.query(
      "DELETE FROM projects WHERE id IN ('crypto-dashboard', 'sales-analysis', 'predictive-model');"
    );

    // Create messages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create admin_users table for hashed credentials
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        email VARCHAR(255) PRIMARY KEY,
        password_hash TEXT NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed or update admin user if ADMIN_EMAIL and ADMIN_PASSWORD are provided
    if (adminEmail && adminPasswordHash) {
      await client.query(
        `INSERT INTO admin_users (email, password_hash)
         VALUES ($1, $2)
         ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, updated_at = CURRENT_TIMESTAMP;`,
        [adminEmail, adminPasswordHash]
      );
    }

    // Create site_stats table for visitor counter
    await client.query(`
      CREATE TABLE IF NOT EXISTS site_stats (
        key VARCHAR(50) PRIMARY KEY,
        value INTEGER NOT NULL DEFAULT 48
      );
    `);

    // Create unique_visitors table to prevent a single user from incrementing repeatedly
    await client.query(`
      CREATE TABLE IF NOT EXISTS unique_visitors (
        ip_hash VARCHAR(64) PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Initialize visitor count if missing
    await client.query(
      `INSERT INTO site_stats (key, value)
       VALUES ('visitors', 48)
       ON CONFLICT (key) DO NOTHING;`
    );

    client.release();
    console.log('✅ PostgreSQL tables verified & ready (unique visitor tracking enabled).');
  } catch (err) {
    console.error('❌ Error initializing PostgreSQL tables:', err.message);
  }
}

// Admin Authentication Helper with bcrypt
export async function verifyAdminCredentials(email, inputPassword) {
  if (!email || !inputPassword) return false;
  const p = getPool();
  let hash = null;

  if (p) {
    try {
      const res = await p.query('SELECT password_hash FROM admin_users WHERE LOWER(email) = LOWER($1)', [email]);
      if (res.rows.length > 0) {
        hash = res.rows[0].password_hash;
      }
    } catch (err) {
      console.error('Error querying admin credentials:', err);
    }
  } else {
    const admin = memoryStore.admin_users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (admin) hash = admin.password_hash;
  }

  // Fallback to environment variables if not yet seeded in DB/memory
  if (
    !hash &&
    process.env.ADMIN_EMAIL &&
    process.env.ADMIN_PASSWORD &&
    email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase()
  ) {
    hash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
  }

  if (!hash) return false;
  return bcrypt.compare(inputPassword, hash);
}

// Database helper functions
export async function getProjectsDB() {
  const p = getPool();
  if (!p) return memoryStore.projects;
  const res = await p.query('SELECT * FROM projects ORDER BY created_at DESC');
  return res.rows.map(r => ({
    id: r.id,
    title: r.title,
    description: r.description,
    tech: Array.isArray(r.tech) ? r.tech : JSON.parse(r.tech || '[]'),
    result: r.result,
    demoUrl: r.demo_url,
    githubUrl: r.github_url,
    image: r.image,
    likes: r.likes || 0,
    dislikes: r.dislikes || 0
  }));
}

export async function saveProjectDB(project) {
  const p = getPool();
  if (!p) {
    const idx = memoryStore.projects.findIndex(x => x.id === project.id);
    if (idx >= 0) memoryStore.projects[idx] = project;
    else memoryStore.projects.unshift(project);
    return project;
  }
  await p.query(
    `INSERT INTO projects (id, title, description, tech, result, demo_url, github_url, image, likes, dislikes)
     VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, $8, $9, $10)
     ON CONFLICT (id) DO UPDATE SET
       title = EXCLUDED.title,
       description = EXCLUDED.description,
       tech = EXCLUDED.tech,
       result = EXCLUDED.result,
       demo_url = EXCLUDED.demo_url,
       github_url = EXCLUDED.github_url,
       image = EXCLUDED.image,
       likes = EXCLUDED.likes,
       dislikes = EXCLUDED.dislikes;`,
    [
      project.id,
      project.title,
      project.description,
      JSON.stringify(project.tech || []),
      project.result || '',
      project.demoUrl || '',
      project.githubUrl || '',
      project.image || '',
      project.likes || 0,
      project.dislikes || 0
    ]
  );
  return project;
}

export async function deleteProjectDB(id) {
  const p = getPool();
  if (!p) {
    memoryStore.projects = memoryStore.projects.filter(x => x.id !== id);
    return true;
  }
  await p.query('DELETE FROM projects WHERE id = $1', [id]);
  return true;
}

export async function voteProjectDB(id, type) {
  const p = getPool();
  if (!p) {
    const proj = memoryStore.projects.find(x => x.id === id);
    if (proj) {
      if (type === 'like') proj.likes = (proj.likes || 0) + 1;
      if (type === 'dislike') proj.dislikes = (proj.dislikes || 0) + 1;
    }
    return proj;
  }
  const col = type === 'like' ? 'likes' : 'dislikes';
  const res = await p.query(
    `UPDATE projects SET ${col} = COALESCE(${col}, 0) + 1 WHERE id = $1 RETURNING *`,
    [id]
  );
  if (res.rows[0]) {
    const r = res.rows[0];
    return {
      id: r.id,
      title: r.title,
      description: r.description,
      tech: Array.isArray(r.tech) ? r.tech : JSON.parse(r.tech || '[]'),
      result: r.result,
      demoUrl: r.demo_url,
      githubUrl: r.github_url,
      image: r.image,
      likes: r.likes,
      dislikes: r.dislikes
    };
  }
  return null;
}

export async function saveMessageDB(msg) {
  const p = getPool();
  if (!p) {
    memoryStore.messages.push(msg);
    return true;
  }
  await p.query(
    'INSERT INTO messages (name, email, message) VALUES ($1, $2, $3)',
    [msg.name, msg.email, msg.message]
  );
  return true;
}

export async function recordUniqueVisitor(ip) {
  const p = getPool();
  if (!ip) return getVisitorsDB();

  // Salt and hash the IP address so raw IPs are never stored in plain text
  const ipHash = crypto.createHash('sha256').update(ip + '_salt_aditya_2026').digest('hex');

  if (!p) {
    if (!memoryStore.visited_ips.has(ipHash)) {
      memoryStore.visited_ips.add(ipHash);
      memoryStore.visitors = (memoryStore.visitors || 48) + 1;
    }
    return memoryStore.visitors;
  }

  try {
    // Attempt to insert unique visitor hash. If it already exists, rowCount will be 0.
    const res = await p.query(
      'INSERT INTO unique_visitors (ip_hash) VALUES ($1) ON CONFLICT (ip_hash) DO NOTHING',
      [ipHash]
    );

    // If new unique visitor was inserted, increment site_stats
    if (res.rowCount === 1) {
      const updateRes = await p.query(
        "UPDATE site_stats SET value = value + 1 WHERE key = 'visitors' RETURNING value"
      );
      return Number(updateRes.rows[0]?.value || 48);
    }

    // Otherwise, return existing visitor count without incrementing
    return getVisitorsDB();
  } catch (err) {
    console.error('Error recording unique visitor:', err);
    return getVisitorsDB();
  }
}

export async function getVisitorsDB() {
  const p = getPool();
  if (!p) return memoryStore.visitors || 48;
  try {
    const res = await p.query("SELECT value FROM site_stats WHERE key = 'visitors'");
    return res.rows[0]?.value ? Number(res.rows[0].value) : 48;
  } catch (err) {
    console.error('Error fetching visitors:', err);
    return memoryStore.visitors || 48;
  }
}

export async function incrementVisitorsDB() {
  const p = getPool();
  if (!p) {
    memoryStore.visitors = (memoryStore.visitors || 48) + 1;
    return memoryStore.visitors;
  }
  try {
    const res = await p.query(
      "UPDATE site_stats SET value = value + 1 WHERE key = 'visitors' RETURNING value"
    );
    return res.rows[0]?.value ? Number(res.rows[0].value) : 48;
  } catch (err) {
    console.error('Error incrementing visitors:', err);
    memoryStore.visitors = (memoryStore.visitors || 48) + 1;
    return memoryStore.visitors;
  }
}
