import { NextResponse } from 'next/server';
import { providerChain } from '@/lib/ai/provider/providerChain';

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
      apiKeyConfigured: providerChain.isAnyProviderConfigured(),
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        status: 'offline',
        provider: 'Campus Intelligence (Local)',
        model: 'deterministic-campus-engine',
        isFree: true,
        message: err.message || 'Status check error',
        apiKeyConfigured: false,
      },
      { status: 200 }
    );
  }
}
