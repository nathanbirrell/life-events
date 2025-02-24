FROM base-deps AS deps

WORKDIR /app
ENV LOG_LEVEL=trace

COPY ./package*.json /app/
COPY ./apps/payments/package*.json /app/apps/payments/
COPY ./packages/analytics/package*.json /app/packages/analytics/
COPY ./packages/feature-flags/package*.json /app/packages/feature-flags/
COPY ./packages/auth/package*.json /app/packages/auth/
COPY ./packages/building-blocks-sdk/package*.json /app/packages/building-blocks-sdk/
COPY ./packages/shared-components/package*.json /app/packages/shared-components/
COPY ./packages/nextjs-logging-wrapper/package*.json /app/packages/nextjs-logging-wrapper/

RUN npm ci

COPY ./apps/payments/ /app/apps/payments/
COPY --from=design-system-container /app/packages/design-system/ /app/packages/design-system/
COPY ./packages/analytics/ /app/packages/analytics/
COPY ./packages/feature-flags/ /app/packages/feature-flags/
COPY ./packages/auth/ /app/packages/auth/
COPY ./packages/building-blocks-sdk/ /app/packages/building-blocks-sdk/
COPY ./packages/shared-components/ /app/packages/shared-components/
COPY ./packages/nextjs-logging-wrapper/ /app/packages/nextjs-logging-wrapper/

FROM deps AS builder
WORKDIR /app

ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_HOST_URL
ARG NEXT_PUBLIC_MESSAGING_SERVICE_ENTRY_POINT
ARG NEXT_PUBLIC_PAYMENTS_SERVICE_ENTRY_POINT
ARG NEXT_PUBLIC_LIFE_EVENTS_SERVICE_ENTRY_POINT
ARG NEXT_PUBLIC_BUILDING_BLOCKS_LANDING_PAGE
ARG NEXT_PUBLIC_FORMS_URL
ARG NEXT_PUBLIC_MATOMO_URL
ARG NEXT_PUBLIC_PAYMENTS_MATOMO_SITE_ID
ARG NEXT_PUBLIC_MATOMO_PROTOCOL

ENV NODE_ENV=production
ENV LOG_LEVEL=trace
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_HOST_URL=$NEXT_PUBLIC_HOST_URL
ENV NEXT_PUBLIC_MESSAGING_SERVICE_ENTRY_POINT=$NEXT_PUBLIC_MESSAGING_SERVICE_ENTRY_POINT
ENV NEXT_PUBLIC_PAYMENTS_SERVICE_ENTRY_POINT=$NEXT_PUBLIC_PAYMENTS_SERVICE_ENTRY_POINT
ENV NEXT_PUBLIC_LIFE_EVENTS_SERVICE_ENTRY_POINT=$NEXT_PUBLIC_LIFE_EVENTS_SERVICE_ENTRY_POINT
ENV NEXT_PUBLIC_BUILDING_BLOCKS_LANDING_PAGE=$NEXT_PUBLIC_BUILDING_BLOCKS_LANDING_PAGE
ENV NEXT_PUBLIC_FORMS_URL=$NEXT_PUBLIC_FORMS_URL
ENV NEXT_PUBLIC_MATOMO_URL=$NEXT_PUBLIC_MATOMO_URL
ENV NEXT_PUBLIC_MATOMO_SITE_ID=$NEXT_PUBLIC_PAYMENTS_MATOMO_SITE_ID
ENV NEXT_PUBLIC_MATOMO_PROTOCOL=$NEXT_PUBLIC_MATOMO_PROTOCOL

RUN npm run build --workspace=packages/nextjs-logging-wrapper && \
    npm run build --workspace=packages/building-blocks-sdk && \
    npm run build --workspace=apps/payments

FROM base-deps AS assembler
WORKDIR /app

ENV NODE_ENV=production
ENV LOG_LEVEL=trace

COPY --from=builder /app/apps/payments/.next/standalone ./
COPY --from=builder /app/apps/payments/.next/static ./apps/payments/.next/static
# TODO: Filter and remove whatever is not necessary for db-migrate and db-migrate-pg
COPY --from=deps /app/node_modules/ /app/node_modules/
COPY --from=deps /app/apps/payments/database.json /app/apps/payments/
COPY --from=deps /app/apps/payments/migrations /app/apps/payments/migrations

RUN npm prune --omit=dev

FROM base-deps AS runner
WORKDIR /app

ENV LOG_LEVEL=trace
ENV NODE_ENV=production

COPY --from=assembler /app /app

EXPOSE 3001

ENV PORT=3001

CMD [ "node", "apps/payments/server.js" ]
