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

COPY --from=builder /app .
COPY src/ src/

ENTRYPOINT ["/usr/bin/dumb-init", "--"]

CMD [ "yarn", "start" ]
