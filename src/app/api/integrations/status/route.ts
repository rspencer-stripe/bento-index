import { NextResponse } from 'next/server';
import { integrationRegistry } from '@/lib/integrations';

export async function GET() {
  try {
    // Get status of all integrations for the default user
    const statuses = await integrationRegistry.getAllStatus('default');
    
    return NextResponse.json(statuses);
  } catch (error) {
    console.error('Failed to get integration status:', error);
    return NextResponse.json(
      { error: 'Failed to get integration status' },
      { status: 500 }
    );
  }
}
