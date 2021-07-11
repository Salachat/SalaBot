FROM mhart/alpine-node:16

WORKDIR /usr/app

ENV NODE_ENV="production"

RUN apk update && \
    apk upgrade && \
    apk add \
    make \
    g++ \
    python2 \
    dumb-init

COPY yarn.lock .
COPY package.json .
COPY src/ src/

RUN sed -i 's/"prepare": "husky install .github\/husky"/"prepare": ""/' ./package.json
RUN yarn install --production=true --frozen-lockfile --link-duplicates && \
    yarn cache clean

ENTRYPOINT ["/usr/bin/dumb-init", "--"]

CMD [ "yarn", "start" ]
