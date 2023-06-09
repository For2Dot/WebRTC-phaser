export const input = {
    UP: "up",
    LEFT: "left",
    DOWN: "down",
    RIGHT: "right",
    SPRINT: "sprint",
    INTERACT: "interact",
    FIRE : "fire",
}

export const playerType = {
    THIEF: "thief",
    POLICE: "police",
};

export const entityType = {
    ENTITY: "entity",
    PLAYER: "player",
    WALL: "wall",
    DOOR: "door",
    EVDOOR: "elevatorDoor",
    GENERATOR: "generator",
    BULLET: "bullet",
}

export const gameResultType = {
    WIN: "win",
    LOSE: "lose",
}

export const bodyLabel = {
    PLAYER: "player",
    PLAYER_SENSOR: "player_sensor",
    BULLET: "bullet",
}

export const bodyCategory = {
    BODY: 1,
    SENSOR: 2,
    SENSOR_TARGET: 4,
}

export const doorType = {
    VERTICAL: "vertical",
    HORIZONTAL: "horizontal",
}

export const constant = {
    playerCnt: 4,
    clientLerp: 0.3,
    clientZoom: 2,
    keyMap: [
        { key: "w", inputId: input.UP },
        { key: "a", inputId: input.LEFT },
        { key: "s", inputId: input.DOWN },
        { key: "d", inputId: input.RIGHT },
        { key: "j", inputId: input.INTERACT },
        { key: "shift", inputId: input.SPRINT },
        { key: "k", inputId: input.FIRE },
    ],
    blockPixel: 32,
    blockCenter: 16,
    footPrintTimeInterval: 0.1,
    footPrintLife: 0.5,
    recoveryStaminaPerFrame: 30,
    sprintStamina: 65,
    fireStamina: 100,
    maximumStamina: 100,
    gameOverTime: 300,
    generatorCnt: 8,
}
