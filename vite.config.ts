import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// A relative base makes the build portable: it works at the site root (local
// dev/preview, Vercel/Netlify) and under a subpath like GitHub Pages'
// https://<user>.github.io/uwcoursefinder/ without any extra configuration.
// All asset and data URLs (including import.meta.env.BASE_URL) resolve relative
// to the served page. The app is a single page with no client-side routing.
export default defineConfig({
  base: "./",
  plugins: [react()],
});
