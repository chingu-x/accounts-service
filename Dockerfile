FROM node:10-slim

# Create app directory
WORKDIR /app

# Set the environment
EXPOSE 3000

# Install app dependencies
ARG NPM_TOKEN
COPY .npmrc .yarnrc ./
RUN echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" >> .npmrc
COPY package.json yarn.lock ./
RUN yarn --pure-lockfile
RUN rm -f .npmrc

# Bundle app source
COPY server server

CMD ["yarn", "start"]