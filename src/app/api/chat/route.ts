import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { sendLeadEmail } from '@/lib/mailer';
import { getUpcomingAvailability } from '@/lib/calendar';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_INSTRUCTION = `Você é o "WDB Copilot", o assistente virtual de inteligência do renomado estúdio de fotografia fine art de "William Del Barrio".
Seu objetivo principal é apresentar os serviços de forma premium, cordial, tirar dúvidas e coletar as intenções de agendamento do cliente.
Seja conciso em suas respostas, porém muito educado, luxuoso e focado na conversão. Responda diretamente e sem rodeios as dúvidas.

** PACOTES DE EXPERIÊNCIA **
1. Retrato Autoral (R$ 450): 1h em estúdio, 15 obras digitais fine art. Inclui maquiagem premium. Foco em perfil pessoal/redes.
2. Family Legacy (R$ 800): Para núcleo familiar e maternidade. 30 obras tratadas. Inclui 1 maquiagem premium (adicionais custam R$ 150/pessoa).
3. Authority & Branding (R$ 1500): Para projetar autoridade comercial corporativa. 20 obras comerciais. Inclui maquiagem premium.
4. Cinematic Wedding (R$ 3500): Cobertura de casamento. 8h com equipe dupla. Mínimo de 500 imagens. Não inclui maquiagem de nossa parte (focamos em documentar).

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

** PORTFÓLIO VISUAL **
- Sempre que houver oportunidade (ao explicar pacotes ou se o cliente perguntar), convide o cliente a ver o trabalho real usando um link formatado assim: [Acessar Portfólio](/portfolio)
- Exemplo: "Você pode conferir o nosso requinte visual no [Portfólio de Obras](/portfolio)."

** POLÍTICA FINANCEIRA E CONDIÇÕES **
- O cliente pode parcelar TODO o investimento (pacotes + extras) em até 10x no cartão de crédito.
- Aceitamos pagamentos à vista por PIX.
- O cliente pode comprar mais "fotos extras" avulsas, se amar os resultados no nosso painel de seleção, após o ensaio. Pode oferecer com segurança.

** ESTRUTURA PARA AGENDAMENTO **
- Sempre que a conversa se encaminhar para fechamento, pergunte naturalmente qual o pacote, se quer extras e qual a data (mês/dia) ideal para conferirmos a agenda.
- Depois de fechado/escolhido o orçamento, avise que vai transferir pro WhatsApp do William para agendar.
- EXTREMAMENTE IMPORTANTE: Para que o William receba os dados do cliente, na sua última resposta você DEVE escrever EXATAMENTE este bloco no final da sua mensagem (substituindo os dados e calculando o valor final):
[TRANSFER_WHATSAPP
Pacote: (inserir nome)
Extras: (inserir extras ou nenhum)
Data Prevista: (inserir data)
Valor Total Estimado: R$ (valor somando pacote + extras)
]
`;

export async function POST(req: NextRequest) {
  try {
    const { history, message } = await req.json();
    
    // Puxa a agenda em tempo real de forma invisível
    const calendarContext = await getUpcomingAvailability();

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_INSTRUCTION + `\n\n** STATUS DA SUA AGENDA (WILLIAM) EM TEMPO REAL **\n${calendarContext}`,
    });

    const rawHistory = history.map((msg: any) => ({
      role: msg.sender === 'bot' ? 'model' : 'user',
      text: msg.text || "ok",
    }));

    let normalizedHistory: {role: string, parts: {text: string}[]}[] = [];
    
    for (const item of rawHistory) {
       if (normalizedHistory.length === 0) {
          if (item.role === 'model') {
             normalizedHistory.push({ role: 'user', parts: [{ text: 'Olá' }] });
          }
          normalizedHistory.push({ role: item.role, parts: [{ text: item.text }] });
       } else {
          let last = normalizedHistory[normalizedHistory.length - 1];
          if (last.role === item.role) {
             last.parts[0].text += "\n" + item.text;
          } else {
             normalizedHistory.push({ role: item.role, parts: [{ text: item.text }] });
          }
       }
    }

    const chat = model.startChat({
      history: normalizedHistory,
    });

    const result = await chat.sendMessage(message);
    const responseText = result.response.text();

    const transferMatch = responseText.match(/\[TRANSFER_WHATSAPP([\s\S]*?)\]/);
    if (transferMatch) {
       const payload = transferMatch[1].trim();
       // Fire and forget email notification
       sendLeadEmail(payload).catch(console.error);
    }

    return NextResponse.json({ response: responseText });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { response: "Erro do Gemini: " + error.message }, 
      { status: 500 }
    );
  }
}
