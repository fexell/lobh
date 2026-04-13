
    export { default } from "../../dist/server/server.js";

    export const config = {
      name: "Remix server handler",
      generator: "@netlify/remix-edge-adapter@3.4.2",
      cache: "manual",
      path: "/*",
      excludedPath: ["/.netlify/*","/.vite/*","/apple-touch-icon.png","/assets/*","/favicon-96x96.png","/favicon.ico","/favicon.svg","/images/*","/site.webmanifest","/web-app-manifest-192x192.png","/web-app-manifest-512x512.png","/_redirects"],
    };