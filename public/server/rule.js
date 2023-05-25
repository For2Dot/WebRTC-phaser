import { serverData, serverService, runner }  from './server.js';
import { entityType, gameResultType, playerType } from '../constant.js';

export class Rule {
    constructor() {
        this.startTime = Date.now();
        this.electricity = false;
    }

    gameOver = () => {
        Matter.Runner.stop(runner);

        const players = serverData.entities.filter(x => x.entityType === entityType.PLAYER);
        const polices = players.filter(x => x.playerType === playerType.POLICE);
        const thieves = players.filter(x => x.playerType === playerType.THIEF);
        const winThieves = thieves.filter(x => x.gameResultType === gameResultType.WIN).length;
        const policeGameResult = winThieves >= thieves.length - 1 ? gameResultType.LOSE : gameResultType.WIN;
        polices.forEach(x => x.gameResultType = policeGameResult);
        
        serverService.broadcast("end", serverData.entities
            .filter(x => x.entityType !== entityType.WALL)
            .map(x => x.toDTO()));
    }


    escape = (Exitgroup) => {
        const players = serverData.entities.filter(x => x.entityType === entityType.PLAYER);
        const thieves = players.filter(x => x.playerType === playerType.THIEF);
        const exit = serverData.exits[`exit${Exitgroup}`];

        thieves.forEach(thief => {
            if (thief.body.position.x > exit.x - exit.width / 2 - 8 && thief.body.position.x < exit.x + exit.width / 2 + 8
                && thief.body.position.y > exit.y - exit.height / 2 - 8 && thief.body.position.y < exit.y + exit.height / 2 + 8) {
                thief.isEscaped = true;
                thief.gameResultType = gameResultType.WIN;
                console.log('escaped', thief);
            }
        });
        setTimeout(() => {
            this.checkAllEscaped();
        }, 500);
    }

    checkAllEscaped = () => {
        const players = serverData.entities.filter(x => x.entityType === entityType.PLAYER);
        const thieves = players.filter(x => x.playerType === playerType.THIEF);
        if (thieves.filter(x => x.isEscaped === false).length === 0)
            this.gameOver();
    }

    checkAlive = () => {
        const players = serverData.entities.filter(x => x.entityType === entityType.PLAYER);
        const thieves = players.filter(x => x.playerType === playerType.THIEF);
        console.log(thieves);
        console.log(thieves.filter(x => x.isImprisoned === false));
        console.log(thieves.filter(x => x.isEscaped === false));
        if (thieves.filter(x => x.isImprisoned === false)
                .filter(x => x.isEscaped === false)
                .length === 0)
            this.gameOver();
    }

    checkGenerator = () => {
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
