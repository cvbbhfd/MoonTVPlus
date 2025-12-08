/* eslint-disable no-console */

import { NextRequest, NextResponse } from 'next/server';

import { getConfig } from '@/lib/config';
import { CURRENT_VERSION } from '@/lib/version'

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  console.log('server-config called: ', request.url);

  const storageType = process.env.NEXT_PUBLIC_STORAGE_TYPE || 'localstorage';

  // 如果使用 localStorage，返回默认配置
  if (storageType === 'localstorage') {
    return NextResponse.json({
      SiteName: process.env.NEXT_PUBLIC_SITE_NAME || 'MoonTV',
      StorageType: 'localstorage',
      Version: CURRENT_VERSION,
      // localStorage 模式下，返回默认观影室配置
      // 可以通过环境变量控制是否启用
      WatchRoom: {
        enabled: process.env.WATCH_ROOM_ENABLED === 'true',
        serverType: 'internal',
        externalServerUrl: undefined,
        externalServerAuth: undefined,
      },
    });
  }

  // 非 localStorage 模式，从数据库读取配置
  const config = await getConfig();
  const result = {
    SiteName: config.SiteConfig.SiteName,
    StorageType: storageType,
    Version: CURRENT_VERSION,
    // 添加观影室配置（供所有用户访问）
    WatchRoom: {
      enabled: config.WatchRoomConfig?.enabled ?? false,
      serverType: config.WatchRoomConfig?.serverType ?? 'internal',
      externalServerUrl: config.WatchRoomConfig?.externalServerUrl,
      externalServerAuth: config.WatchRoomConfig?.externalServerAuth,
    },
  };
  return NextResponse.json(result);
}
