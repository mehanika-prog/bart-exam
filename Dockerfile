FROM node:19-alpine3.16

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Required variables
ENV SERVICE_PORT 3000
ENV JWT_SECRET secret
ENV PASSWORDS_SECRET secret
ENV DATA_PATH /db
ENV FILES_PATH /static

# Optional variables
ENV JWT_EXPIRATION 14400
ENV MIN_USERNAME_LENGTH 8
ENV MAX_USERNAME_LENGTH 32
ENV MIN_PASSWORD_LENGTH 8
ENV MAX_PASSWORD_LENGTH 32
ENV MIN_GALLARY_NAME_LENGTH 1
ENV MAX_GALLARY_NAME_LENGTH 32
ENV MAX_FILE_SIZE_BYTES 65536000
ENV LOG_LEVEL debug

# Variables can be specified in .env file in WORKDIR, but you need to comment or erase duplicates.

EXPOSE $SERVICE_PORT

VOLUME [ '/db', '/static' ]

CMD [ "node", "index.js" ]
