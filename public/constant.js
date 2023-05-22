export const input = {
    UP: "up",
    LEFT: "left",
    DOWN: "down",
    RIGHT: "right",
    SPRINT: "sprint",
    FIRE : "fire",
}

export const playerType = {
    THIEF: "thief",
    POLICE: "police",
};

export const entityType = {
    ENTITY: "entity",
    PLAYER: "player",
    TESTBALL: "testBall",
    WALL: "wall",
    BULLET: "bullet",
}

export const constant = {
    playerCnt: 1,
    clientLerp: 0.3,
    clientZoom: 2,
    keyMap: [
        { key: "w", inputId: input.UP },
        { key: "a", inputId: input.LEFT },
        { key: "s", inputId: input.DOWN },
        { key: "d", inputId: input.RIGHT },
        { key: "shift", inputId: input.SPRINT },
        { key: "l", inputId: input.FIRE },
    ],
    blockPixel: 32,
    blockCenter: 16,
    footPrintTimeInterval: 0.1,
    footPrintLife: 0.5,
    recoveryStaminaPerFrame: 1,
    sprintStamina: 50,
    fireStamina: 5000,
    minimumStamina: 0,
    maximumStamina: 10000,
}
