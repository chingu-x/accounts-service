FROM node:10-slim

# Create app directory
WORKDIR /app

# Set the environment
EXPOSE 3000

# Install app dependencies
ARG NPM_TOKEN
COPY .npmrc .yarnrc package.json yarn.lock ./
RUN echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" >> .npmrc \
  && npm config set always-auth true \
  && yarn --pure-lockfile \
  && rm -f .npmrc

# Bundle app source
COPY server server

CMD ["yarn", "start"]