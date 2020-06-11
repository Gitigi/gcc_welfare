FROM node:13.10-alpine3.11 as builder

## Install build toolchain, install node deps and compile native add-ons
RUN apk add --no-cache python make g++
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json package.json
RUN yarn install

COPY . /app
RUN yarn run build;

FROM nginx:alpine
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build/ /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
