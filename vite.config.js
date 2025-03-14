import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      workbox: {
        maximumFileSizeToCacheInBytes: 5500000, // Set to 4MB or any higher value
      },
      manifest: {
        name: "Girls On Campus",
        short_name: "Girls On Campus",
        display: "standalone",
        theme_color: "#C95F8F",
        background_color: "#C95F8F",
        description: "PWA install  handler package for Girls On Campus",
        icons: [
          {
            src: "https://res.cloudinary.com/dtkeyccga/image/upload/v1737988159/Untitled_design_59_u8rhji.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "https://res.cloudinary.com/dtkeyccga/image/upload/v1737988159/Untitled_design_59_u8rhji.png",
            sizes: "256x256",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "https://res.cloudinary.com/dtkeyccga/image/upload/v1737988159/Untitled_design_59_u8rhji.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
        ],
      },
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
      },
    }),
  ],
});
