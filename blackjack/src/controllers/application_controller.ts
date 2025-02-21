import { View } from '../views/application_view';
import { Table } from '../models/Table';
import { Player, ActionType } from '../models/Player';
import { sleep, randomSleep } from '../utils/sleep';
import { returnBoolFromProbability } from '../utils/returnBoolFromProbability.ts';
// tableを操作してゲームを進める
export class Controller {
  private view: View;
  private table: Table | null;
  private user: Player | null = null;
  private dealer: Player | null = null;
  private AIsAndUser: Player[] = [];
  private actionPhase: 'assginCards' | 'userAndAIAction' | 'dealerAction';

  constructor() {
    this.view = new View(this);
    this.view.renderStartPage();
    this.table = null;
    this.actionPhase = 'assginCards';
  }

  public startGame(name: string, gameType: string) {
    if (gameType === 'porker') {
      alert('近日公開！！（多分）');
      return;
    }
    if (name === '') name = 'User';

    this.table = new Table('blackjack', [5, 10, 50, 100], name);

    const dealer = this.table.players.find((player) => player.type === 'house');
    const AIsAndUser = this.table.players.filter((player) => player.type !== 'house');
    const user = this.table.players.find((player) => player.type === 'user');

    if (!dealer || !user || !AIsAndUser) {
      console.log('error in startGame');
      return;
    }

    this.dealer = dealer;
    this.AIsAndUser = AIsAndUser;
    this.user = user;

    this.view.renderTableMock(this.table);
    this.haveTurn();
  }

  // gamePhaseによって処理を分けて行う
  haveTurn() {
    if (!this.table) return;
    const table = this.table;

    if (table.gamePhase === 'betting') {
      // テーブルをレンダリング
      this.view.renderTable(table);
    } else if (table.gamePhase === 'acting') {
      // テーブルをレンダリングし直す
      this.view.renderTable(table);
      this.handleActingPhase();
    } else if (table.gamePhase === 'evaluatingWinner') {
      const { userResult, resultLog } = this.table.evaluateWinner();

      this.table.resetTable();
      this.table.checkIsGameOver();

      // ユーザーがgameover
      if (this.user?.isGameOver) {
        this.table.proceedGamePhase(true);
        this.actionPhase = 'assginCards';
        this.haveTurn();
        return;
      }

      // ログとユーザーの結果を表示
      this.view.renderLogs(resultLog);
      this.view.renderUserResultModal(userResult);

      // 次のゲーム
      this.table.proceedGamePhase();
      this.actionPhase = 'assginCards';
    } else if (table.gamePhase === 'gameOver') {
      this.view.renderUserResultModal('GAME OVER');
    }
  }

  // 次のゲームに進む、ゲームオーバーの時は,新しくゲームをスタート
  public nextGame() {
    if (this.user?.isGameOver) {
      this.startGame(this.user.name, 'blackjack');
      return;
    }
    this.haveTurn();
  }

  // userがbetを決定すると呼ばれる
  // AI, Userのベット額を決定
  public handleBettingPhase(userBetMoney: number) {
    if (!this.table) return;

    // 各playerがbetする
    this.table.players.forEach((player) => {
      if (player.type === 'house') return;
      else if (player.type === 'ai') this.table?.betAI(player);
      else if (player.type === 'user') this.table?.betUser(player, userBetMoney);
    });

    this.table.proceedGamePhase();
    this.haveTurn();
  }

  // "asignCards" => "userAndAIAction" => "dealerAction"で回す
  private async handleActingPhase() {
    if (!this.table || !this.dealer) {
      console.log('error in handleActionPhase');
      return;
    }

    if (this.actionPhase === 'assginCards') {
      // カードを配る
      this.assignInitialHands(this.dealer, this.AIsAndUser);
    } else if (this.actionPhase === 'userAndAIAction') {
      const AIs = this.AIsAndUser.filter((player) => player.type === 'ai');
      const user = this.AIsAndUser.find((player) => player.type === 'user');

      if (!AIs || !user) return;

      if (!AIs[0].isGameOver) {
        await this.decideAIAction(AIs[0]);
      }
      if (!AIs[1].isGameOver) {
        await this.decideAIAction(AIs[1]);
      }
      await sleep(1000);
      // ユーザーのアクション
      if(user.chips === undefined) return
      await this.view.renderOperaion(user.chips < user.betAmount);

      // BJの時は次に進む
      if (user.isBlackJack()) {
        await this.view.updateOperation(user);
        this.actionPhase = 'dealerAction';
        this.handleActingPhase();
      }
    } else if (this.actionPhase === 'dealerAction') {
      await sleep(1000);
      // カードを表向きにする
      await this.table.faceUpCards(this.dealer);
      await this.view.renderCards(this.dealer);
      // dealerのアクション
      await this.decideDealerAction(this.dealer);
      await sleep(500);
      // evaluateWinnerに進む
      await this.table.proceedGamePhase();
      this.haveTurn();
    }
  }

  private async assignInitialHands(dealer: Player, AIsAndUser: Player[]) {
    if (!this.table) return;

    // playerにカードを配る
    await this.table.blackjackAssignPlayerHands();

    // 配ったカードをレンダリング
    if (!dealer) return;
    await sleep(1000);
    await this.view.renderCards(dealer);
    await sleep(1000);
    await AIsAndUser.forEach((player) => {
      this.view.renderCards(player);
    });

    // playerがBJの時、statusをupdateする
    await AIsAndUser.forEach((player) => {
      if (player.isBlackJack()) {
        this.view.updateStatus(player, 'blackjack');
      }
    });

    this.actionPhase = 'userAndAIAction';
    this.handleActingPhase();
  }

  private async decideAIAction(AI: Player) {
    let threshold = 16;
    let surrenderProbability = 10;
    let doubleProbability = 10;

    if(AI.chips === undefined) return

    if (AI.AIType === 'gampler') {
      threshold = 17;
      surrenderProbability = 5;
      doubleProbability = 10;
    } else {
      threshold = 15;
      surrenderProbability = 10;
      doubleProbability = 5;
    }

    await randomSleep();

    if (AI.status === 'blackjack') {
      this.view.updateStatus(AI, 'blackjack');
      return;
    }

    // スコアが11以下の時のみdouble
    if (AI.getHandScore() <= 11 && AI.chips > AI.betAmount && returnBoolFromProbability(doubleProbability)) {
      this.handleAiAndDealerAction('double', AI);
      return;
    }

    if (returnBoolFromProbability(surrenderProbability)) {
      this.handleAiAndDealerAction('surrender', AI);
      return;
    }

    if (AI.getHandScore() >= threshold) {
      this.handleAiAndDealerAction('stand', AI);
      return;
    }

    // bustするまでloop
    while (!this.handleAiAndDealerAction('hit', AI)) {
      const score = AI.getHandScore();
      await randomSleep();
      // threshold以上になるまで引く
      if (score > threshold) {
        this.handleAiAndDealerAction('stand', AI);
        await sleep(500);
        break;
      }
    }
  }

  private async decideDealerAction(Dealer: Player) {
    // Dealerは17以上までhit
    await sleep(1500);

    if (Dealer.status === 'blackjack') {
      this.view.updateStatus(Dealer, 'blackjack');
      return;
    }

    if (Dealer.getHandScore() >= 17) {
      this.handleAiAndDealerAction('stand', Dealer);
      return;
    }

    // bustするまでloop
    while (!this.handleAiAndDealerAction('hit', Dealer)) {
      const score = Dealer.getHandScore();
      await sleep(1500);
      // 16以上になるまで引く
      if (score >= 17) {
        this.handleAiAndDealerAction('stand', Dealer);
        await sleep(500);
        break;
      }
    }
  }

  // Userのアクションを行う
  public handleUserAction(actionType: ActionType) {
    if (!this.user) return;
    if (!this.table) return;
    const player = this.user;

    if (actionType === 'stand') {
      this.table.actionAndReturnIsBust(player, actionType);

      // update view
      this.view.updateStatus(player, actionType);

      // 次に進む
      this.view.updateOperation(player);
      this.actionPhase = 'dealerAction';
      this.handleActingPhase();
    } else if (actionType === 'hit') {
      const isBust = this.table.actionAndReturnIsBust(player, actionType);

      // update view
      this.view.updateStatus(player, actionType);
      this.view.renderCards(player);

      if (isBust) {
        // update view
        this.view.updateStatus(player, 'bust');
        // 次に進む
        this.view.updateOperation(player);
        this.actionPhase = 'dealerAction';
        this.handleActingPhase();
      } else {
        this.view.updateOperation(player);
        // scoreが21の時はstandして次のフェーズに
        if (this.user.getHandScore() === 21) {
          this.view.updateStatus(player, 'stand');
          this.actionPhase = 'dealerAction';
          this.handleActingPhase();
        }
      }
    } else if (actionType === 'surrender') {
      this.table.actionAndReturnIsBust(player, actionType);
      this.view.updateStatus(player, actionType);

      // update view
      this.view.updateChips(player);
      this.view.updateBet(player);
      // 次に進む
      this.view.updateOperation(player);
      this.actionPhase = 'dealerAction';
      this.handleActingPhase();
    } else {
      const isBust = this.table.actionAndReturnIsBust(player, actionType);
      this.view.updateStatus(player, actionType);

      // update view
      this.view.updateChips(player);
      this.view.renderCards(player);
      this.view.updateBet(player);
      this.view.updateOperation(player);
      if (isBust) {
        // update view
        this.view.updateStatus(player, 'bust');

        // 次に進む
        this.actionPhase = 'dealerAction';
        this.handleActingPhase();
      } else {
        // 次に進む
        this.actionPhase = 'dealerAction';
        this.handleActingPhase();
      }
    }
  }

  // AIとDealerのアクションを行う, bustしたかどうかを返す
  public handleAiAndDealerAction(actionType: ActionType, AI: Player): boolean {
    if (!this.table) return false;

    if (actionType === 'stand') {
      this.table.actionAndReturnIsBust(AI, actionType);

      this.view.updateStatus(AI, actionType);

      return false;
    } else if (actionType === 'hit') {
      const isBust = this.table.actionAndReturnIsBust(AI, actionType);

      this.view.updateStatus(AI, actionType);
      this.view.renderCards(AI);

      if (isBust) {
        this.view.updateStatus(AI, 'bust');
      }

      return isBust;
    } else if (actionType === 'surrender') {
      this.table.actionAndReturnIsBust(AI, actionType);

      this.view.updateStatus(AI, actionType);
      this.view.updateChips(AI);
      this.view.updateBet(AI);

      return false;
    } else {
      const isBust = this.table.actionAndReturnIsBust(AI, actionType);

      this.view.updateStatus(AI, actionType);
      this.view.updateChips(AI);
      this.view.renderCards(AI);
      this.view.updateBet(AI);

      if (isBust) {
        this.view.updateStatus(AI, 'bust');
      }
      return isBust;
    }
  }
}
