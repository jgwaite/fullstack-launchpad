ARG VITE_API_BASE_URL=http://localhost:8000/api

FROM node:20-alpine AS development-dependencies-env
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
COPY package*.json /app/
WORKDIR /app
RUN npm ci
COPY . /app

FROM node:20-alpine AS production-dependencies-env
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
COPY ./package.json package-lock.json /app/
WORKDIR /app
RUN npm ci --omit=dev

FROM node:20-alpine AS build-env
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN npm run build

FROM node:20-alpine
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
COPY ./package.json package-lock.json /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/dist /app/dist
WORKDIR /app
# Serve the built assets; dev compose overrides this with the Vite dev server for HMR.
CMD ["sh", "-c", "npx serve -s dist -l ${FRONTEND_TEST_PORT:-4173}"]
