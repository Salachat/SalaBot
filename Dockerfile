FROM mhart/alpine-node:16 AS builder

WORKDIR /app

RUN apk update && \
    apk upgrade && \
    apk add \
    make \
    g++ \
    python2

COPY yarn.lock package.json ./

RUN sed -i 's/"prepare": "husky install .github\/husky"/"prepare": ""/' ./package.json

RUN yarn --production=true --frozen-lockfile --link-duplicates

FROM mhart/alpine-node:16

WORKDIR /app

ENV NODE_ENV="production"

RUN apk update && \
    apk upgrade && \
    apk add dumb-init

RUN addgroup -g 1000 node && \
    adduser -u 1000 -G node -s /bin/sh -D node && \
    mkdir /app/data && \
    chown -R node:node /app

COPY --chown=node:node --from=builder /app .
COPY --chown=node:node src/ src/

USER node:node

ENTRYPOINT ["/usr/bin/dumb-init", "--"]

CMD [ "yarn", "start" ]
