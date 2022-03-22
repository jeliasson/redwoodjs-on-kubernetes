###########################################################################################
# Runner: node
###########################################################################################

FROM node:14 as runner

# Node
ARG NODE_ENV
ARG RUNTIME_ENV

ENV NODE_ENV=$NODE_ENV
ENV RUNTIME_ENV=$RUNTIME_ENV

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

# Set workdir
WORKDIR /app

COPY api api
COPY .nvmrc .
COPY graphql.config.js .
COPY package.json .
COPY redwood.toml .
COPY yarn.lock .

# Install dependencies
RUN yarn install --frozen-lockfile

# Build
RUN yarn rw build api

# Migrate database
# This has been commented out in this example post
# RUN yarn rw prisma migrate deploy

# Seed database
# This has been commented out in this example post
# RUN yarn rw prisma db seed

# Clean up
RUN rm -rf ./api/src

# Set api as workdirectory
WORKDIR /app/api

# Expose RedwoodJS api port
EXPOSE 8911

# Entrypoint to @redwoodjs/api-server binary
ENTRYPOINT [ "yarn", "rw", "serve", "api", "--port", "8911", "--rootPath", "/api" ]
