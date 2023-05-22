import { Entity } from "./entity.js";
import { constant, entityType } from "../../constant.js";

export class Generator extends Entity {
    constructor(x, y, code) {
        super(Matter.Bodies.rectangle(x, y, 
                constant.blockCenter, 
                constant.blockCenter,
                { isStatic: true },
        ));
        this.entityType = entityType.GENERATOR;
        this.body.label = entityType.GENERATOR;
        this.wallCode = code;
        this.isStatic = true;
        this.genProcess = 0;
        this.genSpeed = 0;
        this.genLevel = 0;

        this.generate();
    }

    toDTO() {
        return {
            ...super.toDTO(),
            width: constant.blockCenter,
            height: constant.blockCenter,
            genLevel: this.genLevel,
        }
    }

    generate() {
        setInterval(() => {

            if (this.genSpeed == 0 && this.genProcess > 0 && this.genProcess < 100)
                this.genProcess -= 10;
            else if (this.genSpeed > 0 && this.genProcess < 100)
                this.genProcess += this.genSpeed;
            
            if (this.genSpeed > 0)
                this.genSpeed -= 1;

            if (this.genProcess <= 0)
                this.genLevel = 0;
            else if (this.genProcess > 0 && this.genProcess < 100)
                this.genLevel = 1;
            else if (this.genProcess >= 100)
                this.genLevel = 2;


        }, 1000);
    }

    interact() {
        if (this.genProcess < 0)
            this.genProcess = 0;

        if (this.genSpeed < 10)
            this.genSpeed += 2;
        
        if (this.genProcess >= 100)
            console.log("Generator is full");
    }
}
