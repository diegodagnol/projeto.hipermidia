const sanitize = require('sanitize-html');

// Tags e atributos permitidos — cobre tudo que o TipTap gera
const opcoes = {
  allowedTags: [
    'p', 'br', 'strong', 'em', 's', 'u',
    'h2', 'h3',
    'ul', 'ol', 'li',
    'blockquote',
    'a',
    'img',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'hr',
    'iframe',
  ],
  allowedAttributes: {
    'a':      ['href', 'target', 'rel', 'class'],
    'img':    ['src', 'alt', 'width', 'height'],
    'th':     ['colspan', 'rowspan', 'style'],
    'td':     ['colspan', 'rowspan', 'style', 'data-background-color'],
    'p':      ['style'],
    'h2':     ['style'],
    'h3':     ['style'],
    'iframe': ['src', 'width', 'height', 'frameborder', 'allowfullscreen'],
  },
  allowedClasses: {
    // Apenas a classe do link com estilo de botão é permitida em <a>
    'a': ['link-botao'],
  },
  allowedStyles: {
    // Permite apenas alinhamento (gerado pelo TipTap TextAlign)
    '*': {
      'text-align': [/^(left|center|right|justify)$/],
    },
    'td': {
      'background-color': [/^#[0-9a-fA-F]{3,6}$/, /^rgb\(/],
    },
  },
  allowedIframeHostnames: ['www.youtube.com', 'www.youtube-nocookie.com'],
  // Força links externos a abrirem em nova aba com proteção
  transformTags: {
    'a': (tagName, attribs) => ({
      tagName,
      attribs: {
        ...attribs,
        target: '_blank',
        rel: 'noopener noreferrer',
      },
    }),
  },
};

/**
 * Middleware que sanitiza req.body.conteudo antes de chegar no handler.
 * Uso: router.post('/', authenticateAdmin, sanitizeConteudo, ...)
 */
function sanitizeConteudo(req, res, next) {
  if (req.body && typeof req.body.conteudo === 'string') {
    req.body.conteudo = sanitize(req.body.conteudo, opcoes);
  }
  next();
}

module.exports = sanitizeConteudo;
