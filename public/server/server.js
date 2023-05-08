import { Server } from "./webrtc.js";

const playerCnt = 2;
const playerArr = [];
const players = {};

/**
 * @param {Server} server 
 */
export default function activity(server) {
    const init = () => {
        for (let idx = 0; idx < playerArr.length; idx++) {
            const player = playerArr[idx];
            player.y = 300;
            player.x = idx * 25 + 100;
            players[player.connId] = player;
        }
    }

    server.addEventListener("chat", ({ connId, payload }) => {
        server.broadcast("chat", { id: connId, chat: payload });
    });

    server.addConnListener((connId, state) => {
        if (state === "connected") {
            server.broadcast("chat", { id: connId, chat: "has joined." });
            var player = new Player(connId);
            playerArr.push(player)
            if (playerArr.length < playerCnt)
                return;
            const startBtn = document.querySelector("#start");
            startBtn.addEventListener("click", () => {
                server.freezeRoom();
                init();
                setTimeout(() => {
                    server.broadcast("start", playerCnt);
                    server.broadcast("chat", { id: "System", chat: "game started!" });
                }, 100);
                // change startBtn's style to display:none
                startBtn.style.display = "none";

            });
            startBtn.removeAttribute("disabled");
        }
    });

    server.addEventListener("keyPress", ({ connId, payload }) => {
        if (payload.inputId === "right")
            players[connId].pressingRight = payload.state;
        if (payload.inputId === "down")
            players[connId].pressingDown = payload.state;
        if (payload.inputId === "left")
            players[connId].pressingLeft = payload.state;
        if (payload.inputId === "up")
            players[connId].pressingUp = payload.state;
    });

    setInterval(function () {
        var pack = [];
        for (var i in playerArr) {
            var player = playerArr[i];
            player.updatePosition();
            pack.push({
                id: player.connId,
                x: player.x,
                y: player.y,
            });
        }
        server.broadcast("newPos", pack);
    }, 33);
}


class Player {
    constructor(connId) {
        this.connId = connId;
        this.x = 0;
        this.y = 0;
        this.pressingRight = false;
        this.pressingLeft = false;
        this.pressingUp = false;
        this.pressingDown = false;
        this.maxSpd = 2.5;
    }
    updatePosition = function () {
        if (this.pressingRight)
            this.x += this.maxSpd;
        if (this.pressingLeft)
            this.x -= this.maxSpd;
        if (this.pressingUp)
            this.y -= this.maxSpd;
        if (this.pressingDown)
            this.y += this.maxSpd;
    }
}
