export const input = {
    UP: "up",
    LEFT: "left",
    DOWN: "down",
    RIGHT: "right",
    SPRINT: "sprint",
}

export const constant = {
    playerCnt: 2,
    keyMap: [
        { key: "w", inputId: input.UP },
        { key: "a", inputId: input.LEFT },
        { key: "s", inputId: input.DOWN },
        { key: "d", inputId: input.RIGHT },
        { key: "shift", inputId: input.SPRINT },
    ]
}
