import { NextResponse } from 'next/server';
import { HardwareDetector } from '@/lib/ai/providers/HardwareDetector';
import { ProviderChain } from '@/lib/ai/providers/ProviderChain';

export async function GET() {
  try {
    const hardware = HardwareDetector.getHardwareInfo();
    const status = await ProviderChain.getStatus();

    return NextResponse.json({
      success: true,
      hardware,
      status,
      ollamaInstructions: {
        command: `ollama run ${hardware.recommendedLocalModel}`,
        downloadUrl: 'https://ollama.com/download',
        recommendedModel: hardware.recommendedLocalModel,
        alternativeModels: hardware.recommendedAlternativeModels,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
