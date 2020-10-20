const socket = io(),
form = document.querySelector(".dm-form"),
input = document.querySelector(".dm-form input"),
chatlog = document.querySelector("#chatlog");

form.addEventListener("submit", event => {
    event.preventDefault();
    let msg = input.value;
    // if the string is only whitespace
    if(msg.replace(/ [\s\u2800] /g, "").length !== 0) {
        socket.emit("msg-send", msg);
        input.value = "";
    } else addMsg("Message cannot be empty!", "warning");
});

const addMsg = (msg, type) => {
    const li = document.createElement("li");
    li.appendChild(document.createTextNode(msg));
    chatlog.appendChild(li);
    if(type === "error") li.style.backgroundColor = "#ff4f4f";
    else if(type === "warning") li.style.backgroundColor = "#ffbb3d";
    else if(type === "success") li.style.backgroundColor = "#84ff70";
    window.scrollTo(0, document.body.scrollHeight);
}

socket.on("msg-send", msg => {
    addMsg(msg, "")
});