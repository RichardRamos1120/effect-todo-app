# Use Node.js Alpine for a lightweight image
FROM docker.io/node:lts-alpine

# Set working directory
WORKDIR /app

# Install dependencies
RUN apk add --no-cache bash git curl

# Install NX globally
RUN npm install -g nx

# Copy package.json and package-lock.json first
COPY package*.json ./

# Ensure correct esbuild installation inside the container
RUN rm -rf node_modules package-lock.json && npm install

# Copy source code
COPY . .

# Expose API port
EXPOSE 3000

# Start NX project and make it accessible outside the container
CMD ["npx", "nx", "serve", "effect-todo-app", "--host", "0.0.0.0"]
