const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function enviarCodigoRecuperacao(destinatario, nome, codigo) {
  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM,
    to: [destinatario],
    subject: 'Seu código de recuperação de senha',
    html: `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head><meta charset="UTF-8"></head>
      <body style="font-family: Inter, sans-serif; background: #f5f5f5; margin: 0; padding: 32px;">
        <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 16px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <h2 style="font-size: 22px; color: #111827; margin: 0 0 8px;">Recuperação de senha</h2>
          <p style="color: #666; font-size: 15px; margin: 0 0 28px;">Olá, ${nome}. Use o código abaixo para redefinir sua senha:</p>
          <div style="background: #f0f4ff; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 28px;">
            <span style="font-size: 40px; font-weight: 700; letter-spacing: 10px; color: #0051E8;">${codigo}</span>
          </div>
          <p style="color: #666; font-size: 14px; margin: 0 0 8px;">Este código é válido por <strong>15 minutos</strong>.</p>
          <p style="color: #999; font-size: 13px; margin: 0;">Se você não solicitou a recuperação de senha, ignore este e-mail.</p>
        </div>
      </body>
      </html>
    `,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
}

module.exports = { enviarCodigoRecuperacao };
