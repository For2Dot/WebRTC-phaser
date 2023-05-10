export const input = {
    UP: "up",
    LEFT: "left",
    DOWN: "down",
    RIGHT: "right",
    SPRINT: "sprint",
}

export const entityType = {
    ENTITY: "entity",
    PLAYER: "player",
    TESTBALL: "testBall",
}

export const constant = {
    playerCnt: 1,
    keyMap: [
        { key: "w", inputId: input.UP },
        { key: "a", inputId: input.LEFT },
        { key: "s", inputId: input.DOWN },
        { key: "d", inputId: input.RIGHT },
        { key: "shift", inputId: input.SPRINT },
    ]
}
