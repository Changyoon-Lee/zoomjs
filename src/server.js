import express from "express";
import WebSocket from "ws";
import http from "http";
import { parse } from "path";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/static", express.static(__dirname + "/public"));
app.get("/", (req,res) => res.render("home"));
app.get("/*", (req,res) => res.redirect("/"));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
// http서버에 ws서버를 얹었음. can handle http: and wss: in one server. 같은 port에서 두개의 서비스 동작
// wss서버만 필요할경우 이렇게 할 필요 없음
const sockets = [];

wss.on("connection", (socket) => {
    sockets.push(socket);
    socket["nickname"] = "anonymous";
    console.log("Connected from Browser"); 
    socket.on("message", (msg) => {
        const message = JSON.parse(msg);
        if(message.type==='new message'){
            sockets.forEach((aSocket) => {
                if(aSocket.nickname!==socket.nickname){
                aSocket.send(`${socket.nickname}: ${message.payload}`);
            }});
        } else if(message.type==='nickname'){
            console.log(message.payload,"log in");
            socket["nickname"] = message.payload;
        }
    });
    socket.on("close", () => {
        console.log("Disconnected from the Browser");
    });
}); //on 하면 client정보가 전달됨 -> socket
server.listen(3000, () => console.log(`Listeing http://localhost/3000`));