# Imagem Node.js 22 (suporta as dependências modernas)
FROM node:22-alpine

WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar o código-fonte
COPY . .

# Expor porta
EXPOSE 5173

# Comando para iniciar com Vite em modo desenvolvimento
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
