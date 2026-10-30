FROM node:20-slim
WORKDIR /app
COPY package.json bun.lock ./
RUN npm install
COPY . .
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_SUPABASE_STORAGE_MODE
ARG VITE_STORAGE_MODE
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/server.cjs"]
