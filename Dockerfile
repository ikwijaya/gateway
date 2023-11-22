FROM alpine:latest

# SET LABEL INFORMATION FOR DOCKER
# docker image inspect --format='' <myimage>
LABEL maintainer="ababil-team"
LABEL appname="api"
LABEL version="1.0.0"
LABEL description="API for management"

# SET ENV
ENV STAGEDIR="/stage"
ENV APPDIR="/app-service"
ENV SERVICE="app-service"

# ARG
ARG NODE_OPTIONS=--openssl-legacy-provider

# INSTALL FEATURE FOR CHECKING CONNECTION
RUN apk --no-cache add curl
RUN apk add --update nodejs npm

# SET WORK DIRECTORY
RUN mkdir -p ${STAGEDIR}
WORKDIR ${STAGEDIR}
COPY . ${STAGEDIR}

# PREPARE INSTALL AND BUILDING
RUN rm -rf .git
RUN npm install -g knex
RUN npm install
RUN node -v
RUN knex --version
RUN mkdir -p uploads
RUN npm run buildProd

# PREPARE RUN SERVICE
RUN rm -Rf src/

# EXPOSE FOR ACCESS FROM ANY
EXPOSE 9000
CMD ["npm","run","start"]

# HEALTH CHECK
# HEALTHCHECK --interval=5m --timeout=10s --start-period=5s --retries=3 \
#   CMD curl -f http://localhost:9000/ || exit 1 