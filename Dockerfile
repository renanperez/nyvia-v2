# Fase de build
FROM node:20-alpine AS builder
WORKDIR /app

# Instala dependências
COPY package*.json ./
RUN npm install

# Copia o resto do código
COPY . .

# Build de produção do Next
RUN npm run build

# Fase de runtime
FROM node:20-alpine
WORKDIR /app

# Copia tudo que foi gerado no build
COPY --from=builder /app ./

ENV NODE_ENV=production
EXPOSE 3000

# Inicia o servidor em modo produção
CMD ["npm", "run", "start"]
