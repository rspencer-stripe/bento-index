import { NextRequest, NextResponse } from 'next/server';
import { integrationRegistry } from '@/lib/integrations';
import { liveItems } from '@/lib/liveData';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const mode = body.mode || 'live';
    const sources = body.sources || ['all'];
    
    if (mode === 'demo') {
      // Return demo data
      return NextResponse.json({
        success: true,
        mode: 'demo',
        items: liveItems,
        syncedAt: new Date().toISOString(),
      });
    }
    
    // Live mode - fetch from integrations
    const allItems = [];
    const results: Record<string, { count: number; error?: string }> = {};
    
    const integrations = integrationRegistry.getAll();
    
    for (const integration of integrations) {
      // Skip if not in requested sources
      if (!sources.includes('all') && !sources.includes(integration.id)) {
        continue;
      }
      
      try {
        const configured = await integration.isConfigured();
        if (!configured) {
          results[integration.id] = { count: 0, error: 'Not configured' };
          continue;
        }
        
        if ('fetch' in integration && 'transform' in integration) {
          const result = await integration.fetch('default', { limit: 50 });
          const items = result.items.map(raw => integration.transform(raw, 'default'));
          allItems.push(...items);
          results[integration.id] = { count: items.length };
        }
      } catch (err) {
        results[integration.id] = { 
          count: 0, 
          error: err instanceof Error ? err.message : 'Unknown error' 
        };
      }
    }
    
    return NextResponse.json({
      success: true,
      mode: 'live',
      items: allItems,
      results,
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Sync failed:', error);
    return NextResponse.json(
      { success: false, error: 'Sync failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return sync status
  try {
    const statuses = await integrationRegistry.getAllStatus('default');
    
    return NextResponse.json({
      integrations: statuses,
      lastSync: null, // Would come from database
    });
  } catch (error) {
    console.error('Failed to get sync status:', error);
    return NextResponse.json(
      { error: 'Failed to get sync status' },
      { status: 500 }
    );
  }
}
