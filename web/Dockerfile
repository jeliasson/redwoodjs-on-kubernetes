###########################################################################################
# Builder: node
###########################################################################################

FROM node:14 as builder

# Node
ARG NODE_ENV
ARG RUNTIME_ENV

ENV NODE_ENV=$NODE_ENV
ENV RUNTIME_ENV=$RUNTIME_ENV

# Application specific (Azure Active Directory authentication)
ARG AZURE_ACTIVE_DIRECTORY_CLIENT_ID
ARG AZURE_ACTIVE_DIRECTORY_AUTHORITY
ARG AZURE_ACTIVE_DIRECTORY_REDIRECT_URI
ARG AZURE_ACTIVE_DIRECTORY_LOGOUT_REDIRECT_URI

ENV AZURE_ACTIVE_DIRECTORY_CLIENT_ID=$AZURE_ACTIVE_DIRECTORY_CLIENT_ID
ENV AZURE_ACTIVE_DIRECTORY_AUTHORITY=$AZURE_ACTIVE_DIRECTORY_AUTHORITY
ENV AZURE_ACTIVE_DIRECTORY_REDIRECT_URI=$AZURE_ACTIVE_DIRECTORY_REDIRECT_URI
ENV AZURE_ACTIVE_DIRECTORY_LOGOUT_REDIRECT_URI=$AZURE_ACTIVE_DIRECTORY_LOGOUT_REDIRECT_URI

# Timezone
ENV TZ=Europe/Stockholm

# Set Timezone
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Set workdir
WORKDIR /app

#COPY api .
COPY web web
COPY .nvmrc .
COPY babel.config.js .
COPY graphql.config.js .
COPY package.json .
COPY redwood.toml .
COPY yarn.lock .

# Install dependencies
RUN yarn install --frozen-lockfile

# Build
RUN yarn rw build web

# Clean up
RUN rm -rf ./web/src

###########################################################################################
# Runner: Nginx
###########################################################################################

FROM nginx as runner

# Timezone
ENV TZ=Europe/Stockholm

# Set Timezone
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Copy dist
COPY --from=builder /app/web/dist /usr/share/nginx/html

# Copy nginx configuration
COPY web/config/nginx/default.conf /etc/nginx/conf.d/default.conf

# List files
RUN ls -lA /usr/share/nginx/html

# Expose RedwoodJS web port
EXPOSE 8910
