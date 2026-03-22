import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendLeadEmail = async (payload: string) => {
  try {
    const mailOptions = {
      from: `"WDB AI Copilot" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: '🎯 Novo Fechamento pela IA no Site!',
      text: `Olá William,\n\nA sua Inteligência Artificial acabou de finalizar um orçamento com um cliente que está sendo transferido para o seu WhatsApp agora mesmo.\n\n=== RESUMO GERADO ===\n\n${payload}\n\n====================\n\nFique de olho nas mensagens!\nAss: WDB Copilot 🤖`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Notificação por e-mail enviada com sucesso:", info.response);
    return true;
  } catch (error) {
    console.error("Erro ao enviar e-mail de notificação:", error);
    return false;
  }
};
