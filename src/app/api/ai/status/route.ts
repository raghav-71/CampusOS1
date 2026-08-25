import { NextResponse } from 'next/server';
import { ProviderChain } from '@/lib/ai/providers/ProviderChain';

export async function GET() {
  try {
    const statusData = await ProviderChain.getStatus();
    return NextResponse.json({
      success: true,
      status: statusData.status,
      provider: statusData.activeProvider,
      model: statusData.activeModel,
      isFree: true,
      hardware: statusData.hardware,
      providers: statusData.providers,
      toolsRegistered: statusData.toolsRegistered,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        status: 'offline',
        provider: 'Campus Intelligence (Local)',
        model: 'deterministic-offline-engine',
        isFree: true,
        message: err.message || 'Status check error',
      },
      { status: 200 }
    );
  }
}
