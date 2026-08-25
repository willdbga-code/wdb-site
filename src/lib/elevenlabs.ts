const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || "";
const DEFAULT_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "2GipH0WdOpsTaVrk5RwE";

/**
 * Higieniza o texto para que a ElevenLabs fale de forma 100% natural,
 * removendo links, emojis, colchetes de sistema e formatações markdown.
 */
export function sanitizeTextForSpeech(rawText: string): string {
  if (!rawText) return "";

  let text = rawText;

  // 1. Remove blocos internos de transferência / sistema
  text = text.replace(/\[TRANSFER_WHATSAPP[\s\S]*?\]/gi, "");

  // 2. Remove frases que apontam para URLs e links http(s)
  text = text.replace(/(?:no nosso site|pelo site|no link|acesse o link|acesse em|pelo link|no endereço):?\s*https?:\/\/\S+/gi, "");
  text = text.replace(/https?:\/\/\S+/gi, "");

  // 3. Remove caracteres de markdown (*, _, ~, #, >, `, colchetes)
  text = text.replace(/[*_~#>`\[\]]/g, "");

  // 4. Normaliza termos de moedas para pronúncia natural em português
  // Ex: "R$ 2.500" -> "2.500 reais", "R$ 450" -> "450 reais", "R$ 550,00" -> "550 reais"
  text = text.replace(/R\$\s*([\d\.,]+)/gi, (_match, p1) => {
    const cleanNum = p1.replace(/\.$/, "").replace(/,00$/, "").trim();
    return `${cleanNum} reais`;
  });

  // 5. Remove emojis e símbolos visuais
  text = text.replace(/[\u{1F300}-\u{1FAFF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}]/gu, "");

  // 6. Normaliza quebras de linha e pontuações
  text = text
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join(". ");

  text = text.replace(/:\s*(\.|$)/g, ".");
  text = text.replace(/\s+/g, " ");
  text = text.replace(/\.{2,}/g, ".");
  text = text.replace(/\s+\./g, ".");
  text = text.trim();

  return text;
}

export interface VoiceGenerationResult {
  base64: string;
  dataUri: string;
  buffer: Buffer;
  sizeBytes: number;
}

/**
 * Gera áudio ultra-realista com a voz do William no ElevenLabs
 * Retorna o áudio em formato Base64 compatível com a Evolution API.
 */
export async function generateVoiceNote(
  text: string,
  customVoiceId?: string
): Promise<VoiceGenerationResult | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY || ELEVENLABS_API_KEY;
  const voiceId = customVoiceId || process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE_ID;

  if (!apiKey) {
    console.warn("[ElevenLabs] ELEVENLABS_API_KEY não configurada.");
    return null;
  }

  const cleanText = sanitizeTextForSpeech(text);
  if (!cleanText || cleanText.length < 2) {
    console.warn("[ElevenLabs] Texto vazio após higienização.");
    return null;
  }

  try {
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text: cleanText,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.85,
          style: 0.05,
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error(`[ElevenLabs Error] HTTP ${response.status}:`, errBody);
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");
    const dataUri = `data:audio/mp3;base64,${base64}`;

    return {
      base64,
      dataUri,
      buffer,
      sizeBytes: buffer.length,
    };
  } catch (error: any) {
    console.error("[ElevenLabs] Falha ao gerar áudio:", error.message || error);
    return null;
  }
}
