# Stage 1: Dependencies
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# Stage 2: Build
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Next vendors a pre-bundled tar 6.2.1 at next/dist/compiled/tar which rides
# into the standalone output and trips CVE-2026-59873 (fixed in 7.5.19). Only
# lib/download-swc.js uses it, and only during a build, so swap in a patched
# tar rather than dropping it.
#
# download-swc.js loads the bundle through SWC's `_interop_require_default` and
# then reads `.default`. tar v7 marks itself `__esModule` but exports no
# default, so the shim below exposes one pointing back at the API.
RUN mkdir -p /tmp/tar \
 && npm install --no-save --prefix /tmp/tar tar@^7.5.22 \
 && cp -R /tmp/tar/node_modules/. ./.next/standalone/node_modules/ \
 && printf '%s\n' \
      "const tar = require('tar')" \
      "const api = { ...tar }" \
      "api.default = api" \
      "module.exports = api" \
      > ./.next/standalone/node_modules/next/dist/compiled/tar/index.js \
 && rm -rf /tmp/tar \
 && node -e "const t=require('./.next/standalone/node_modules/next/dist/compiled/tar');if(typeof t.default.x!=='function')throw new Error('tar shim did not resolve')"

# Stage 3: Runner - SMALLEST IMAGE
FROM node:22-alpine AS runner

# Pick up Alpine security fixes published since the base tag was last rebuilt
# (openssl CVE-2026-34182 needs 3.5.7-r0).
RUN apk upgrade --no-cache

WORKDIR /app

ENV NODE_ENV=production

# Copy only necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
