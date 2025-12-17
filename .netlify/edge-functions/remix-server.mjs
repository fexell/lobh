
    export { default } from "../../dist/server/server.js";

    export const config = {
      name: "Remix server handler",
      generator: "@netlify/remix-edge-adapter@3.4.2",
      cache: "manual",
      path: "/*",
      excludedPath: ["/.netlify/*","/.vite/*","/assets/*","/favicon.svg","/images/*"],
    };