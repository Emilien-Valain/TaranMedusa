FROM node:20-alpine

WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

EXPOSE 9000

CMD ["sh", "-c", "npx medusa db:migrate && yarn start"]
