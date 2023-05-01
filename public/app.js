// https://github.com/nomadcoders/noom/blob/master/src/public/js/app.js

const socket = io();

let myDataChannel = null;
let myPeerConnection = null;
let isHost = false;
let roomId;

function makeConnection() {
    myPeerConnection = new RTCPeerConnection();
    myDataChannel = myPeerConnection.createDataChannel("chat");
    myDataChannel.addEventListener("message", (event) => console.log(event.data));
    console.log("made data channel");

    myPeerConnection.addEventListener("icecandidate", (data) => {
        console.log("sent candidate");
        socket.emit("ice", data.candidate, roomId);
    });
    myPeerConnection.addEventListener("addstream", (data) => {
        console.log(data);
    });
    myPeerConnection.addEventListener("datachannel", (event) => {
        myDataChannel = event.channel;
        event.channel.addEventListener("message", (event) =>
            document.getElementById("messages").value
            = `${document.getElementById("messages").value}${event.target.id}: ${event.data}\n`
        );
    });
}
makeConnection();

socket.on("ice", (ice) => {
    console.log("received candidate", ice);
    myPeerConnection.addIceCandidate(ice);
});

socket.on("offer", async (offer, id) => {
    console.log("received the offer");
    myPeerConnection.setRemoteDescription(offer);
    const answer = await myPeerConnection.createAnswer();
    myPeerConnection.setLocalDescription(answer);
    socket.emit("answer", answer, id);
    console.log(offer, answer);
    console.log("sent the answer");
});

socket.on("answer", (answer) => {
    console.log("received the answer");
    console.log(answer);
    myPeerConnection.setRemoteDescription(answer);
});

document.getElementById("send").addEventListener("click", () => {
    const text = document.getElementById("message").value;
    document.getElementById("message").value = "";
    myDataChannel.send(text);
});

document.getElementById("createRoom").addEventListener("click", () => {
    const text = document.getElementById("message").value;
    document.getElementById("message").value = "";
    socket.emit("createRoom",)
});
socket.on("createdRoom", (_roomId) => {
    console.log(_roomId);
    isHost = true;
    roomId = _roomId;
    document.getElementById("message").value = roomId;
});

document.getElementById("joinRoom").addEventListener("click", () => {
    if (isHost) {
        alert("호스트는 다른 방에 참가 불가");
        return;
    }
    roomId = document.getElementById("message").value;
    document.getElementById("message").value = "";
    socket.emit("joinRoom", roomId)
});
socket.on("joinRoom", async (id) => {
    console.log("joinRoom", id);
    const offer = await myPeerConnection.createOffer();
    myPeerConnection.setLocalDescription(offer);
    console.log("sent the offer");
    console.log(offer);
    socket.emit("offer", offer, id);
});
