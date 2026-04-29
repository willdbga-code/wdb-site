"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.whatsappWebhook = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const generative_ai_1 = require("@google/generative-ai");
const axios_1 = require("axios");
const nodemailer = require("nodemailer");
admin.initializeApp();
const db = admin.firestore();
// =====================================================
// CONFIGURATION - Update EVOLUTION_API_URL after deploy
// =====================================================
const EVOLUTION_API_URL = functions.params.defineString("EVOLUTION_API_URL");
const EVOLUTION_API_KEY = functions.params.defineString("EVOLUTION_API_KEY");
const GEMINI_API_KEY = functions.params.defineString("GEMINI_API_KEY");
const GOOGLE_CLIENT_EMAIL_PARAM = functions.params.defineString("GOOGLE_CLIENT_EMAIL_PARAM");
const GOOGLE_PRIVATE_KEY_PARAM = functions.params.defineString("GOOGLE_PRIVATE_KEY_PARAM");
const EMAIL_USER = functions.params.defineString("EMAIL_USER");
const EMAIL_PASS = functions.params.defineString("EMAIL_PASS");
const INSTANCE_NAME = "william"; // Nome da instância criada na Evolution API
// =====================================================
// THE SAME WDB COPILOT BRAIN - Equal to the website
// =====================================================
const SYSTEM_INSTRUCTION = `Você é o "WDB Copilot", o assistente virtual de inteligência do renomado estúdio de fotografia fine art de "William Del Barrio".
Seu objetivo principal é apresentar os serviços de forma premium, cordial, tirar dúvidas e coletar as intenções de agendamento do cliente.
Seja conciso em suas respostas, porém muito educado, luxuoso e focado na conversão. Responda diretamente e sem rodeios as dúvidas.

IMPORTANTE: Você está respondendo via WhatsApp. Use emojis com moderação para um tom mais próximo e humano. Não use markdown como **negrito** ou # cabeçalhos - o WhatsApp não os renderiza. Use apenas texto simples, linhas em branco entre parágrafos e emojis sutis.

** PACOTES DE EXPERIÊNCIA **
1. Retrato Autoral (R$ 450): 1h em estúdio, 15 obras digitais fine art. Inclui maquiagem premium. Foco em perfil pessoal/redes.
2. Family Legacy (R$ 800): Para núcleo familiar e maternidade. 30 obras tratadas. Inclui 1 maquiagem premium (adicionais custam R$ 150/pessoa).
3. Authority & Branding (R$ 1500): Para projetar autoridade comercial corporativa. 20 obras comerciais. Inclui maquiagem premium.
4. Cinematic Wedding (R$ 3500): Cobertura de casamento. 8h com equipe dupla. Mínimo de 500 imagens. Não inclui maquiagem de nossa parte (focamos em documentar).
5. Especial Dia das Mães (R$ 550): 20 obras digitais, 3 maquiagens premium. Direção criativa focada para conexão genuína das modelos.
6. Pacote Fashion Day (R$ 250): (OFEREÇA APENAS SE O CLIENTE ESCREVER "flash" OU "fashion day"). Um dia exclusivo focado em lojistas e marcas de moda. Nós viabilizamos uma modelo profissional de alto nível por um dia inteiro, e dividimos o custo abrindo 5 horários estratégicos. Assim, sua marca garante um catálogo fotográfico de grife, com modelo e estúdio inclusos, por um investimento extremamente inteligente e acessível.

** EXTRAS (Podem ser combinados ao pacote) **
- Maquiagem Extra: +R$ 150
- Fotógrafo Extra: +R$ 750
- Álbum Fine Art: +R$ 1600

** LOCALIZAÇÃO E DESLOCAMENTO **
- Nosso estúdio conceito fica em Pindamonhangaba, SP.
- Até 20km de distância: não cobramos taxa de deslocamento.
- Acima de 20km: cobramos uma taxa de R$ 4,00 por Km rodado até o local do ensaio.

** CABELO E PENTEADO **
- A produção de cabelo NÃO está inclusa nos pacotes. Temos parceiros se o cliente pedir (é só instruir para falar com o William no WhatsApp indicando uma foto de referência).

** POLÍTICA FINANCEIRA E CONDIÇÕES **
- O cliente pode parcelar TODO o investimento (pacotes + extras) em até 10x no cartão de crédito.
- Aceitamos pagamentos à vista por PIX.
- O cliente pode comprar mais "fotos extras" avulsas, se amar os resultados no nosso painel de seleção, após o ensaio. Pode oferecer com segurança.

** ESTRUTURA PARA AGENDAMENTO **
- Sempre que a conversa se encaminhar para fechamento, pergunte naturalmente qual o pacote, se quer extras e qual a data (mês/dia) ideal para conferirmos a agenda.
- Depois de fechado/escolhido o orçamento, avise que para confirmar a reserva da data, o sistema irá gerar automaticamente um link de pagamento referente a 10% do valor total como sinal, e peça ao cliente que envie o comprovante (print/foto) logo após o pagamento para o William validar de vez.
- EXTREMAMENTE IMPORTANTE: Para que o sistema receba os dados do cliente e a nossa automação gere o link de pagamento, na sua última resposta você DEVE escrever EXATAMENTE este bloco no final da sua mensagem (substituindo os dados e calculando o valor final):
[TRANSFER_WHATSAPP
Pacote: (inserir nome)
Extras: (inserir extras ou nenhum)
Data Prevista: (inserir data)
Valor Total Estimado: R$ (valor numérico somando pacote + extras, ex: 1500 ou 1500,00)
]

** RECOMENDAÇÕES PÓS-AGENDAMENTO (MUITO IMPORTANTE) **
- Assim que o cliente confirmar que enviou o comprovante de pagamento do sinal, ou disser que fez o pagamento, responda com uma mensagem calorosa de confirmação e em seguida entregue TODAS as recomendações abaixo de forma fluida e organizada. Não espere o William validar para enviar essas dicas — o cliente precisa receber imediatamente para se preparar com antecedência.

Mensagem-modelo de recomendações pós-agendamento (adapte levemente o texto, nunca omita os pontos):

"Maravilha! Seu ensaio já está reservado na agenda — não vejo a hora de criar algo único com você! ✨

Para garantir que as suas fotos fiquem absolutamente incríveis, preparei um guia exclusivo de preparação:

👗 ROUPAS E LOOKS
Priorize peças em tons neutros e atemporais: bege, branco, cinza, azul escuro e azul claro funcionam lindamente em fotografia fine art. Evite estampas coloridas ou muito chamativas — elas disputam atenção com o que realmente importa: você. Traga opções de 2 a 3 looks para variarmos os climas do ensaio.

💄 MAQUIAGEM E PELE
Chegue com o rosto limpo e sem nenhum produto aplicado. Nossa maquiadora trabalha com a sua pele como tela em branco — qualquer produto prévio pode interferir no resultado final. Se quiser usar hidratante, opte pelos mais leves e sem brilho.

💇 CABELO
Venha com o cabelo lavado e completamente seco. Evite cremes de pentear pesados no dia anterior.
→ Para clientes cacheadas ou crespas: finalize os cachos em casa normalmente, com seus produtos de costume, e venha com o cabelo pronto e seco. Isso garante que seus cachos estejam no auge da definição para o ensaio.
→ Para cabelos lisos: deixe-os soltos e naturais. Nossa equipe cuida do estilo durante a produção.

📍 NO DIA DO ENSAIO
Chegue com 10 a 15 minutos de antecedência para uma chegada tranquila. Hidrate-se bem, durma bem na noite anterior — repouso e boa energia aparecem nas fotos. 😊

Qualquer dúvida antes do grande dia, estou aqui. Mal posso esperar para esse ensaio!

📸 PAINEL DO CLIENTE
Sua seleção de fotos e a entrega final das obras serão feitas exclusivamente pelo nosso painel digital. Para já garantir o seu acesso, crie a sua conta grátis em: https://williamdelbarrio.com.br — é rápido e você já fica pronta para receber tudo com excelência no dia da entrega!"
`;
// =====================================================
// GOOGLE CALENDAR - Real-time availability
// =====================================================
async function getUpcomingAvailability(clientEmail, privateKey) {
    try {
        const { google } = await Promise.resolve().then(() => require("googleapis"));
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: clientEmail,
                private_key: privateKey.replace(/\\n/g, "\n"),
            },
            scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
        });
        const calendar = google.calendar({ version: "v3", auth });
        const timeMin = new Date();
        const timeMax = new Date();
        timeMax.setDate(timeMax.getDate() + 45);
        const response = await calendar.events.list({
            calendarId: "willdbga@gmail.com",
            timeMin: timeMin.toISOString(),
            timeMax: timeMax.toISOString(),
            singleEvents: true,
            orderBy: "startTime",
        });
        const events = response.data.items;
        if (!events || events.length === 0) {
            return "Agenda totalmente livre para os próximos 45 dias. Qualquer data é válida.";
        }
        const busyDays = events.map((event) => {
            var _a, _b, _c;
            if ((_a = event.start) === null || _a === void 0 ? void 0 : _a.date)
                return `- Ocupado O DIA TODO no dia ${event.start.date}`;
            const start = new Date((_b = event.start) === null || _b === void 0 ? void 0 : _b.dateTime);
            const end = new Date((_c = event.end) === null || _c === void 0 ? void 0 : _c.dateTime);
            return `- Ocupado no dia ${start.toLocaleDateString("pt-BR")} das ${start.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} até ${end.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
        });
        return `Eventos ocupados na agenda do William nos próximos 45 dias:\n${busyDays.join("\n")}\n\n(Aviso para a IA: Qualquer data ou horário que não esteja na lista acima significa que o William está LIVRE e você pode oferecer).`;
    }
    catch (error) {
        return "Aviso para a IA: Não foi possível acessar a agenda neste segundo. Se o cliente pedir uma data, diga que precisamos confirmar disponibilidade com o William na etapa seguinte.";
    }
}
// =====================================================
// EMAIL NOTIFICATION - Same as the website
// =====================================================
async function sendLeadEmail(payload, emailUser, emailPass) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: emailUser, pass: emailPass },
    });
    await transporter.sendMail({
        from: `"WDB AI Copilot WhatsApp" <${emailUser}>`,
        to: emailUser,
        subject: "Novo Lead fechado pela IA no WhatsApp!",
        text: `Ola William,\n\nSua IA acabou de fechar um orçamento via WhatsApp!\n\n=== RESUMO DO LEAD ===\n\n${payload}\n\n====================\n\nAss: WDB Copilot (WhatsApp Bot)`,
    });
}
// =====================================================
// SEND WHATSAPP MESSAGE via Evolution API
// =====================================================
async function sendWhatsAppMessage(to, text, apiUrl, apiKey) {
    await axios_1.default.post(`${apiUrl}/message/sendText/${INSTANCE_NAME}`, { number: to, text }, { headers: { apikey: apiKey, "Content-Type": "application/json" } });
}
// =====================================================
// MAIN WEBHOOK - Receives messages from Evolution API
// =====================================================
exports.whatsappWebhook = functions.https.onRequest(async (req, res) => {
    var _a, _b, _c, _d, _e;
    if (req.method !== "POST") {
        res.status(405).send("Method Not Allowed");
        return;
    }
    try {
        const body = req.body;
        // Parse Evolution API v2 webhook payload
        const event = body === null || body === void 0 ? void 0 : body.event;
        if (event !== "messages.upsert") {
            res.status(200).send("OK - ignored event");
            return;
        }
        const message = body === null || body === void 0 ? void 0 : body.data;
        const remoteJid = (_a = message === null || message === void 0 ? void 0 : message.key) === null || _a === void 0 ? void 0 : _a.remoteJid;
        const fromMe = (_b = message === null || message === void 0 ? void 0 : message.key) === null || _b === void 0 ? void 0 : _b.fromMe;
        const messageType = message === null || message === void 0 ? void 0 : message.message;
        // Ignore messages sent by the bot itself or without text
        if (fromMe || !remoteJid || !messageType) {
            res.status(200).send("OK - ignored");
            return;
        }
        // Extract text (supports regular text and extended messages)
        const incomingText = (messageType === null || messageType === void 0 ? void 0 : messageType.conversation) ||
            ((_c = messageType === null || messageType === void 0 ? void 0 : messageType.extendedTextMessage) === null || _c === void 0 ? void 0 : _c.text) ||
            "";
        if (!incomingText.trim()) {
            res.status(200).send("OK - no text");
            return;
        }
        const phoneNumber = remoteJid.replace("@s.whatsapp.net", "");
        functions.logger.info(`[WDB Bot] Message from ${phoneNumber}: ${incomingText}`);
        // ── Check if this is a personal contact (bot stays silent) ──
        const personalRef = db.collection("whatsapp_personal_contacts").doc(phoneNumber);
        const personalSnap = await personalRef.get();
        if (personalSnap.exists) {
            functions.logger.info(`[WDB Bot] Skipping personal contact: ${phoneNumber}`);
            res.status(200).send("OK - personal contact");
            return;
        }
        // ── Firestore: Load or create session ──
        const sessionRef = db.collection("whatsapp_sessions").doc(phoneNumber);
        const sessionSnap = await sessionRef.get();
        let history = [];
        const now = Date.now();
        const SESSION_TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24 hours
        if (sessionSnap.exists) {
            const data = sessionSnap.data();
            const lastActivity = ((_d = data.updatedAt) === null || _d === void 0 ? void 0 : _d.toMillis()) || 0;
            // Reset session if it's been more than 24h
            if (now - lastActivity < SESSION_TIMEOUT_MS) {
                history = data.history || [];
            }
        }
        // ── Build Gemini history ──
        const calendarContext = await getUpcomingAvailability(GOOGLE_CLIENT_EMAIL_PARAM.value(), GOOGLE_PRIVATE_KEY_PARAM.value());
        const genAI = new generative_ai_1.GoogleGenerativeAI(GEMINI_API_KEY.value());
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            systemInstruction: SYSTEM_INSTRUCTION + `\n\n** STATUS DA AGENDA DO WILLIAM EM TEMPO REAL **\n${calendarContext}`,
        });
        // Normalize history for Gemini (must alternate user/model, start with user)
        let normalizedHistory = [];
        for (const item of history) {
            if (normalizedHistory.length === 0 && item.role === "model") {
                normalizedHistory.push({ role: "user", parts: [{ text: "Olá" }] });
            }
            const last = normalizedHistory[normalizedHistory.length - 1];
            if (last && last.role === item.role) {
                last.parts[0].text += "\n" + item.text;
            }
            else {
                normalizedHistory.push({ role: item.role, parts: [{ text: item.text }] });
            }
        }
        const chat = model.startChat({ history: normalizedHistory });
        const result = await chat.sendMessage(incomingText);
        const responseText = result.response.text();
        // ── Save updated history to Firestore ──
        const updatedHistory = [
            ...history,
            { role: "user", text: incomingText },
            { role: "model", text: responseText },
        ].slice(-40); // Keep last 40 messages to avoid bloat
        await sessionRef.set({
            history: updatedHistory,
            phoneNumber,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        // ── Check for lead closure ──
        const transferMatch = responseText.match(/\[TRANSFER_WHATSAPP([\s\S]*?)\]/);
        let cleanResponse = responseText.replace(/\[TRANSFER_WHATSAPP[\s\S]*?\]/g, "").trim();
        if (transferMatch) {
            const payload = transferMatch[1].trim();
            // Save lead to Firestore
            await db.collection("leads").add({
                source: "whatsapp",
                phoneNumber,
                payload,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            // Send email notification (fire & forget)
            sendLeadEmail(payload, EMAIL_USER.value(), EMAIL_PASS.value()).catch((e) => functions.logger.error("Email error:", e));
            // Extract the estimated total value to generate InfinitePay link
            const valueMatch = payload.match(/Valor Total Estimado: R\$\s*([\d.,]+)/);
            let totalValue = 0;
            if (valueMatch) {
                // Parse numbers like "1500", "1.500,00", "1500.00"
                const parsedStr = valueMatch[1].replace(/\./g, "").replace(",", ".");
                totalValue = parseFloat(parsedStr);
            }
            if (totalValue > 0) {
                const signalValue = totalValue * 0.1; // 10%
                const signalCents = Math.round(signalValue * 100);
                try {
                    const orderNsu = `WDB-LEAD-${Date.now()}`;
                    const infinitePayResp = await axios_1.default.post("https://api.infinitepay.io/invoices/public/checkout/links", {
                        handle: "william-del-barrio",
                        redirect_url: "https://williamdelbarrio.com.br",
                        webhook_url: "https://williamdelbarrio.com.br", // Dummy webhook since William checks receipts manually
                        order_nsu: orderNsu,
                        items: [
                            {
                                quantity: 1,
                                price: signalCents,
                                description: "Sinal de Reserva - Estúdio William Del Barrio (10%)"
                            }
                        ],
                        customer: {
                            name: "Cliente WDB WhatsApp",
                            phone_number: `+${phoneNumber}`,
                        }
                    });
                    if (infinitePayResp.data && infinitePayResp.data.url) {
                        cleanResponse += `\n\n🔗 *Link para pagamento do Sinal (10% - R$ ${signalValue.toFixed(2).replace(".", ",")} )*:\n${infinitePayResp.data.url}\n\n*_Por favor, não se esqueça de mandar o comprovante aqui pra gente!_*`;
                    }
                }
                catch (paymentErr) {
                    functions.logger.error("[WDB Bot] Erro ao gerar link InfinitePay:", ((_e = paymentErr === null || paymentErr === void 0 ? void 0 : paymentErr.response) === null || _e === void 0 ? void 0 : _e.data) || paymentErr.message);
                    cleanResponse += `\n\n(Aviso: Tivemos uma instabilidade ao gerar o seu link de pagamento. Por favor, solicite a chave PIX informando ao William).`;
                }
            }
        }
        // ── Send reply via Evolution API ──
        await sendWhatsAppMessage(remoteJid, cleanResponse, EVOLUTION_API_URL.value(), EVOLUTION_API_KEY.value());
        functions.logger.info(`[WDB Bot] Replied to ${phoneNumber}`);
        res.status(200).send("OK");
    }
    catch (error) {
        functions.logger.error("[WDB Bot] Error:", error);
        res.status(500).send("Internal Server Error");
    }
});
//# sourceMappingURL=index.js.map