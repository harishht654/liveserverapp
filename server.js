var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var url = require("url");

var bodyParser = require('body-parser');



app.use(bodyParser());
var clientResponseRef;
app.get('*', function (req, res) {
    var pathname = url.parse(req.url).pathname;

    var obj = {
        pathname: pathname,
        method: "get",
        params: req.query
    }
    io.emit("page-request", obj);
    clientResponseRef = res;
});
app.post('*', function (req, res) {
    var pathname = url.parse(req.url).pathname;

    var obj = {
        pathname: pathname,
        method: "post",
        params: req.bodt
    }
    io.emit("page-request", obj);
    clientResponseRef = res;
});

io.on("connection", (socket) => {
    console.info(`Client connected [id=${socket.id}]`);
    // initialize this client's sequence number
    socket.on("page-response", (response) => {
        clientResponseRef.send(response);
    })

    // when socket disconnects, remove it from the list:
    io.on("disconnect", () => {
        console.info(`Client gone [id=${socket.id}]`);
    });
});

var server_port = process.env.YOUR_PORT || process.env.PORT || 3000;
server.listen(server_port, () => {
    console.log('listening on *:' + server_port);
})