FROM base-deps AS deps

WORKDIR /app

COPY ./package*.json /app/
COPY ./apps/messaging-api/ /app/apps/messaging-api/
COPY ./packages/building-blocks-sdk/ /app/packages/building-blocks-sdk/
COPY ./packages/api-auth/ /app/packages/api-auth/

RUN npm ci 

FROM deps AS builder

RUN npm run build --workspace=packages/api-auth && \
    npm run build --workspace=packages/building-blocks-sdk && \
    npm run build --workspace=apps/messaging-api

FROM base-deps AS assembler
WORKDIR /app

ENV NODE_ENV=production
ENV LOG_LEVEL=trace

COPY --from=builder /app/package*.json /app/
COPY --from=builder /app/node_modules /app/node_modules

COPY --from=builder /app/apps/messaging-api/dist /app/apps/messaging-api/dist
COPY --from=builder /app/apps/messaging-api/node_modules /app/apps/messaging-api/node_modules
COPY --from=builder /app/apps/messaging-api/package*.json /app/apps/messaging-api/

COPY --from=builder /app/packages/api-auth/dist /app/packages/api-auth/dist
COPY --from=builder /app/packages/api-auth/node_modules /app/packages/api-auth/node_modules
COPY --from=builder /app/packages/api-auth/package.json /app/packages/api-auth/

COPY --from=builder /app/packages/building-blocks-sdk/dist /app/packages/building-blocks-sdk/dist
COPY --from=builder /app/packages/building-blocks-sdk/node_modules /app/packages/building-blocks-sdk/node_modules
COPY --from=builder /app/packages/building-blocks-sdk/package.json /app/packages/building-blocks-sdk/

RUN npm prune --omit=dev

FROM base-deps AS runner

ENV NODE_ENV=production
ENV LOG_LEVEL=trace

COPY --from=assembler /app /app

EXPOSE 8002

WORKDIR /app/apps/messaging-api

CMD [ "node", "dist/", "index.js" ]
