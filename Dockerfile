FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source files
COPY . .
COPY .env.example .env

# Expose Vite dev server port
EXPOSE 5173

# Run development server
# CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
CMD ["npm", "run", "host"]
