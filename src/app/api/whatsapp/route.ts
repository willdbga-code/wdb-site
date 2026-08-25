import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getUpcomingAvailability } from "@/lib/calendar";
import { sendLeadEmail } from "@/lib/mailer";

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || "https://evolution-api-production-2413.up.railway.app";
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || "wdb-copilot-secret-2024";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyAuqZMaBUG_8CKQ6Y_wceN6NHyF0hWAXTk";
const INSTANCE_NAME = "william";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const SYSTEM_INSTRUCTION = `Você é o "WDB Copilot", o assistente virtual de inteligência do renomado estúdio de fotografia fine art de "William Del Barrio".
Seu objetivo principal é apresentar os serviços de forma premium, cordial, tirar dúvidas e coletar as intenções de agendamento do cliente.
Seja conciso em suas respostas, porém muito educado, luxuoso e focado na conversão. Responda diretamente e sem rodeios as dúvidas.

IMPORTANTE: Você está respondendo via WhatsApp. Use emojis com moderação para um tom mais próximo e humano. Não use markdown como **negrito** ou # cabeçalhos - o WhatsApp não os renderiza. Use apenas texto simples, linhas em branco entre parágrafos e emojis sutis.

** PACOTES DE EXPERIÊNCIA **
1. Retrato Autoral (R$ 450): 1h em estúdio, 30 obras digitais fine art tratadas. Inclui maquiagem premium. Foco em perfil pessoal/redes.
2. Family Legacy (R$ 800): Para núcleo familiar e maternidade. 45 obras tratadas. Inclui 1 maquiagem premium (adicionais custam R$ 150/pessoa).
3. Authority & Branding (R$ 1500): Para projetar autoridade comercial corporativa. 35 obras comerciais tratadas. Inclui maquiagem premium.
4. Cinematic Wedding (R$ 2500): Cobertura completa de casamento. 8h com equipe dupla. Mínimo de 500 imagens. Não inclui maquiagem de nossa parte (focamos em documentar com excelência cinematográfica).
5. Especial Dia das Mães (R$ 550): 35 obras digitais tratadas, 3 maquiagens premium. Direção criativa focada para conexão genuína das modelos.
6. Pacote Fashion Day (R$ 250): (OFEREÇA APENAS SE O CLIENTE ESCREVER "flash" OU "fashion day"). Um dia exclusivo focado em lojistas e marcas de moda. 30 fotos tratadas em alta resolução. Nós viabilizamos uma modelo profissional de alto nível por um dia inteiro, e dividimos o custo abrindo 5 horários estratégicos. Assim, sua marca garante um catálogo fotográfico de grife, com modelo e estúdio inclusos, por um investimento extremamente inteligente e acessível.
7. Especial Dia dos Namorados (R$ 550): 35 obras digitais com tratamento fine art. Inclui 2 produções de maquiagem premium. Direção criativa íntima e especializada, focada em traduzir a conexão e a cumplicidade do casal em imagens atemporais. Parcelamento em até 10x sem juros.

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

async function sendWhatsAppMessage(to: string, text: string) {
  await fetch(`${EVOLUTION_API_URL}/message/sendText/${INSTANCE_NAME}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: EVOLUTION_API_KEY,
    },
    body: JSON.stringify({ number: to, text }),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const event = body?.event;
    if (event !== "messages.upsert") {
      return NextResponse.json({ status: "ignored_event" }, { status: 200 });
    }

    const message = body?.data;
    const remoteJid: string = message?.key?.remoteJid;
    const fromMe: boolean = message?.key?.fromMe;
    const messageType = message?.message;

    if (fromMe || !remoteJid || !messageType) {
      return NextResponse.json({ status: "ignored" }, { status: 200 });
    }

    const phoneNumber = remoteJid.replace("@s.whatsapp.net", "");

    // Check personal contacts in Firestore
    const personalRef = doc(db, "whatsapp_personal_contacts", phoneNumber);
    const personalSnap = await getDoc(personalRef);
    if (personalSnap.exists()) {
      return NextResponse.json({ status: "personal_contact_ignored" }, { status: 200 });
    }

    // Extract text from incoming message
    const incomingText =
      messageType?.conversation ||
      messageType?.extendedTextMessage?.text ||
      "";

    if (!incomingText.trim()) {
      return NextResponse.json({ status: "no_text" }, { status: 200 });
    }

    // Load or create session in Firestore (24h timeout)
    const sessionRef = doc(db, "whatsapp_sessions", phoneNumber);
    const sessionSnap = await getDoc(sessionRef);

    let history: { role: string; text: string }[] = [];
    const now = Date.now();
    const SESSION_TIMEOUT_MS = 24 * 60 * 60 * 1000;

    if (sessionSnap.exists()) {
      const data = sessionSnap.data();
      const lastActivity = data.updatedAt ? (data.updatedAt.seconds * 1000) : 0;
      if (now - lastActivity < SESSION_TIMEOUT_MS) {
        history = data.history || [];
      }
    }

    // Fetch calendar availability
    const calendarContext = await getUpcomingAvailability();
    const promptSystem = SYSTEM_INSTRUCTION + `\n\n** STATUS DA AGENDA DO WILLIAM EM TEMPO REAL **\n${calendarContext}`;

    let normalizedHistory: { role: string; parts: { text: string }[] }[] = [];
    for (const item of history) {
      if (normalizedHistory.length === 0 && item.role === "model") {
        normalizedHistory.push({ role: "user", parts: [{ text: "Olá" }] });
      }
      const last = normalizedHistory[normalizedHistory.length - 1];
      if (last && last.role === item.role) {
        last.parts[0].text += "\n" + item.text;
      } else {
        normalizedHistory.push({ role: item.role, parts: [{ text: item.text }] });
      }
    }

    let responseText = "";
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-3.6-flash",
        systemInstruction: promptSystem,
      });
      const chat = model.startChat({ history: normalizedHistory });
      const result = await chat.sendMessage(incomingText);
      responseText = result.response.text();
    } catch (err: any) {
      console.warn("[Gemini WhatsApp Fallback] Retrying with alternative model...", err.message);
      try {
        const fallbackModel = genAI.getGenerativeModel({
          model: "gemini-2.0-flash",
          systemInstruction: promptSystem,
        });
        const chat = fallbackModel.startChat({ history: normalizedHistory });
        const result = await chat.sendMessage(incomingText);
        responseText = result.response.text();
      } catch (err2: any) {
        const legacyModel = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          systemInstruction: promptSystem,
        });
        const chat = legacyModel.startChat({ history: normalizedHistory });
        const result = await chat.sendMessage(incomingText);
        responseText = result.response.text();
      }
    }

    const updatedHistory = [
      ...history,
      { role: "user", text: incomingText },
      { role: "model", text: responseText },
    ].slice(-40);

    await setDoc(sessionRef, {
      history: updatedHistory,
      phoneNumber,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    const transferMatch = responseText.match(/\[TRANSFER_WHATSAPP([\s\S]*?)\]/);
    let cleanResponse = responseText.replace(/\[TRANSFER_WHATSAPP[\s\S]*?\]/g, "").trim();

    if (transferMatch) {
      const payload = transferMatch[1].trim();
      await addDoc(collection(db, "leads"), {
        source: "whatsapp",
        phoneNumber,
        payload,
        createdAt: serverTimestamp(),
      });
      sendLeadEmail(payload).catch((e) => console.error("Email error:", e));

      const valueMatch = payload.match(/Valor Total Estimado: R\$\s*([\d.,]+)/);
      let totalValue = 0;
      if (valueMatch) {
        const parsedStr = valueMatch[1].replace(/\./g, "").replace(",", ".");
        totalValue = parseFloat(parsedStr);
      }

      if (totalValue > 0) {
        const signalValue = totalValue * 0.1;
        const signalCents = Math.round(signalValue * 100);

        try {
          const orderNsu = `WDB-LEAD-${Date.now()}`;
          const infinitePayResp = await fetch("https://api.infinitepay.io/invoices/public/checkout/links", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              handle: "william-del-barrio",
              redirect_url: "https://williamdelbarrio.com.br",
              webhook_url: "https://williamdelbarrio.com.br",
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
            })
          });
          const payData = await infinitePayResp.json();
          if (payData && payData.url) {
            cleanResponse += `\n\n🔗 *Link para pagamento do Sinal (10% - R$ ${signalValue.toFixed(2).replace(".", ",")} )*:\n${payData.url}\n\n*_Por favor, não se esqueça de mandar o comprovante aqui pra gente!_*`;
          }
        } catch (paymentErr: any) {
          console.error("InfinitePay error:", paymentErr);
          cleanResponse += `\n\n(Aviso: Tivemos uma instabilidade ao gerar o seu link de pagamento. Por favor, solicite a chave PIX informando ao William).`;
        }
      }
    }

    await sendWhatsAppMessage(remoteJid, cleanResponse);

    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (error: any) {
    console.error("[WhatsApp Webhook] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
