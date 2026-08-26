import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getUpcomingAvailability } from "@/lib/calendar";
import { sendLeadEmail } from "@/lib/mailer";
import { generateVoiceNote } from "@/lib/elevenlabs";

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || "http://187.127.16.220:8080";
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || "wdb-copilot-secret-2026";
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
3. Authority & Branding (R$ 1500): Para projetar autoridade comercial corporativa. 35 obras comerciais tratadas. Inclui maquiagem premium + Desenvolvimento de Landing Page profissional de alta conversão para posicionar sua marca/autoridade no digital.
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
  try {
    await fetch(`${EVOLUTION_API_URL}/message/sendText/${INSTANCE_NAME}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: EVOLUTION_API_KEY,
      },
      body: JSON.stringify({ number: to, text }),
    });
  } catch (err: any) {
    console.error("[Evolution API] Error sending text message:", err.message);
  }
}

async function sendWhatsAppVoiceNote(to: string, audioBase64: string): Promise<boolean> {
  try {
    const rawBase64 = audioBase64.replace(/^data:audio\/[^;]+;base64,/, "");

    const resp = await fetch(`${EVOLUTION_API_URL}/message/sendWhatsAppAudio/${INSTANCE_NAME}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: EVOLUTION_API_KEY,
      },
      body: JSON.stringify({
        number: to,
        audio: rawBase64,
        options: {
          delay: 1200,
          presence: "recording",
          encoding: true,
        },
      }),
    });
    const ok = resp.ok;
    const data = await resp.json();
    console.log(`[Evolution API] Voice note response (${resp.status}):`, data);
    return ok;
  } catch (err: any) {
    console.error("[Evolution API] Error sending voice note:", err.message);
    return false;
  }
}

async function downloadMediaBase64(messageKey: any, directBase64?: string): Promise<{ base64: string; mimetype: string } | null> {
  if (directBase64) {
    return {
      base64: directBase64.replace(/^data:audio\/[^;]+;base64,/, ""),
      mimetype: "audio/ogg",
    };
  }

  try {
    const response = await fetch(`${EVOLUTION_API_URL}/chat/getBase64FromMediaMessage/${INSTANCE_NAME}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: EVOLUTION_API_KEY,
      },
      body: JSON.stringify({ message: { key: messageKey } }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    if (data?.base64) {
      return {
        base64: data.base64.replace(/^data:audio\/[^;]+;base64,/, ""),
        mimetype: data.mimetype || "audio/ogg",
      };
    }
    return null;
  } catch (error: any) {
    console.error("[Evolution API] Error downloading media base64:", error.message);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const rawEvent = body?.event || "";
    const event = rawEvent.toLowerCase().replace(/_/g, ".");
    if (event !== "messages.upsert") {
      return NextResponse.json({ status: "ignored_event" }, { status: 200 });
    }

    const message = body?.data;
    const fromMe: boolean = message?.key?.fromMe;
    const rawJid: string = message?.key?.remoteJid || "";
    const altJid: string = message?.key?.remoteJidAlt || "";
    const messageType = message?.message;

    if (fromMe || !rawJid || !messageType) {
      return NextResponse.json({ status: "ignored" }, { status: 200 });
    }

    // Determine target reply JID and clean phone number candidates
    const replyJid = (altJid && altJid.endsWith("@s.whatsapp.net")) ? altJid : rawJid;
    const phoneCandidates = [
      rawJid.replace(/@.*$/, "").replace(/[^0-9]/g, ""),
      altJid.replace(/@.*$/, "").replace(/[^0-9]/g, "")
    ].filter(Boolean);

    // Check personal contacts in Firestore (fail-safe)
    try {
      for (const phone of phoneCandidates) {
        const personalRef = doc(db, "whatsapp_personal_contacts", phone);
        const personalSnap = await getDoc(personalRef);
        if (personalSnap.exists()) {
          console.log(`[WhatsApp Webhook] Personal contact detected (${phone}) -> Silencing bot.`);
          return NextResponse.json({ status: "personal_contact_ignored" }, { status: 200 });
        }
      }
    } catch (personalErr: any) {
      console.warn("[WhatsApp Webhook] Could not check personal contacts:", personalErr.message);
    }

    const phoneNumber = phoneCandidates[0] || rawJid.replace(/@.*$/, "");

    // Check if incoming is an audio message
    const isAudio = !!messageType?.audioMessage || !!messageType?.ptvMessage;
    let incomingText = "";
    let incomingWasAudio = false;

    if (isAudio) {
      const mediaData = await downloadMediaBase64(
        message?.key,
        messageType?.audioMessage?.base64 || message?.base64
      );
      if (mediaData && mediaData.base64) {
        const cleanBase64 = mediaData.base64;
        const sttModels = ["gemini-3.7-flash", "gemini-3.6-flash", "gemini-3.5-flash", "gemini-flash-latest"];
        let transcribed = false;

        for (const mName of sttModels) {
          try {
            const sttModel = genAI.getGenerativeModel({ model: mName });
            const sttResp = await sttModel.generateContent([
              {
                inlineData: {
                  data: cleanBase64,
                  mimeType: mediaData.mimetype || "audio/ogg",
                },
              },
              {
                text: "Transcreva com precisão o que a pessoa está dizendo neste áudio em português brasileiro. Retorne apenas o texto transcrito, sem aspas, explicações ou notas adicionais.",
              },
            ]);
            incomingText = sttResp.response.text().trim();
            incomingWasAudio = true;
            transcribed = true;
            console.log(`[Audio STT (${mName})] Transcrito com sucesso de ${phoneNumber}: "${incomingText}"`);
            break;
          } catch (sttErr: any) {
            console.warn(`[STT Fallback] Falha com ${mName}:`, sttErr.message);
          }
        }

        if (!transcribed || !incomingText) {
          incomingText = "Olá, te enviei uma mensagem de áudio.";
        }
      } else {
        incomingText = "Olá!";
      }
    } else {
      // Extract text from incoming message
      incomingText =
        messageType?.conversation ||
        messageType?.extendedTextMessage?.text ||
        "";
    }

    if (!incomingText.trim()) {
      return NextResponse.json({ status: "no_text" }, { status: 200 });
    }

    const pushName = message?.pushName || "";

    // ── PALÁCIO DE MEMÓRIA DO CLIENTE (Persistência Contínua no Firestore) ──
    let history: { role: string; text: string }[] = [];
    let memory: {
      clientName?: string;
      preferredPackage?: string;
      preferredDate?: string;
      budgetNotes?: string;
      summary?: string;
      totalInteractions?: number;
    } = {};

    const sessionRef = doc(db, "whatsapp_sessions", phoneNumber);
    try {
      const sessionSnap = await getDoc(sessionRef);
      if (sessionSnap.exists()) {
        const data = sessionSnap.data();
        history = data.history || [];
        memory = data.memory || {};
      }
    } catch (sessionErr: any) {
      console.warn("[WhatsApp Webhook] Could not load session from Firestore:", sessionErr.message);
    }

    // Atualiza nome do cliente a partir do pushName se ainda não salvo
    if (pushName && !memory.clientName) {
      memory.clientName = pushName;
    }

    // ── Construção do Bloco de Memória Injetado no Gemini ──
    let memoryBlock = `\n\n** PALÁCIO DE MEMÓRIA DO CLIENTE (${phoneNumber}) **\n`;
    if (memory.clientName) memoryBlock += `- Nome do Cliente: ${memory.clientName}\n`;
    if (memory.preferredPackage) memoryBlock += `- Pacote de Interesse Prévio: ${memory.preferredPackage}\n`;
    if (memory.preferredDate) memoryBlock += `- Datas Mencionadas Anteriormente: ${memory.preferredDate}\n`;
    if (memory.summary) memoryBlock += `- Resumo da Conversa: ${memory.summary}\n`;

    if (history.length > 0) {
      memoryBlock += `- DIRETRIZ DE CONTINUIDADE: Você possui memória viva desta conversa (${history.length} mensagens no histórico). NUNCA cumprimente como se fosse a primeira vez ("Seja bem-vindo ao estúdio..."). Chame o cliente pelo nome com carinho (${memory.clientName || 'Cliente'}) e continue o assunto diretamente de onde pararam com elegância e naturalidade.\n`;
    } else {
      memoryBlock += `- DIRETRIZ: Primeiro contato deste cliente. Seja caloroso, acolhedor e apresente os serviços com o requinte do estúdio.\n`;
    }

    // Fetch calendar availability
    const calendarContext = await getUpcomingAvailability();
    const promptSystem = SYSTEM_INSTRUCTION + memoryBlock + `\n\n** STATUS DA AGENDA DO WILLIAM EM TEMPO REAL **\n${calendarContext}`;

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
    const activeModels = ["gemini-3.7-flash", "gemini-3.6-flash", "gemini-3.5-flash", "gemini-flash-latest"];
    
    for (const mName of activeModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: mName,
          systemInstruction: promptSystem,
        });
        const chat = model.startChat({ history: normalizedHistory });
        const result = await chat.sendMessage(incomingText);
        responseText = result.response.text();
        if (responseText) break;
      } catch (err: any) {
        console.warn(`[Gemini WhatsApp Fallback] Error with ${mName}:`, err.message);
      }
    }

    if (!responseText) {
      responseText = memory.clientName 
        ? `Oi ${memory.clientName}! ✨ Recebi sua mensagem, estou aqui para te ajudar. Me conta, como posso te auxiliar?`
        : "Olá! Seja muito bem-vindo ao Estúdio William Del Barrio. ✨ Em que posso te ajudar hoje?";
    }

    // ── Atualização Inteligente do Palácio de Memória ──
    const combinedText = `${incomingText} ${responseText}`.toLowerCase();
    if (combinedText.includes("retrato autoral")) memory.preferredPackage = "Retrato Autoral (R$ 450)";
    else if (combinedText.includes("family legacy") || combinedText.includes("família") || combinedText.includes("gestante")) memory.preferredPackage = "Family Legacy (R$ 800)";
    else if (combinedText.includes("authority") || combinedText.includes("branding") || combinedText.includes("corporativo")) memory.preferredPackage = "Authority & Branding (R$ 1.500)";
    else if (combinedText.includes("wedding") || combinedText.includes("casamento")) memory.preferredPackage = "Cinematic Wedding (R$ 2.500)";
    else if (combinedText.includes("namorados") || combinedText.includes("casal")) memory.preferredPackage = "Especial Dia dos Namorados (R$ 550)";
    else if (combinedText.includes("mães") || combinedText.includes("dia das mães")) memory.preferredPackage = "Especial Dia das Mães (R$ 550)";
    else if (combinedText.includes("fashion day") || combinedText.includes("flash")) memory.preferredPackage = "Pacote Fashion Day (R$ 250)";

    memory.totalInteractions = (memory.totalInteractions || 0) + 1;
    memory.summary = `Último assunto: "${incomingText.substring(0, 100)}"`;

    const updatedHistory = [
      ...history,
      { role: "user", text: incomingWasAudio ? `[Áudio]: ${incomingText}` : incomingText },
      { role: "model", text: responseText },
    ].slice(-80); // Mantém histórico profundo de até 80 mensagens

    // Salva o Palácio de Memória atualizado no Firestore (permanente)
    try {
      await setDoc(
        sessionRef,
        {
          history: updatedHistory,
          memory,
          phoneNumber,
          pushName: pushName || memory.clientName || "",
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (saveErr: any) {
      console.warn("[WhatsApp Webhook] Could not save session to Firestore:", saveErr.message);
    }

    const transferMatch = responseText.match(/\[TRANSFER_WHATSAPP([\s\S]*?)\]/);
    let cleanResponse = responseText.replace(/\[TRANSFER_WHATSAPP[\s\S]*?\]/g, "").trim();
    let paymentLinkGenerated = "";

    if (transferMatch) {
      const payload = transferMatch[1].trim();
      try {
        await addDoc(collection(db, "leads"), {
          source: "whatsapp",
          phoneNumber,
          payload,
          createdAt: serverTimestamp(),
        });
      } catch (leadDbErr: any) {
        console.warn("[WhatsApp Webhook] Could not save lead to Firestore:", leadDbErr.message);
      }
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
                  description: "Sinal de Reserva - Estúdio William Del Barrio (10%)",
                },
              ],
              customer: {
                name: "Cliente WDB WhatsApp",
                phone_number: `+${phoneNumber}`,
              },
            }),
          });
          const payData = await infinitePayResp.json();
          if (payData && payData.url) {
            paymentLinkGenerated = payData.url;
            cleanResponse += `\n\n🔗 *Link para pagamento do Sinal (10% - R$ ${signalValue.toFixed(2).replace(".", ",")} )*:\n${payData.url}\n\n*_Por favor, não se esqueça de mandar o comprovante aqui pra gente!_*`;
          }
        } catch (paymentErr: any) {
          console.error("InfinitePay error:", paymentErr);
          cleanResponse += `\n\n(Aviso: Tivemos uma instabilidade ao gerar o seu link de pagamento. Por favor, solicite a chave PIX informando ao William).`;
        }
      }
    }

    // ── Configuração de Envio de Áudio Dinâmica (Firestore + Fallback .env) ──
    let isAudioEnabled = process.env.WHATSAPP_AUDIO_ENABLED !== "false";
    let audioMode = process.env.WHATSAPP_AUDIO_MODE || "mirror"; // "mirror" | "always" | "disabled"
    let configuredVoiceId = process.env.ELEVENLABS_VOICE_ID || "bIHbv24MWmeRgasZH58o";

    try {
      const siteConfigSnap = await getDoc(doc(db, "settings", "site_config"));
      if (siteConfigSnap.exists()) {
        const cfg = siteConfigSnap.data();
        if (cfg.whatsappAudioEnabled !== undefined) isAudioEnabled = !!cfg.whatsappAudioEnabled;
        if (cfg.whatsappAudioMode) audioMode = cfg.whatsappAudioMode;
        if (cfg.elevenLabsVoiceId) configuredVoiceId = cfg.elevenLabsVoiceId;
      }
    } catch (cfgErr) {
      console.warn("[WhatsApp Route] Erro ao ler site_config do Firestore:", cfgErr);
    }

    const shouldSendAudio =
      isAudioEnabled &&
      audioMode !== "disabled" &&
      (incomingWasAudio || audioMode === "always" || (audioMode === "smart" && (incomingWasAudio || !!transferMatch)));

    let audioSentSuccessfully = false;

    if (shouldSendAudio) {
      console.log(`[ElevenLabs] Gerando áudio de resposta para ${phoneNumber} (Voz: ${configuredVoiceId})...`);
      const voiceResult = await generateVoiceNote(cleanResponse, configuredVoiceId);

      if (voiceResult && voiceResult.base64) {
        const sent = await sendWhatsAppVoiceNote(replyJid, voiceResult.base64);
        if (sent) {
          audioSentSuccessfully = true;
          console.log(`[ElevenLabs] Nota de voz enviada com sucesso para ${replyJid}!`);

          // Se houver links importantes (ex: InfinitePay ou painel), enviamos uma mensagem de apoio com os links clicáveis
          if (paymentLinkGenerated) {
            const companionMsg = `🔗 *Link para pagamento do Sinal:*\n${paymentLinkGenerated}\n\n_Assim que pagar, envie o comprovante aqui para garantirmos a data na agenda! ✨_`;
            await sendWhatsAppMessage(replyJid, companionMsg);
          }
        } else {
          console.warn("[Evolution API] Falha ao despachar áudio, fazendo fallback para texto.");
        }
      } else {
        console.warn("[ElevenLabs] Falha ao gerar áudio, fazendo fallback para texto.");
      }
    }

    // Se o áudio não foi enviado (por configuração, modo texto ou fallback de erro), envia mensagem de texto padrão
    if (!audioSentSuccessfully) {
      await sendWhatsAppMessage(replyJid, cleanResponse);
    }

    return NextResponse.json({ status: "success", audioSent: audioSentSuccessfully }, { status: 200 });
  } catch (error: any) {
    console.error("[WhatsApp Webhook] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
