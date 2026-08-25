import { NextRequest, NextResponse } from "next/server";
import { generateVoiceNote } from "@/lib/elevenlabs";

export async function POST(req: NextRequest) {
  try {
    const { text, voiceId } = await req.json();

    const sampleText = text || "Olá! Aqui é o William Del Barrio. Este é um teste da minha voz clonada integrada com inteligência artificial para o nosso estúdio.";
    const result = await generateVoiceNote(sampleText, voiceId);

    if (!result) {
      return NextResponse.json({ error: "Falha ao sintetizar áudio com ElevenLabs." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      dataUri: result.dataUri,
      sizeBytes: result.sizeBytes,
    });
  } catch (err: any) {
    console.error("[Voice Test API Error]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
