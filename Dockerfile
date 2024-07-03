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

FROM node:20-alpine 

WORKDIR /app

COPY --from=react /app/build /app/build

RUN npm install http-server -g

RUN mv build dashboard

CMD ["http-server"]
