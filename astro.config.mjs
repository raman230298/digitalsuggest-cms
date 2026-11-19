import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import emdash from 'emdash/astro';
import { d1 } from '@emdash-cms/cloudflare';

export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    imageService: 'cloudflare',
    platformProxy: {
      enabled: true,
    },
  }),
  integrations: [
    react(),
    emdash({
      database: d1({ binding: 'DB' }),
    }),
  ],
  site: 'https://cms.digitalsuggest.com',
  build: {
    format: 'directory',
    inlineStylesheets: 'always',
  },
});
