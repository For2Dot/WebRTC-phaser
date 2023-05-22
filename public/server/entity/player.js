import { Entity } from "./entity.js";
import { input, entityType,  playerType, constant } from "../../constant.js";
import { Bullet } from "./bullet.js";
import { serverData } from "../server.js";

export class Player extends Entity {
    constructor(connId, x = 0, y = 0, isPolice = 0, engine) {
        super(Matter.Bodies.circle(x, y, 10));
        this.entityType = entityType.PLAYER;
        this.body.label = entityType.PLAYER;
        this.connId = connId;
        this.speed = 5;
        this.key = {};
        this.engine = engine;
        this.isFire = false;
        this.isSprint = false;
        this.sprintValue = 1;
        this.dx = 1;
        this.dy = 0;
        this.stamina = constant.maximumStamina;
        if (isPolice)
            this.playerType = playerType.POLICE;
        else
            this.playerType = playerType.THIEF;
    }

    update(delta) {
        const isRight = this.key[input.RIGHT];
        const isLeft = this.key[input.LEFT];
        const isDown = this.key[input.DOWN];
        const isUp = this.key[input.UP];
        // const sprint = this.key[input.SPRINT] ? 2 : 1;

        if (this.stamina < constant.maximumStamina)
            this.stamina += constant.recoveryStaminaPerFrame;
        console.log(this.stamina);

        this.isFire = this.key[input.FIRE] ? this.fire() : this.notFire();
        this.isSprint = this.key[input.SPRINT] ? this.sprint() : this.notSprint();
        const dx = (isRight ? 1 : 0) + (isLeft ? -1 : 0);
        const dy = (isDown ? 1 : 0) + (isUp ? -1 : 0);
        const x = dx * this.sprintValue * delta * this.speed;
        const y = dy * this.sprintValue * delta * this.speed;
        Matter.Body.setVelocity(this.body, { x, y });
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

        const bullet = new Bullet(x, y);
        serverData.entities.push(bullet);
        Matter.Composite.add(this.engine.world, bullet.body);
        Matter.Body.applyForce(bullet.body, this.body.position, {
            x: this.dx * 0.09,
            y: this.dy * 0.09,
        },);
        return (true);
    }

    notFire(){
        return (false);
    }

    sprint(){
        // if (this.playerType === playerType.POLICE)
        //     return (false);
        if (this.stamina < constant.sprintStamina){
            this.sprintValue = 1;
            return (false);
        }
        this.stamina -= constant.sprintStamina;
        this.sprintValue = 10;
        return (true);
    }

    notSprint(){
        this.sprintValue = 1;
        return (false);
    }

    damagedByBullet(){
        this.speed = 1;
    }

    recovred(){
        this.speed = 50;
    }

    toDTO() {
        return {
            ...super.toDTO(),
            type: this.entityType,
            connId: this.connId,
            isSprint: this.isSprint,
            isFire: this.isFire,
            playerType: this.playerType,
            isFire: this.isFire,
        }
    }
}
