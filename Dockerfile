# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package.json and install deps
COPY package*.json ./
RUN npm install

# Copy all source files and build
COPY . .
RUN npm run build

# Stage 2: Serve
FROM node:20-alpine
WORKDIR /app

# Install serve globally
RUN npm install -g serve

# Copy built files from previous stage
COPY --from=builder /app/dist ./dist

# Expose Cloud Run default port
EXPOSE 8080

# Start the app on the port Cloud Run sets
CMD ["sh", "-c", "serve -s dist -l ${PORT:-8080}"]
