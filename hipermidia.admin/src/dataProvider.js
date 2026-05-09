/**
 * Data provider customizado para a API do Projeto Hipermídia.
 *
 * Não usa paginação ainda (todos os registros retornados de uma vez),
 * compatível com o padrão atual da API.
 * Injeta o token JWT em todas as requisições de escrita.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function getToken() {
  return localStorage.getItem('admin_token');
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...options.headers,
    },
  });

  if (response.status === 204) return { data: null };

  const json = await response.json();

  if (!response.ok) {
    const error = new Error(json.erro || response.statusText);
    error.status = response.status;
    throw error;
  }

  return { data: json, status: response.status };
}

const dataProvider = {
  getList: async (resource) => {
    const { data } = await fetchJson(`${API_URL}/${resource}`);
    return { data, total: data.length };
  },

  getOne: async (resource, { id }) => {
    const { data } = await fetchJson(`${API_URL}/${resource}/${id}`);
    if (resource === 'locais' && data.foto_url) {
      const src = data.foto_url.startsWith('http')
        ? data.foto_url
        : `${API_URL}${data.foto_url}`;
      data.foto = { src, title: data.nome };
    }
    return { data };
  },

  getMany: async (resource, { ids }) => {
    const results = await Promise.all(
      ids.map(id => fetchJson(`${API_URL}/${resource}/${id}`).then(r => r.data))
    );
    return { data: results };
  },

  getManyReference: async (resource, { target, id }) => {
    const { data } = await fetchJson(`${API_URL}/${resource}?${target}=${id}`);
    const list = Array.isArray(data) ? data : [];
    return { data: list, total: list.length };
  },

  create: async (resource, { data }) => {
    const payload = { ...data };
    const fileToUpload = resource === 'locais' ? payload.foto?.rawFile : null;
    delete payload.foto;

    const result = await fetchJson(`${API_URL}/${resource}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const created = result.data;

    if (fileToUpload) {
      const formData = new FormData();
      formData.append('foto', fileToUpload);
      const resp = await fetch(`${API_URL}/locais/${created.id}/upload`, {
        method: 'POST',
        headers: authHeaders(),
        body: formData,
      });
      if (resp.ok) {
        const { foto_url } = await resp.json();
        created.foto_url = foto_url;
      }
    }

    return { data: created };
  },

  update: async (resource, { id, data }) => {
    const payload = { ...data };

    if (resource === 'locais') {
      if (payload.foto?.rawFile) {
        const formData = new FormData();
        formData.append('foto', payload.foto.rawFile);
        const resp = await fetch(`${API_URL}/locais/${id}/upload`, {
          method: 'POST',
          headers: authHeaders(),
          body: formData,
        });
        if (!resp.ok) throw new Error('Erro ao fazer upload da imagem');
        const { foto_url } = await resp.json();
        payload.foto_url = foto_url;
      } else if (payload.foto === null) {
        payload.foto_url = null;
      }
      delete payload.foto;
    }

    const result = await fetchJson(`${API_URL}/${resource}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return { data: result.data };
  },

  delete: async (resource, { id }) => {
    await fetchJson(`${API_URL}/${resource}/${id}`, { method: 'DELETE' });
    return { data: { id } };
  },

  deleteMany: async (resource, { ids }) => {
    await Promise.all(
      ids.map(id => fetchJson(`${API_URL}/${resource}/${id}`, { method: 'DELETE' }))
    );
    return { data: ids };
  },
};

export default dataProvider;
