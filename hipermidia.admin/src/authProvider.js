const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const authProvider = {
  login: async ({ username, password }) => {
    const response = await fetch(`${API_URL}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: username, senha: password }),
    });

    if (!response.ok) {
      throw new Error('E-mail ou senha incorretos');
    }

    const { token, admin } = await response.json();
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_identity', JSON.stringify(admin));
  },

  logout: () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_identity');
    return Promise.resolve();
  },

  checkAuth: () => {
    return localStorage.getItem('admin_token')
      ? Promise.resolve()
      : Promise.reject();
  },

  checkError: (error) => {
    if (error?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_identity');
      return Promise.reject();
    }
    return Promise.resolve();
  },

  getIdentity: () => {
    const raw = localStorage.getItem('admin_identity');
    if (!raw) return Promise.reject();
    const admin = JSON.parse(raw);
    return Promise.resolve({ id: admin.id, fullName: admin.nome, email: admin.email });
  },

  getPermissions: () => Promise.resolve('admin'),
};

export default authProvider;
