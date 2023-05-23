import {serverData} from './server.js';

class Rule {
    constructor() {
        this.lastUpdate = Date.now();
    }

    checkGenerator() {
        const generatorsToSwitch = serverData.entities
            .filter(x => x.entityType === entityType.GENERATOR)
            .filter(x => x.isWorking === false)
            .length;
        if (generatorsToSwitch > 0)
            return ;
        serverData['electricity'] = true;
    }
}