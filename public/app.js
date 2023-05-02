// let host;
// const createHost = () => {
//     host = new Network();
//     host.createRoom((roomId) => {
//         net.joinRoom(roomId);
//         document.getElementById("message").value = roomId;
//     });
//     host.addListener("chat", (x) => {
//         console.log(x);
//         host.broadcase("chat", { id: x.connId, data: x.payload });
//     });
// }
// const net = new Network();

// net.addListener("chat", (x) => {
//     const msg = `${x.payload.id}: ${x.payload.data}`
//     document.getElementById("messages").value += `${msg}\n`;
// });

// document.getElementById("send").addEventListener("click", () => {
//     const text = document.getElementById("message").value;
//     document.getElementById("message").value = "";
//     net.broadcase("chat", text);
// });

// document.getElementById("createRoom").addEventListener("click", createHost);
// document.getElementById("joinRoom").addEventListener("click", () => {
//     roomId = document.getElementById("message").value;
//     document.getElementById("message").value = "";
//     net.joinRoom(roomId);
// });

const server = new Server();
const client = new Client();
// async function run() {
//     const roomId = await server.openRoom();
//     const connId = await client.joinRoom(roomId);
// }
// run();
