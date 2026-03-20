FROM node:20-alpine

WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

EXPOSE 8000

CMD ["yarn", "start"]
