FROM node:18

WORKDIR /app

# Install netcat for database connectivity checks
RUN apt-get update && apt-get install -y netcat-openbsd && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm i

# Copy source code
COPY . .

# Make the startup script executable
RUN chmod +x ./startup.sh

# Expose port
EXPOSE 3000

# Start the application
CMD ["bash", "./startup.sh"]