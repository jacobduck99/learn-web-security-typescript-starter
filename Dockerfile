FROM node:24-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:24-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src/ ./src
COPY public/ ./public

RUN mkdir -p data/uploads data/bulk-tax-documents \
 && chown -R node:node data

COPY --chown=node:node data/fixtures/mystery-shack-tax-exemption.pdf ./data/fixtures/mystery-shack-tax-exemption.pdf

USER node
CMD ["node", "src/main.ts"]
