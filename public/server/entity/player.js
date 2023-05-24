import { Entity } from "./entity.js";
import { input, entityType, playerType, constant, bodyLabel, bodyCategory } from "../../constant.js";
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
        this.slowTime = 0;
        this.bulletTime = 0;
        this.dx = 1;
        this.dy = 0;
        this.stamina = constant.maximumStamina;
        this.speed = isPolice ? 80 : 50;
        this.playerType = isPolice ? playerType.POLICE : playerType.THIEF;
        this.body.label = this.playerType;
        this.lastSprintTime = Date.now();
        this.isPrision = false;
    }

    update(delta) {
        if (this.isPrision){
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

        if (this.lastSprintTime + 1000 < Date.now() && this.stamina < constant.maximumStamina)
            this.stamina += constant.recoveryStaminaPerFrame * delta;
        if (this.slowTime !== 0)
        this.damagedByBullet();
        if (this.slowTime > 400)
        this.recovred();
        
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
        const x = bx + (Math.cos(this.body.angle) * 10);
        const y = by + (Math.sin(this.body.angle) * 10);

        serverService.addEntity(new Bullet(x, y, this.dx, this.dy));
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

    damagedByBullet() {
        ++this.slowTime;
        this.speed = 10;
    }

    recovred() {
        this.slowTime = 0;
        this.speed = 50;
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
        if (this.playerType === playerType.THIEF && target.entityType === entityType.BULLET)
            this.slowTime = 1;
        else if (target.playerType === playerType.POLICE && this.playerType === playerType.THIEF){
            if (this.isPrision) return ;
            this.isPrision = true;
            me.body.parts.find(x => x.label === bodyLabel.PLAYER).isSensor = true;
        }
        else if (target.playerType === playerType.THIEF && this.playerType === playerType.THIEF){
            if (!this.isPrision) return ;
            this.isPrision = false;
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
            isPrision: this.isPrision,
            gameResultType: this.gameResultType,
        }
    }

}
