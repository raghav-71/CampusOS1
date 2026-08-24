import { NextResponse } from 'next/server';
import { providerChain } from '@/lib/ai/providers/ProviderChain';

export async function GET() {
  try {
    const health = await providerChain.getHealthStatus();
    return NextResponse.json({
      success: true,
      status: health.status,
      provider: health.providerName,
      model: health.model,
      isFree: health.isFree,
      message: health.message,
      latencyMs: health.latencyMs,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        status: 'offline',
        provider: 'Local Campus Intelligence',
        model: 'deterministic-engine',
        isFree: true,
        message: err.message || 'Status check error',
      },
      { status: 200 }
    );
  }
}
