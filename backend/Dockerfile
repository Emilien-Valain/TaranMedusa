FROM node:20-alpine

WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./
RUN corepack enable && yarn install --frozen-lockfile

COPY . .
RUN NODE_OPTIONS=--max-old-space-size=2048 yarn build
RUN find .medusa -name "index.html" 2>/dev/null || echo "WARNING: No index.html found in .medusa"

EXPOSE 9000

CMD ["sh", "-c", "npx medusa db:migrate && yarn start"]
