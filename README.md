# Self-hosting RedwoodJS on Kubernetes

Hi all 👋

After seeing some posts about self-hosting on [Heroku](https://community.redwoodjs.com/t/self-host-on-heroku/1765) and [Render](https://community.redwoodjs.com/t/using-render-com-instead-of-netlify-and-heroku/728/4) I got inspired to finally take a swing at writing about **Self-hosting RedwoodJS on Kubernetes**. If you are a serverfull person that likes to get your hands dirty with Docker, Kubernetes (with some neat tools around this) and GitHub Actions - this read might be just for you. Head's up tho; It's quite a lot of config. 🤓

Also; While this is a working implementation that currently supports a production application (maybe a future #show-tell), it leaves some decisions to make on your part. That being said, let me know if you want to elaborate on some topics and I'm definitely open to make this implementation better.

### Table of Contents

- [Docker](#Docker): Build, Migrate and Seed
- [Kubernetes](#Kubernetes): Tools and objects
- [GitHub](#GitHub): GitHub Actions and GitHub Container Registry
- [Result](#Result): The screenshot
- [Conclution](#Conclution): The after thoughts

## Docker

We will use Docker to containerize our Redwood application, and in this implementation we will have two images; one for `api` and one for `web`. These Dockerfiles are pretty straight-forward with some comments to instructions.

### `api/Dockerfile`

```dockerfile
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
COPY babel.config.js .
COPY graphql.config.js .
COPY package.json .
COPY redwood.toml .
COPY yarn.lock .

# Install dependencies
RUN yarn install --frozen-lockfile

# Build
RUN yarn rw build api

# Set database baseline
# We only need to do this once per database
# RUN yarn rw prisma migrate resolve --applied 20210311161829_baseline0

# Migrate database
RUN yarn rw prisma migrate deploy

# Seed database
RUN yarn rw prisma db seed

# Clean up
RUN rm -rf ./api/src

# Debugging
RUN ls -lA ./api/dist

# Set api as workdirectory
WORKDIR /app/api

# Expose RedwoodJS api port
EXPOSE 8911

# Entrypoint to @redwoodjs/api-server binary
ENTRYPOINT [ "yarn", "serve", "api", "--port", "8911", "--rootPath", "/api" ]
```

Before we move over to the web side of things, did you notice how we where using `yarn serve api` in entrypoint along with a `--rootPath` argument? Without going into much depth in this post, head over to [Add rootPath to api-server](https://github.com/redwoodjs/redwood/issues/1693) to read about the motivation behind this. For now, make sure that your `redwoodjs.toml`'s `[web].apiProxyPath` directive is set to `/api`, e.g. like so;

```
[web]
  port = 8910
  apiProxyPath = "/api"
```

### `web/Dockerfile`

```dockerfile
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
```


As we are running nginx as our web server, lets also bring in a nginx config. It's nothing fancy and mostly adding some caching of static assets. We also add header `X-Awesomeness` because we can, and not because we need to.

### `web/config/nginx/default.conf`

```
server {
    listen 8910 default_server;
    root /usr/share/nginx/html;

    # Add global header
    add_header X-Awesomeness 9000;

    # 1 hour cache for css and js
    location ~* \.(?:css|js)$ {
        expires 1h;
        add_header Pragma public;
        add_header Cache-Control "public";
        access_log off;
    }

    # 7 days cache for image assets
    location ~* \.(?:ico|gif|jpe?g|png)$ {
        expires 7d;
        add_header Pragma public;
        add_header Cache-Control "public";
        access_log off;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## Kubernetes

Now for the fun part (at least for some): Kubernetes.

I suggest using [Kustomize](https://kubernetes.io/docs/tasks/manage-kubernetes-objects/kustomization/) to build and generate your Kubernetes manifest file. However, in the spirit of keeping this post simpler I will just document some of the generated Kubernetes objects. That being said, feel free to DM me for the relevant Kustomize files I use. Furthermore, I have removed the resource limiting for brevity and is using [Kubernetes Nginx Controller](https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/) for the Ingress.

### Secrets

As our Docker images contains senstive information and likely to be hosted in a private Container Registry, we need to create a [Docker Registry config secret](https://kubernetes.io/docs/concepts/configuration/secret/#docker-config-secrets) that Kubernetes can use to pull down the imags. To export the secret and store it in a persistent file, run `kubectl get secret <my-container-registry-secret> -o yaml`. This should result in a secret like below.

```yaml
apiVersion: v1
data:
  .dockerconfigjson: |
    [obfuscated]
kind: Secret
metadata:
  name: my-container-registry-secret
type: kubernetes.io/dockerconfigjson
```

### Deployments

In these examples we are using a images from `ghcr.io` ([GitHub Container Registry](https://docs.github.com/en/packages/guides/about-github-container-registry)), defining the usual suspects (ports, match labels, replicas etc) and we are passing in relevant environment variables, such as `DATABASE_URL` to the api and such.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 2
  selector:
    matchLabels:
      platform: api
  template:
    metadata:
      labels:
        platform: api
    spec:
      containers:
        - env:
            - name: NODE_ENV
              value: development
            - name: RUNTIME_ENV
              value: dev
            - name: DATABASE_URL
              value: mysql://username:password@dbserver:3306/dbname
          image: ghcr.io/<your org>/redwoodjs-api-main:latest
          name: api
          ports:
            - containerPort: 8911
      imagePullSecrets:
        - name: my-container-registry-secret
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
spec:
  replicas: 2
  selector:
    matchLabels:
      platform: web
  template:
    metadata:
      labels:
        platform: web
    spec:
      containers:
        - env:
            - name: NODE_ENV
              value: production
            - name: RUNTIME_ENV
              value: production
          image: ghcr.io/<your org>/redwoodjs-web-main:22784ba
          name: web
          ports:
            - containerPort: 8910
      imagePullSecrets:
        - name: my-container-registry-secret
```

### Services

We use `NodePort` to expose our pods as a service.

```yaml
apiVersion: v1
kind: Service
metadata:
  labels:
    platform: api
  name: api
spec:
  ports:
    - port: 8911
  selector:
    platform: api
  type: NodePort
---
apiVersion: v1
kind: Service
metadata:
  labels:
    platform: web
  name: web
spec:
  ports:
    - port: 8910
  selector:
    platform: web
  type: NodePort
```

### Ingress

This ingress will route `/` to the web pods, and `/api` to the api pods and make sure we issue a SSL/TLS certificate.

```yaml
apiVersion: networking.k8s.io/v1beta1
kind: Ingress
metadata:
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt
    kubernetes.io/ingress.class: nginx
  name: app
spec:
  rules:
    - host: jeliasson-redwoodjs-on-kubernetes.51.105.102.164.nip.io
      http:
        paths:
          - backend:
              serviceName: web
              servicePort: 8910
            path: /
          - backend:
              serviceName: api
              servicePort: 8911
            path: /api
  tls:
    - hosts:
        - jeliasson-redwoodjs-on-kubernetes.51.105.102.164.nip.io
      secretName: domain-tld-tls
```

## GitHub

So we got all this fancy Docker and Kubernetes stuff defined. Cool. How do we automate and deploy all this? Personally I give GitHub my money any day. Ironically, and a large thanks to Microsoft acquiring GitHub and the compute power that come with that, all the stuff we need is free. Regardless, here is this posts meme to illustrate my point.

![image|625x500, 50%](https://raw.githubusercontent.com/jeliasson/redwoodjs-on-kubernetes/dev/docs/assets/fry.png)

Anyway;

We will use [GitHub Container Registry](https://docs.github.com/en/packages/guides/about-github-container-registry) to store our Docker images, and we use [GitHub Actions](https://github.com/features/actions) to build- push- and deploy our application to Kubernetes. Before we jump into the GitHub Actions part of things, I have a confession to make; I also use [ArgoCD](https://argoproj.github.io/argo-cd/) since about a year back. If you are running Kubernetes and not running ArgoCD (or something equivalent) I'm not sure what you are doing 😅 Just kidding! It's great tho. Point being, we will use a ArgoCD deployment in below examples. I will briefly explain what you could do as a alternative.

### GitHub Container Registry

GitHub offers Container Registry pretty much free of charge. You just need to opt-in for [Preview](https://docs.github.com/en/packages/guides/enabling-improved-container-support) and the images are published to your GitHub account/organisation, not to a specific repository.

### GitHub Actions

Unfortunately, I have not had the time to look into having the same GitHub Action Workflow for handling different envioronments. So for the the example below, we are using one workflow for the `dev` environment/branch. I'll come back and update this post if I get a prettier way of doing it.

**What the workflows essentially will do;**

1. Set some environment variables
2. Checkout source code
3. Login to Container Registry (GitHub Container Registry)
4. Build and push our image (which also migrate and seed the database)
5. Checkout a deployment repository (see [ArgoCD best practices](https://argoproj.github.io/argo-cd/user-guide/best_practices/))
6. Use Kustomize to update our placeholder image to the image just built
7. Generate a latest.yaml file (debugging and could be used for manual deploy)
8. Commit changes back to the deployment repository

**What happens after (in ArgoCD) that is not covered in this post;**

1. ArgoCD will pickup the repository changes
2. Use Kustomize to build our Kubernetes manifests
3. Sync these manifests with a target Kubernetes cluster

**What you would want to do if you are not running ArgoCD or something similar;**

1. After step 4 (build and push our image) you want to use e.g. [a GitHub Action for Kubernetes](https://github.com/marketplace/actions/deploy-to-kubernetes-cluster) to;
2. Login to the Kubernetes cluster using a `kubeconfig`
3. Deploy the latest.yaml file generated in step 7.

I have explained these steps further in comments below.

### `.github/workflows/redwoodjs-app-dev.yaml`

```yaml
name: "redwoodjs-app"

on:
  push:
    branches:
      - main
      - dev

env:
  # Build
  NODE_ENV: "development"
  RUNTIME_ENV: "dev"

  # API
  API_DATABASE_URL: ${{ secrets.__DEV_DATABASE_URL }}

  # Container Registry
  CONTAINER_REGISTRY_HOSTNAME: ghcr.io
  CONTAINER_REGISTRY_USERNAME: jeliasson
  CONTAINER_REGISTRY_PASSWORD: ${{ secrets.__JELIASSON_GITHUB_ACCESS_TOKEN }}
  CONTAINER_REGISTRY_REPOSITORY: jeliasson
  CONTAINER_REGISTRY_IMAGE_PREFIX: redwoodjs-app

  # Repository
  GIT_DEPLOY_REPOSITORY_NAME: jeliasson/redwoodjs-on-kubernetes
  GIT_DEPLOY_REPOSITORY_BRANCH: main
  GIT_DEPLOY_REPOSITORY_AUTHOR_NAME: Johan Eliasson
  GIT_DEPLOY_REPOSITORY_AUTHOR_EMAIL: jeliasson@users.noreply.github.com
  GIT_DEPLOY_REPOSITORY_AUTHOR_TOKEN: ${{ secrets.__JELIASSON_GITHUB_ACCESS_TOKEN }}

jobs:
  #
  # Build
  #
  build:
    name: Build
    runs-on: ubuntu-20.04
    timeout-minutes: 10
    strategy:
      fail-fast: true
      matrix:
        platform: [api, web]
        include:
          - platform: api
            DATABASE_URL: __DEV_DATABASE_URL
          - platform: web

    steps:

      # Checkout source code
      - name: Checkout source code
        uses: actions/checkout@v2

      # Setup Docker using buildx-action
      - name: Setup Docker
        uses: docker/setup-buildx-action@v1

      # Login to Docker Container Registry
      - name: Docker login
        uses: docker/login-action@v1
        with:
          registry: ${{ env.CONTAINER_REGISTRY_HOSTNAME }}
          username: ${{ env.CONTAINER_REGISTRY_USERNAME }}
          password: ${{ env.CONTAINER_REGISTRY_PASSWORD }}

      # Build Docker image with a :latest and :<git sha> tag
      - name: Docker build
        uses: docker/build-push-action@v2
        with:
          push: true
          context: .
          file: ./${{ matrix.platform }}/Dockerfile
          build-args: |
            NODE_ENV=${{ env.NODE_ENV }}
            RUNTIME_ENV=${{ env.RUNTIME_ENV }}
            DATABASE_URL=${{ secrets[matrix.DATABASE_URL] }}
          tags: |
            ${{ env.CONTAINER_REGISTRY_HOSTNAME }}/${{ env.CONTAINER_REGISTRY_REPOSITORY }}/${{ env.CONTAINER_REGISTRY_IMAGE_PREFIX }}-${{ matrix.platform }}-${{ env.RUNTIME_ENV }}:latest
            ${{ env.CONTAINER_REGISTRY_HOSTNAME }}/${{ env.CONTAINER_REGISTRY_REPOSITORY }}/${{ env.CONTAINER_REGISTRY_IMAGE_PREFIX }}-${{ matrix.platform }}-${{ env.RUNTIME_ENV }}:${{ github.sha }}

  #
  # Configure
  #
  configure:
    name: Configure
    needs: [build]
    runs-on: ubuntu-20.04
    timeout-minutes: 10
    strategy:
      max-parallel: 1
      fail-fast: true
      matrix:
        platform: [api, web]
        include:
          - platform: api
          - platform: web

    steps:
      # Checkout deployment repository
      - name: Checkout source code
        uses: actions/checkout@v2
        with:
          submodules: recursive
          repository: ${{ env.GIT_DEPLOY_REPOSITORY_NAME }}
          ref: ${{ env.GIT_DEPLOY_REPOSITORY_BRANCH }}
          token: ${{ env.GIT_DEPLOY_REPOSITORY_AUTHOR_TOKEN }}

      # Login to Docker Container Registry
      - name: Docker login
        uses: docker/login-action@v1
        with:
          registry: ${{ env.CONTAINER_REGISTRY_HOSTNAME }}
          username: ${{ env.CONTAINER_REGISTRY_USERNAME }}
          password: ${{ env.CONTAINER_REGISTRY_PASSWORD }}

      # Save these Docker credentials to the deployment repository
      # It will be used in Kustomize to generate a Kubernetes secret for the container registry
      - name: Save Container Registry credentials
        run: |
          cat $HOME/.docker/config.json |                                         \
            jq 'del(.credsStore) | del(.HttpHeaders)' >                           \
            kubernetes/overlays/${RUNTIME_ENV}/secrets/.dockerconfigjson

      # Setup Kustomize
      - name: Setup Kustomize
        uses: imranismail/setup-kustomize@v1

      # Use Kustomize to update the image placeholder in the Kustomize manifest file
      - name: Set Docker image
        run: |
          cd kubernetes/overlays/${RUNTIME_ENV}
          kustomize edit set image placeholder/${{ matrix.platform }}=${CONTAINER_REGISTRY_HOSTNAME}/${CONTAINER_REGISTRY_REPOSITORY}/${CONTAINER_REGISTRY_IMAGE_PREFIX}-${{ matrix.platform }}-${{ env.RUNTIME_ENV }}:${GITHUB_SHA}
          cat kustomization.yaml

      # For debugging purposes, create a latest.yaml file
      - name: Generate Kubernetes latest manifest
        run: |
          cd kubernetes/overlays/${RUNTIME_ENV}
          kustomize build -o latest.yaml
          printf '%s\n%s\n' "# Generated with Kustomize at $(date)" "$(cat latest.yaml)" > latest.yaml
          cat latest.yaml

      # Commit our changes (e.g. the updated image tag generated by Kustomize)
      - name: Commit and push changes
        uses: EndBug/add-and-commit@v6
        with:
          author_name: ${{ env.GIT_DEPLOY_REPOSITORY_AUTHOR_NAME }}
          author_email: ${{ env.GIT_DEPLOY_REPOSITORY_AUTHOR_EMAIL }}
          branch: ${{ env.GIT_DEPLOY_REPOSITORY_BRANCH }}
          message: "[ci] Deployed ${{ github.repository }}@${{ github.sha }}: ${{ github.event.head_commit.message }}"
          pull_strategy: "--no-ff"
          push: true
          token: ${{ env.GIT_DEPLOY_REPOSITORY_AUTHOR_TOKEN }}
```

## Result

## GitHub Actions
...

## ArgoCD
This is the web interface of Argo CD with a overview of the application we just deployed.
![ArgoCD deployment](docs/assets/example-argocd-deployment.png "ArgoCD deployment")

## Conclusion

Well, this writing became much longer than I thought it would be. If you are still reading this, thank you for bearing with me. Surely this is not a easy underataking for someone not working with DevOps, and there are some pieces here that is missing. Wth did ArgoCD do? Deployment repository? A operations account for doing the Git pushes?

#### What can be done better

- Make GitHub action more compact and handle multiple environments. Right now, it's one per environment.
- We are migrating and seeding our database after build, before image push and deployment to Kubernetes. This is not ideal, as the new database schema will be up before the new api is deployed.

#### Going forward from here

- ArgoCD
