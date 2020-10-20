module.exports = (io) => {
    io.on("connection", socket => {
        socket.on("msg-send", msg => {
            socket.emit("msg-send", msg);
        });
    });
}