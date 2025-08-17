FROM node:20-bookworm-slim
WORKDIR /app

# 1) deps do app (que estão em nextfront/)
COPY nextfront/package*.json ./
RUN npm install

# 2) código do app (inclui src/, public/, prisma/ etc. dentro de nextfront/)
COPY nextfront/. .

# 3) prisma client (o schema está em /app/prisma)
RUN npx prisma generate

EXPOSE 3000
CMD ["npm","run","start","--","-p","3000"]
