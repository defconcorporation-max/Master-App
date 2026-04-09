import { NextResponse } from 'next/server';

export async function GET() {
  const envKeys = Object.keys(process.env);
  const debugInfo = envKeys.map(key => {
    const val = process.env[key] || '';
    return {
      key,
      exists: !!val,
      length: val.length,
      prefix: val.substring(0, 4) + '...',
      isTrimmable: val !== val.trim()
    };
  }).filter(info => 
    info.key.includes('SUPABASE') || 
    info.key.includes('MONGODB') || 
    info.key.includes('TURSO') ||
    info.key.includes('GEMINI') ||
    info.key.includes('MASTER') ||
    info.key.includes('DEFCON') ||
    info.key.includes('DRS') ||
    info.key.includes('ANTIGRAVITY')
  );

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    env: debugInfo,
    nodeVersion: process.version,
    platform: process.platform
  });
}
