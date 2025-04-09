FROM node:20

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Expose the port the server runs on
EXPOSE 5000

# Command to run the server
CMD ["npm", "run", "dev"]