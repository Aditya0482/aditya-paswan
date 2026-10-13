// API Client connecting to PostgreSQL Backend
export interface User {
  email: string;
  isAdmin: boolean;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  tech: string[];
  result: string;
  demoUrl: string;
  githubUrl: string;
  image: string;
  likes?: number;
  dislikes?: number;
}

// Auth State Management
type AuthListener = (user: User | null) => void;
const authListeners: Set<AuthListener> = new Set();

export const auth = {
  getCurrentUser(): User | null {
    const raw = localStorage.getItem('auth_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  async login(email: string, password: string): Promise<User> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Login failed' }));
      throw new Error(err.error || 'Failed to sign in.');
    }

    const data = await res.json();
    const user: User = data.user;
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
    }
    localStorage.setItem('auth_user', JSON.stringify(user));
    localStorage.setItem('isAdmin', 'true');
    authListeners.forEach(listener => listener(user));
    return user;
  },

  async logout(): Promise<void> {
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('isAdmin');
    authListeners.forEach(listener => listener(null));
  },

  onAuthStateChanged(callback: AuthListener): () => void {
    authListeners.add(callback);
    callback(auth.getCurrentUser());
    return () => {
      authListeners.delete(callback);
    };
  }
};

// Projects API
export async function fetchProjects(): Promise<Project[]> {
  try {
    const res = await fetch('/api/projects');
    if (!res.ok) throw new Error('Failed to fetch projects');
    const data = await res.json();
    localStorage.setItem('portfolio_projects', JSON.stringify(data));
    return data;
  } catch (err) {
    const cached = localStorage.getItem('portfolio_projects');
    if (cached) {
      try { return JSON.parse(cached); } catch {}
    }
    return [];
  }
}

export async function saveProjectApi(project: Project): Promise<Project> {
  const token = auth.getToken();
  if (!token) {
    throw new Error('Admin session not found. Please log in to the Admin Panel first.');
  }

  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(project)
  });

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      auth.logout();
      throw new Error('Admin session expired. Please log in again.');
    }
    const err = await res.json().catch(() => ({ error: 'Failed to save project' }));
    throw new Error(err.error || 'Failed to save project');
  }
  return res.json();
}

export async function deleteProjectApi(id: string): Promise<void> {
  const token = auth.getToken();
  if (!token) {
    throw new Error('Admin session not found. Please log in to the Admin Panel first.');
  }

  const res = await fetch(`/api/projects/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      auth.logout();
      throw new Error('Admin session expired. Please log in again.');
    }
    const err = await res.json().catch(() => ({ error: 'Failed to delete project' }));
    throw new Error(err.error || 'Failed to delete project');
  }
}

export async function voteProjectApi(id: string, type: 'like' | 'dislike'): Promise<void> {
  await fetch(`/api/projects/${encodeURIComponent(id)}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type })
  });
}

// Contact API
export async function saveContactMessage(name: string, email: string, message: string): Promise<void> {
  const res = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, message })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to send message' }));
    throw new Error(err.error || 'Failed to send message');
  }
}
