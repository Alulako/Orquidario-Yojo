# Usa uma imagem oficial do Node.js
FROM node:22

# Cria o diretório de trabalho dentro do container
WORKDIR /home/node/app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante do código
COPY . .

# Expõe a porta que seu app usa (ajuste se não for 3000)
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]

