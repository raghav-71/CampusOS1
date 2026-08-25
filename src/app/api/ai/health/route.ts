import { NextResponse } from 'next/server';
import { ProviderChain } from '@/lib/ai/providers/ProviderChain';
import { aiConfigStore } from '@/lib/ai/config';

export async function GET() {
  try {
    const statusData = await ProviderChain.getStatus();
    const config = aiConfigStore.getConfig();

    return NextResponse.json({
      success: true,
      status: statusData.status,
      provider: statusData.activeProvider,
      model: statusData.activeModel,
      baseUrl: config.baseUrl,
      localAvailable: statusData.providers.ollama.available,
      hardware: statusData.hardware,
      providers: statusData.providers,
      toolsRegistered: statusData.toolsRegistered,
      isFree: true,
      requiresPaidApiKey: false,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        status: 'error',
        message: err.message,
      },
      { status: 500 }
    );
  }
}
