const Koa = require("koa");
const Router = require("koa-router");
const koaBody = require('koa-body');
const serve = require("koa-static");
const http = require("http");
const socket = require("socket.io");
const path = require("path");
const fs = require("fs");

const port = process.env.PORT || 3001;

const app = new Koa();
const router = new Router();

app.use(serve("dist"));

router.get('*', function(ctx) {
    ctx.body = fs.readFileSync(path.resolve(path.join("dist", "index.html")), "utf8");
});
app.use(router.routes());
app.use(router.allowedMethods());

const server = http.createServer(app.callback());
const io = socket(server);
let connectedUsers = {};

io.on("connection", (socket) => {
    let user = {
        id: socket.id,
        username: socket.handshake.headers.username,
        lat: socket.handshake.headers.lat,
        lng: socket.handshake.headers.lng
    };
    connectedUsers[socket.id] = user;
    socket.emit("all users", connectedUsers);
    io.sockets.emit("new user", user);
    console.log("connected", connectedUsers);

    socket.on("disconnect", () => {
        io.sockets.emit("delete user", socket.id);
        delete connectedUsers[socket.id];
        console.log("Delete", connectedUsers);
    });
});

server.listen(port);