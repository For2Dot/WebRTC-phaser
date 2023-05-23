import { Entity } from "./entity.js";
import { input, entityType,  playerType, constant } from "../../constant.js";
import { Bullet } from "./bullet.js";
import { serverService } from "../server.js";

export class Player extends Entity {
    constructor(connId, x = 0, y = 0, isPolice = 0) {
        super(Matter.Bodies.circle(x, y, 10));

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
        if (isPolice){
            this.speed = 80;
            this.playerType = playerType.POLICE;
        }
        else{
            this.speed = 50;
            this.playerType = playerType.THIEF;
        }
        this.body.label = this.playerType;
    }

    update(delta) {
        const isRight = this.key[input.RIGHT];
        const isLeft = this.key[input.LEFT];
        const isDown = this.key[input.DOWN];
        const isUp = this.key[input.UP];

        if (this.stamina < constant.maximumStamina)
            this.stamina += constant.recoveryStaminaPerFrame * delta;
        if (this.slowTime !== 0)
            this.damagedByBullet();
        if (this.slowTime > 400)
            this.recovred();

        this.isFire = this.key[input.FIRE] ? this.fire() : this.notFire();
        this.isSprint = this.key[input.SPRINT] ? this.sprint() : this.notSprint();
        const dx = (isRight ? 1 : 0) + (isLeft ? -1 : 0);
        const dy = (isDown ? 1 : 0) + (isUp ? -1 : 0);
        const x = dx * this.sprintValue * delta * this.speed;
        const y = dy * this.sprintValue * delta * this.speed;
      
        if (this.key[input.INTERACT])
            this.interact();
        else{
            this.body.collided = [];
            Matter.Body.setVelocity(this.body, { x, y });
        }

        if (dx === 0 && dy === 0)
            return ;
        this.dx = dx;
        this.dy = dy;
      
    }

    fire(){
        if (this.playerType === playerType.THIEF)
            return (false);
        if (this.stamina < constant.fireStamina)
            return (false);
        this.stamina -= constant.fireStamina;
        const {x: bx, y: by} = this.body.position;
        const x = bx + (Math.cos(this.body.angle) * 10);
        const y = by + (Math.sin(this.body.angle) * 10);

        serverService.addEntity(new Bullet(x, y, this.dx, this.dy));
        return (true);
    }

    notFire(){
        return (false);
    }

    sprint(){
        if (this.playerType === playerType.POLICE)
            return (false);
        if (this.stamina < constant.sprintStamina){
            this.sprintValue = 1;
            return (false);
        }
        this.stamina -= constant.sprintStamina;
        this.sprintValue = 2;
        return (true);
    }

    notSprint(){
        this.sprintValue = 1;
        return (false);
    }

    damagedByBullet(){
        ++this.slowTime;
        this.speed = 10;
    }

    recovred(){
        this.slowTime = 0;
        this.speed = 50;
    }
    
    interact() {
        if (this.body.collided.length === 0)
            return;
        this.body.collided.forEach(entity => entity.interact());
        this.key[input.INTERACT] = false;
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
        }
    }
}
