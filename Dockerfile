# Use an official Node runtime as the base image
FROM node:20 as react

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the app dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

RUN npm run build

FROM alpine:edge

RUN apk update \
    && apk add lighttpd \
    && rm -rf /var/cache/apk/*

COPY --from=react /app/build /var/www/localhost/htdocs
COPY --from=react /app/build /var/www/localhost/htdocs/dashboard

CMD ["lighttpd", "-D", "-f", "/etc/lighttpd/lighttpd.conf"]
