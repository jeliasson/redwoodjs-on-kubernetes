###########################################################################################
# Builder: node
###########################################################################################

FROM node:14 as builder

# Node
ARG NODE_ENV
ARG RUNTIME_ENV

ENV NODE_ENV=$NODE_ENV
ENV RUNTIME_ENV=$RUNTIME_ENV

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

# Copy dist
COPY --from=builder /app/web/dist /usr/share/nginx/html

# Copy nginx configuration
COPY web/config/nginx/default.conf /etc/nginx/conf.d/default.conf

# List files
RUN ls -lA /usr/share/nginx/html

# Expose RedwoodJS web port
EXPOSE 8910
