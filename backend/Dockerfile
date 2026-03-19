FROM node:22-slim

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Compilação do TypeScript para JS
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "dev"]
