import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        short_name: "NestSphere",
        name: "NestSphere ERP",
        description: "Enterprise Housing Society Management Platform",
        icons: [
          {
            src: "./pwa-72x72.png",
            sizes: "72x72",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "./pwa-96x96.png",
            sizes: "96x96",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "./pwa-128x128.png",
            sizes: "128x128",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "./pwa-144x144.png",
            sizes: "144x144",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "./pwa-152x152.png",
            sizes: "152x152",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "./pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "./pwa-384x384.png",
            sizes: "384x384",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "./pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ],
        start_url: "./",
        scope: "./",
        background_color: "#0f172a",
        theme_color: "#0f172a",
        display: "standalone",
        orientation: "portrait",
        categories: ["business", "productivity", "utilities"],
        shortcuts: [
          {
            name: "Notice Board",
            short_name: "Notices",
            description: "View society notices and circulars",
            url: "./#/resident/notices",
            icons: [{ src: "./pwa-192x192.png", sizes: "192x192" }]
          },
          {
            name: "Helpdesk Complaints",
            short_name: "Complaints",
            description: "Raise or track ticket status",
            url: "./#/resident/complaints",
            icons: [{ src: "./pwa-192x192.png", sizes: "192x192" }]
          },
          {
            name: "Visitor Passes",
            short_name: "Visitors",
            description: "Pre-approve guest entry passes",
            url: "./#/resident/visitors",
            icons: [{ src: "./pwa-192x192.png", sizes: "192x192" }]
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /\/api\/.*/,
            handler: 'NetworkOnly',
            method: 'POST',
            options: {
              backgroundSync: {
                name: 'nestsphere-offline-queue',
                options: {
                  maxRetentionTime: 24 * 60
                }
              }
            }
          },
          {
            urlPattern: /\/api\/.*/,
            handler: 'NetworkOnly',
            method: 'PUT',
            options: {
              backgroundSync: {
                name: 'nestsphere-offline-queue',
                options: {
                  maxRetentionTime: 24 * 60
                }
              }
            }
          },
          {
            urlPattern: /\/api\/.*/,
            handler: 'NetworkOnly',
            method: 'PATCH',
            options: {
              backgroundSync: {
                name: 'nestsphere-offline-queue',
                options: {
                  maxRetentionTime: 24 * 60
                }
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1600,
  },
});
