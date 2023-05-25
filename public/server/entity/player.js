import { Entity } from "./entity.js";
import { input, entityType, playerType, constant, bodyLabel, bodyCategory, gameResultType } from "../../constant.js";
import { Bullet } from "./bullet.js";
import { serverData, serverService } from "../server.js";

export class Player extends Entity {
    constructor(connId, x = 0, y = 0, isPolice = 0) {
        const group = Entity.getNextGroupId();
        const playerBody = Matter.Bodies.circle(x, y, 8, { label: bodyLabel.PLAYER, collisionFilter: {
            mask: bodyCategory.BODY,
            group,
        }});
        const sensorBody =  Matter.Bodies.circle(x, y, 12, { isSensor: true, label: bodyLabel.PLAYER_SENSOR, collisionFilter: {
            category: bodyCategory.SENSOR,
            mask: bodyCategory.SENSOR_TARGET,
            group,
        }});
        const parts = [playerBody, sensorBody];
        super(Matter.Body.create({
            parts,
            collisionFilter: {
                group,
            },
        }));
        this.entityType = entityType.PLAYER;
        this.connId = connId;
        this.key = {};
        this.isFire = false;
        this.isSprint = false;
        this.sprintValue = 1;
        this.bulletTime = 0;
        this.dx = 1;
        this.dy = 0;
        this.stamina = constant.maximumStamina;
        this.speed = isPolice ? 60 : 50;
        this.playerType = isPolice ? playerType.POLICE : playerType.THIEF;
        this.body.label = this.playerType;
        this.lastSprintTime = Date.now();
        this.lastFireTime = Date.now();
        this.isImprisoned = false;
        this.isEscaped = false;
        this.isSensor = false;
        this.lastFace = input.RIGHT;
        this.gameResultType = gameResultType.LOSE;
    }

    update(delta) {
        if (this.isImprisoned){
            Matter.Body.setVelocity(this.body, {
                x: 0,
                y: 0,
            },);
            return ;
        }
        const isRight = this.key[input.RIGHT];
        const isLeft = this.key[input.LEFT];
        const isDown = this.key[input.DOWN];
        const isUp = this.key[input.UP];

        if (this.playerType === playerType.THIEF){
            if (this.lastSprintTime + 4000 < Date.now() && this.stamina < constant.maximumStamina)
                this.stamina += constant.recoveryStaminaPerFrame * delta;
        }
        else{
            if (this.lastFireTime + 2000 < Date.now() && this.stamina < constant.maximumStamina)
                this.stamina += constant.recoveryStaminaPerFrame * delta;
        }
        if (isRight)
            this.lastFace = input.RIGHT;
        else if (isLeft)
            this.lastFace = input.LEFT;
        this.isFire = this.key[input.FIRE] ? this.fire(delta) : this.notFire(delta);
        this.isSprint = this.key[input.SPRINT] ? this.sprint(delta) : this.notSprint(delta);
        const dx = (isRight ? 1 : 0) + (isLeft ? -1 : 0);
        const dy = (isDown ? 1 : 0) + (isUp ? -1 : 0);
        const x = dx * this.sprintValue * delta * this.speed;
        const y = dy * this.sprintValue * delta * this.speed;

        Matter.Body.setVelocity(this.body, { x, y });

        if (dx === 0 && dy === 0)
            return;
        this.dx = dx;
        this.dy = dy;

    }

    fire() {
        if (this.playerType === playerType.THIEF)
            return (false);
        if (this.stamina < constant.fireStamina)
            return (false);
        this.stamina -= constant.fireStamina;
        const { x: bx, y: by } = this.body.position;

        serverService.addEntity(new Bullet(bx, by, this.dx, this.dy));
        this.lastFireTime = Date.now();
        return (true);
    }

    notFire() {
        return (false);
    }

    sprint(delta){
        if (this.playerType === playerType.POLICE)
            return (false);
        if (this.stamina < constant.sprintStamina * delta){
            this.sprintValue = 1;
            return (false);
        }
        this.stamina -= constant.sprintStamina * delta;
        this.sprintValue = 2;
        this.lastSprintTime = Date.now();
        return (true);
    }

    notSprint() {
        this.sprintValue = 1;
        return (false);
    }

    imprison() {
        this.isImprisoned = true;
        this.body.parts.find(x => x.label === bodyLabel.PLAYER).isSensor = true;
        serverService.rule.checkAlive(this);
    }

    /**
     * @param {Matter.Body} myBody 
     * @param {Matter.Body} targetBody 
     */
    onCollision(myBody, targetBody){
        if (myBody.label !== bodyLabel.PLAYER)
            return;
        const target = serverData.entityBodyMap[targetBody.id];
        const me = serverData.entityBodyMap[myBody.id];
        if (this.playerType === playerType.THIEF && myBody.label === bodyLabel.PLAYER && targetBody.label === bodyLabel.BULLET){
            if (this.isImprisoned) return;
            serverService.removeEntity(target);
            this.imprison();
        }
        else if (target.playerType === playerType.POLICE && this.playerType === playerType.THIEF){
            if (this.isImprisoned) return ;
            this.imprison();
        }
        else if (target.playerType === playerType.THIEF && this.playerType === playerType.THIEF){
            if (!this.isImprisoned) return ;
            this.isImprisoned = false;
            me.body.parts.find(x => x.label === bodyLabel.PLAYER).isSensor = false;
        }
    }

    toDTO() {
        return {
            ...super.toDTO(),
            y: this.body.position.y - 7,
            type: this.entityType,
            connId: this.connId,
            isSprint: this.isSprint,
            isFire: this.isFire,
            playerType: this.playerType,
            stamina: this.stamina,
            isImprisoned: this.isImprisoned,
            gameResultType: this.gameResultType,
            lastFace: this.lastFace,
        }
    }

}
