import './SenhaRequisitos.scss';

export const REQUISITOS_SENHA = [
  { label: 'Mínimo de 8 caracteres',        ok: v => v.length >= 8 },
  { label: 'Mínimo de 2 números',            ok: v => (v.match(/\d/g) || []).length >= 2 },
  { label: 'Mínimo de 1 caractere especial', ok: v => /[^a-zA-Z0-9]/.test(v) },
  { label: 'Mínimo de 1 letra maiúscula',    ok: v => /[A-Z]/.test(v) },
  { label: 'Mínimo de 1 letra minúscula',    ok: v => /[a-z]/.test(v) },
];

export function senhaValida(valor) {
  return REQUISITOS_SENHA.every(r => r.ok(valor));
}

export default function SenhaRequisitos({ valor }) {
  if (!valor) return null;

  return (
    <div className="senha-requisitos">
      <p className="senha-requisitos__titulo">Dicas para senhas fortes:</p>
      <ul>
        {REQUISITOS_SENHA.map(r => (
          <li key={r.label} className={r.ok(valor) ? 'ok' : ''}>
            <span className="senha-requisitos__icone">{r.ok(valor) ? '✓' : '○'}</span>
            {r.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
