# bart-exam (startup guide)



FIrst of all yopu need to setup ENV variables. Here is some required vars, and some optional.

You can do it by creating `.env` file using `.env.example` file.

Or you can specify this variables in `Dockerfile`.

Or any other way.

------

### Startup using node

Install node modules

`npm run install`

Lounch

`npm run start` or `node index` - production mode

`npm run dev` or `nodemon index` - development mode (auto restart after saving changes)



### Startup using docker

Build image

`docker build .`

Run image

`docker run -p <port-outside-container>:<port-insidecontainer> -v <some-path-on-you-pc>:<path-to-logs> -v <some-path-on-you-pc>:<path-to-static-files> -v <some-path-on-you-pc>:<path-to-db-files> -dt <imageId>`

Run image just for tests

`docker run -p <port-outside-container>:<port-insidecontainer> -dt <imageId> `



### Documentation

http://api.programator.sk/docs#

All routes from this documentaion requires `Authorization` header with data:  `Bearer <token>`



**POST /register && POST /login**

Body params:

*username* (required)

*password* (required)



After successfull logging in you will receive your user token.

To upload the image use key `data` with binary image data as a data.
