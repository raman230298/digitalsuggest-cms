import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import node from '@astrojs/node';
import react from '@astrojs/react';
import emdash, { local } from 'emdash/astro';
import { d1 } from '@emdash-cms/cloudflare';
import { sqlite } from 'emdash/db';

const isCloudflare = Boolean(process.env.CF_PAGES || process.env.CLOUDFLARE);

export default defineConfig({
  output: 'server',
  adapter: isCloudflare
    ? cloudflare({
        imageService: 'cloudflare',
        platformProxy: {
          enabled: true,
        },
      })
    : node({ mode: 'standalone' }),
  integrations: [
    react(),
    emdash({
      database: isCloudflare
        ? d1({ binding: 'DB' })
        : sqlite({ url: 'file:./data.db' }),
      storage: local({
        directory: './uploads',
        baseUrl: '/_emdash/api/media/file',
      }),
    }),
  ],
  site: 'https://cms.digitalsuggest.com',
  build: {
    format: 'directory',
    inlineStylesheets: 'always',
  },
});
