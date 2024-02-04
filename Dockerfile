ARG BIGCOMMERCE_STORE_HASH
ARG BIGCOMMERCE_ACCESS_TOKEN
ARG BIGCOMMERCE_CUSTOMER_IMPERSONATION_TOKEN
ARG BIGCOMMERCE_CHANNEL_ID

FROM node:18-alpine AS base

RUN corepack enable 
COPY . /app
WORKDIR /app

ENV USE_DOCKER=true

ENV NEXTJS_RUNTIME=nodejs


ENV BIGCOMMERCE_STORE_HASH ${_BIGCOMMERCE_STORE_HASH}
ENV BIGCOMMERCE_ACCESS_TOKEN ${_BIGCOMMERCE_ACCESS_TOKEN}
ENV BIGCOMMERCE_CUSTOMER_IMPERSONATION_TOKEN ${_BIGCOMMERCE_CUSTOMER_IMPERSONATION_TOKEN}
ENV BIGCOMMERCE_CHANNEL_ID ${_BIGCOMMERCE_CHANNEL_ID}

# Echo the environment variable to the build log
RUN echo "Value of BIGCOMMERCE_STORE_HASH is: ${BIGCOMMERCE_STORE_HASH}"

# echo BIGCOMMERCE_STORE_HASH env variable
RUN echo "BIGCOMMERCE_STORE_HASH=$BIGCOMMERCE_STORE_HASH" > .env.local

FROM base as deps 
RUN pnpm install --prod --frozen-lockfile

FROM base AS build 
RUN touch .env.local
RUN pnpm install --frozen-lockfile
RUN pnpm run build 

FROM base 

# # COPY --from=deps /app/node_modules ./node_modules
# COPY --from=build /app/public ./public

# RUN mkdir ./.next

# COPY --from=build /app/apps/core/.next/standalone/apps/core ./
# COPY --from=build /app/apps/core/.next/static ./.next/static

COPY --from=build /app/apps/core/next.config.js .
COPY --from=build /app/apps/core/package.json .
 
# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=build /app/apps/core/.next/standalone ./
COPY --from=build /app/apps/core/.next/static ./apps/core/.next/static

EXPOSE 3000

ENV PORT 3000
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"
ENV NODE_ENV=production

# # server.js is created by next build from the standalone output
# # https://nextjs.org/docs/pages/api-reference/next-config-js/output
# CMD ["node", "server.js"]

CMD node apps/core/server.js