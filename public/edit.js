window.onbeforeunload = () => "edit";
const blockSize = 16;
const canvasWidth = 16 * 50;
const canvasHeight = 16 * 30;
const noGravity = { x: 0, y: 0, scale: 0 }
const engine = Matter.Engine.create({ gravity: noGravity });
const runner = Matter.Runner.create();
Matter.Runner.run(runner, engine);
const render = Matter.Render.create({
    element: document.getElementById("board"),
    engine,
    options: {
        width: canvasWidth,
        height: canvasHeight,
        wireframes: false,
    }
});
Matter.Render.run(render);
const labels = [
    { key: "Digit1", color: "#AAA", name: "wall" },
    { key: "Digit2", color: "#FF0", name: "generator" },
    { key: "Digit3", color: "#0F0", name: "door" },
    { key: "Digit4", color: "#00F", name: "elevator" },
]
let blocks = [];
let stack = [];
let shift = false;
let blockLabel = labels[0].name;
const addBlock = (x1, y1, x2, y2, label) => {
    const centerX = (x1 + x2 + 1) / 2;
    const centerY = (y1 + y2 + 1) / 2;
    const width = x2 - x1 + 1;
    const height = y2 - y1 + 1;
    const body = Matter.Bodies.rectangle(
        centerX * blockSize,
        centerY * blockSize,
        width * blockSize,
        height * blockSize,
        { isStatic: true },
    );
    blocks.push(body);
    body.label = label;
    body.render.fillStyle = labels.find(x => x.name === label).color;
    Matter.Composite.add(engine.world, body);
    return body;
};
const removeBlock = (body) => {
    if (body == null)
        return;
    Matter.Composite.remove(engine.world, body);
    blocks = blocks.filter(x => x != body);
    stack.push(body);
    console.log("remove", body);
};
const revokeBlock = () => {
    const body = stack.pop();
    if (body == null)
        return;
    Matter.Composite.add(engine.world, body);
    blocks.push(body);
    console.log("revoke", body);
}
const mouseConstraint = Matter.MouseConstraint.create(engine, {
    mouse: Matter.Mouse.create(render.canvas)
});

let startPos = null;
let nowPos = null;
Matter.Events.on(mouseConstraint, "mousedown", ({mouse}) => {
    startPos = mouse.mousedownPosition;
})
Matter.Events.on(mouseConstraint, "mousemove", ({mouse}) => {
    nowPos = mouse.position;
})
Matter.Events.on(mouseConstraint, "mouseup", ({mouse}) => {
    let calcPos = {x:mouse.position.x, y:mouse.position.y};
    if (shift) {
        if (Math.abs(mouse.mousedownPosition.x - calcPos.x) > Math.abs(mouse.mousedownPosition.y - calcPos.y)) {
            calcPos.y = mouse.mousedownPosition.y;
        } else {
            calcPos.x = mouse.mousedownPosition.x;
        }
    }
    const x1 = Math.floor(Math.min(mouse.mousedownPosition.x, calcPos.x) / blockSize);
    const y1 = Math.floor(Math.min(mouse.mousedownPosition.y, calcPos.y) / blockSize);
    const x2 = Math.floor(Math.max(mouse.mousedownPosition.x, calcPos.x) / blockSize);
    const y2 = Math.floor(Math.max(mouse.mousedownPosition.y, calcPos.y) / blockSize);
    console.log(x1,y1,x2,y2);
    selectedBody = addBlock(x1, y1, x2, y2, blockLabel);
    stack = [];
    startPos = null;
    nowPos = null;
});

Matter.World.add(engine.world, mouseConstraint);

var canvas = document.getElementById("grid");
var context = canvas.getContext("2d");
canvas.width = canvasWidth;
canvas.height = canvasHeight;
function drawBoard() {
    for (var i = 0; i <= canvasWidth; i += blockSize) {
        context.moveTo(i, 0);
        context.lineTo(i, canvasHeight);
    }
    for (var i = 0; i <= canvasHeight; i += blockSize) {
        context.moveTo(0, i);
        context.lineTo(canvasWidth, i);
    }
    context.strokeStyle = "#888888";
    context.stroke();
}
drawBoard();

const exportToJson = () => {
    const res = blocks.map(x => ({
        rect: x.vertices.map(y => ({
            x: y.x / blockSize,
            y: y.y / blockSize,
        })).filter((_, i) => i % 2 === 0),
        label: x.label,
    }));
    console.log(res);
    return res;
}

document.addEventListener('keydown', function(event) {
    if (event.code === "KeyZ" && event.metaKey === true && event.shiftKey === true)
        revokeBlock();
    if (event.code === "KeyZ" && event.metaKey === true && event.shiftKey === false)
        removeBlock(blocks[blocks.length - 1]);
    if (event.code === "KeyS")
        exportToJson();
    const label = labels.find(x => x.key === event.code);
    if (label != null)
        blockLabel = label.name;
    shift = event.shiftKey;
});
document.addEventListener("keyup", function(event) {
    shift = event.shiftKey;
})

Matter.Events.on(render, "afterRender", (e) => {
    if (startPos == null || nowPos == null)
        return;
    let calcPos = {x:nowPos.x, y:nowPos.y};
    if (shift) {
        if (Math.abs(startPos.x - calcPos.x) > Math.abs(startPos.y - calcPos.y)) {
            calcPos.y = startPos.y;
        } else {
            calcPos.x = startPos.x;
        }
    }
    var context = render.context;
    context.beginPath();
    context.moveTo(startPos.x, startPos.y);
    context.lineTo(calcPos.x, calcPos.y);
    context.lineWidth = 2;
    context.strokeStyle = '#ffffff';
    context.stroke();
});

(async () => {
    const tiles = await fetch("/assets/map.json").then(x => x.json());
    console.log("load", tiles);
    for (const tile of tiles) {
        addBlock(
            tile.rect[0].x,
            tile.rect[0].y,
            tile.rect[1].x - 1,
            tile.rect[1].y - 1,
            tile.label
        );
    }
})();
