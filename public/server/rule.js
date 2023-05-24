import { serverData, serverService } from './server.js';
import { entityType } from '../constant.js';

export class Rule {
    constructor() {
        this.startTime = Date.now();
        this.electricity = false;
    }

    gameover = () => {
        Matter.Runner.stop(runner);
        server.broadcast("end", null); // TOdo 클라이언트 뒤로가기
    }

    checkGenerator() {
        const generatorsToSwitch = serverData.entities
            .filter(x => x.entityType === entityType.GENERATOR)
            .filter(x => x.isWorking === false)
            .length;
        if (generatorsToSwitch > 0)
            return;
        serverService.rule['electricity'] = true;
        console.log('Electricity is on');
        
    }

    resetGenerators = () => {
        serverService.rule['electricity'] = false;
        serverData.entities.filter(x => x.entityType === entityType.GENERATOR).forEach(x => x.reset());
    }
}