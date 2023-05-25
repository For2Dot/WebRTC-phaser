import { serverData, serverService, runner }  from './server.js';
import { entityType, gameResultType, playerType } from '../constant.js';

export class Rule {
    constructor() {
        this.startTime = Date.now();
        this.electricity = false;
        this.checkingGameSet = false;
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


    checkGameSet = (Exitgroup) => {
        if (this.checkingGameSet) return;
        this.checkingGameSet = true;

        const players = serverData.entities.filter(x => x.entityType === entityType.PLAYER);
        const thieves = players.filter(x => x.playerType === playerType.THIEF);
        const exit = serverData.exits[`exit${Exitgroup}`];
        console.log(exit);

        thieves.forEach(thief => {
            console.log(thief.body.position);

            if (thief.body.position.x > exit.x - exit.width / 2 && thief.body.position.x < exit.x + exit.width / 2
                && thief.body.position.y > exit.y - exit.height / 2 && thief.body.position.y < exit.y + exit.height / 2) {
                thief.isEscaped = true;
                // serverService.removeEntity(thief);
                // server.broadcast("escape", { id: thief.connId });
            }
        });

        /**
         * Todo
         * 1. 엘베 문이 닫히면 이 함수가 실행된다.
         * 2. 엘베 공간 안에 있는 도둑은 관전자가 된다.
         *      - 엘베 공간에 존재하는지 체크
         *      - 엘베 공간에 경찰이 존재하면 모두 패배
         *      - 관전자 = isSensor = true(충돌x, 벽 뚫어짐), 시야 없앨수 있으면 좋겠다.
         * 3. 도둑이 남아있으면 누군가 탈출했다고 알림을 보낸다.
         * 4. 모든 도둑이 탈출했으면 gameOver() 실행
        */ 

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
