FROM base-deps AS deps

WORKDIR /app
ENV LOG_LEVEL=trace

COPY ./package*.json /app/
COPY ./apps/web/package*.json /app/apps/web/
COPY ./packages/feature-flags/package*.json /app/packages/feature-flags/
COPY ./packages/auth/package*.json /app/packages/auth/
COPY ./packages/messages/package*.json /app/packages/messages/
COPY ./packages/building-blocks-sdk/package*.json /app/packages/building-blocks-sdk/
COPY ./packages/analytics/package*.json /app/packages/analytics/
COPY ./packages/nextjs-logging-wrapper/package*.json /app/packages/nextjs-logging-wrapper/

RUN npm ci

COPY ./apps/web/ /app/apps/web/
COPY --from=design-system-container /app/packages/design-system/ /app/packages/design-system/
COPY ./packages/feature-flags/ /app/packages/feature-flags/
COPY ./packages/auth/ /app/packages/auth/
COPY ./packages/messages/ /app/packages/messages/
COPY ./packages/building-blocks-sdk/ /app/packages/building-blocks-sdk/
COPY ./packages/analytics/ /app/packages/analytics/
COPY ./packages/nextjs-logging-wrapper/ /app/packages/nextjs-logging-wrapper/


FROM deps AS builder

WORKDIR /app

ARG NEXT_PUBLIC_API_ENDPOINT
ARG NEXT_PUBLIC_MATOMO_URL
ARG NEXT_PUBLIC_LIFE_EVENTS_MATOMO_SITE_ID
ARG NEXT_PUBLIC_MATOMO_PROTOCOL
ENV NEXT_PUBLIC_API_ENDPOINT=$NEXT_PUBLIC_API_ENDPOINT
ENV NEXT_PUBLIC_MATOMO_URL=$NEXT_PUBLIC_MATOMO_URL
ENV NEXT_PUBLIC_MATOMO_SITE_ID=$NEXT_PUBLIC_LIFE_EVENTS_MATOMO_SITE_ID
ENV NEXT_PUBLIC_MATOMO_PROTOCOL=$NEXT_PUBLIC_MATOMO_PROTOCOL
RUN npm run build --workspace=packages/nextjs-logging-wrapper && \
    npm run build --workspace=packages/building-blocks-sdk && \
    npm run build --workspace=apps/web

ENV NODE_ENV=production
RUN npm prune --omit=dev

FROM base-deps AS runner

WORKDIR /app

ENV LOG_LEVEL=trace
ENV NODE_ENV=production

COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
# TODO: Filter and remove whatever is not necessary for db-migrate and db-migrate-pg
COPY --from=builder /app/node_modules/ /app/node_modules/
COPY --from=deps /app/apps/web/database.json /app/apps/web/
COPY --from=deps /app/apps/web/migrations /app/apps/web/migrations

EXPOSE 3000

ENV PORT=3000

CMD [ "node", "apps/web/server.js" ]
