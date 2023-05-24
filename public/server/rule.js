import { serverData, serverService } from './server.js';
import { entityType } from '../constant.js';

export class Rule {
    constructor() {
        this.lastUpdate = Date.now();
        this.electricity = false;
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