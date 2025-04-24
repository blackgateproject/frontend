# Build stage
FROM node:22-alpine AS build

WORKDIR /app

# Set build arguments
ARG VITE_CONNECTOR_URL
ARG VITE_GRAFANA_URL
ARG VITE_GRAFANA_DASHBOARD_AUTH_TIMES
ARG VITE_GRAFANA_DASHBOARD_ADMIN_DASH_STATS
# ENV VITE_CONNECTOR_URL=$VITE_CONNECTOR_URL
# ENV VITE_GRAFANA_URL=$VITE_GRAFANA_URL
# ENV VITE_GRAFANA_DASHBOARD_AUTH_TIMES=$VITE_GRAFANA_DASHBOARD_AUTH_TIMES
# ENV VITE_GRAFANA_DASHBOARD_ADMIN_DASH_STATS=$VITE_GRAFANA_DASHBOARD_ADMIN_DASH_STATS

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy all files
COPY . .

# Modify the .env file for production - dynamically grab all VITE_ environment variables
COPY .env.example .env
# RUN echo env
# RUN env | grep "^VITE_" | while read -r line; do \
#     var_name=$(echo $line | cut -d= -f1); \
#     var_value=$(echo $line | cut -d= -f2-); \
#     echo "Updating $var_name in .env file"; \
#     sed -i "s|$var_name=.*|$var_name=$var_value|g" .env; \
#     done && \
#     echo "Environment configuration complete"

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine
# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration for SPA routinginx configuration for SPA routing
# Copy nginx configuration for SPA routing

# Expose port
EXPOSE 80
# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
