import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export — produces an `out/` directory of HTML/JS/CSS/font
  // assets that any HTTP server (we use nginx in deploy/) can serve.
  // The deployment workflow is:
  //   npm run build
  //   rsync -avz --delete out/ root@<VPS_IP>:/opt/sakina/out/
  //   ssh root@<VPS_IP> 'cd /opt/sakina && docker compose restart nginx'
  output: "export",

  // /quran/1/index.html (folder-style) instead of /quran/1.html so the
  // nginx config can stay minimal: `try_files $uri $uri/index.html =404`.
  trailingSlash: true,

  // next/image is unused, but if anyone adds it later they'll need this
  // to opt out of the optimisation pipeline (which isn't available in
  // a static export).
  images: { unoptimized: true },
};

export default nextConfig;
