import { ActionType, Player, Status } from './Player';
import { Deck } from './Deck';
import { Card } from './Card';

export class Table {
  public gamePhase: 'betting' | 'acting' | 'evaluatingWinner' | 'gameOver';
  public resultLog: string[];
  public userResult: string;
  public readonly deck: Deck;
  public readonly players: Player[];

  constructor(public readonly gameType: 'blackjack', public readonly betDenomination: number[], readonly name: string) {
    this.gamePhase = 'betting';
    this.resultLog = [];
    this.userResult = '';
    this.deck = new Deck('blackjack');
    this.players = [new Player(name, 'user', 'blackjack', 400), new Player('AI1', 'ai', 'blackjack', 400), new Player('AI2', 'ai', 'blackjack', 400), new Player('Dealer', 'house', 'blackjack')];
  }

  // playerにカードを２枚づつ配る
  public blackjackAssignPlayerHands() {
    this.players.forEach((player) => {
      if (player.isGameOver) return;
      const card1 = this.deck.drawOne();
      const card2 = this.deck.drawOne();
      if (card1 && card2) {
        if (player.type === 'house') {
          card2.faceDown();
        }
        player.hand.push(card1, card2);
      }
      if (player.isBlackJack()) player.status = 'blackjack';
    });
  }

  // プレイヤーのハンドとステータスをリセットする
  private blackjackClearPlayerHandsAndStatusAndBetAmount() {
    this.players.forEach((player) => {
      player.hand = [];
      player.betAmount = 0;
      player.status = null;
    });
  }

  // 勝敗を評価する
  public evaluateWinner(): { userResult: string; resultLog: string[] } {
    const dealer = this.players.find((player) => player.type === 'house');
    const AIsAndUser = this.players.filter((player) => player.type !== 'house');
    if (!dealer) return { userResult: 'error', resultLog: ['error'] };

    const dealerScore = dealer.getHandScore();
    const isDealerBust = dealer.status === 'bust';
    const isDealerBJ = dealer.status === 'blackjack';

    AIsAndUser.forEach((player) => {
      if (player.status === 'surrender') return;
      if (player.chips === undefined || player.chips === null) return;
      const playerScore = player.getHandScore();
      const isPlayerBust = player.status === 'bust';
      const isPlayerBJ = player.status === 'blackjack';

      // どちらもBust, またはBJでなくスコアが等しい, またはどちらもBJ
      if ((isPlayerBust && isDealerBust) || (!isPlayerBJ && !isDealerBJ && playerScore === dealerScore) || (isPlayerBJ && isDealerBJ)) {
        const log = this.evaluateMoveAndReturnLog(player, 'push');
        if (player.type === 'user') this.userResult = log;
        this.resultLog.push(log);

        // playerがBJでdealerがBJでない, playerがbustでなくdealerがbust,またはplayerがBustしておらずplayerの方がスコアが高い
      } else if ((isPlayerBJ && !isDealerBJ) || (isDealerBust && !isPlayerBust) || (!isPlayerBust && playerScore > dealerScore)) {
        const log = this.evaluateMoveAndReturnLog(player, 'win', isPlayerBJ);
        if (player.type === 'user') this.userResult = log;
        this.resultLog.push(log);
      } else {
        const log = this.evaluateMoveAndReturnLog(player, 'lose');
        if (player.type === 'user') this.userResult = log;
        this.resultLog.push(log);
      }
    });

    return { userResult: this.userResult, resultLog: this.resultLog };
  }

  // chipsの移動を行いログを返す
  private evaluateMoveAndReturnLog(player: Player, result: 'win' | 'lose' | 'push', isPlayerBJ?: boolean): string {
    if (player.chips === undefined) return 'error';

    let log = '';

    if (result === 'win') {
      // BJで勝った時は1.5もらえる
      if (isPlayerBJ) {
        player.chips += 2.5 * player.betAmount;
        log = `${player.name} win ${1.5 * player.betAmount}`;
      } else {
        player.chips += 2 * player.betAmount;
        log = `${player.name} win ${player.betAmount}`;
      }
    } else if (result === 'lose') {
      // 負けた時はbetした額が消える
      log = `${player.name} lose ${player.betAmount}`;
    } else {
      // pushの時はbetした額が戻ってくる
      player.chips += player.betAmount;
      log = `${player.name} push`;
    }

    player.betAmount = 0;
    return log;
  }

  // phaseを進める
  public proceedGamePhase(isGameOver?: boolean) {
    if (this.gamePhase === 'betting') this.gamePhase = 'acting';
    else if (this.gamePhase === 'acting') this.gamePhase = 'evaluatingWinner';
    else if (this.gamePhase === 'evaluatingWinner') {
      if (isGameOver) this.gamePhase = 'gameOver';
      else this.gamePhase = 'betting';
    }
  }

  public betUser(user: Player, betMoney: number) {
    if (!user.chips) return;

    user.betAmount = betMoney;
    user.chips -= betMoney;
  }

  public betAI(ai: Player) {
    if (!ai.chips) return;
    if (ai.chips <= 0) return;
    // TODO: AIのベット額の決め方
    const BET_MONEY = ai.decideAIBetMoney();
    ai.betAmount = BET_MONEY;
    ai.chips -= BET_MONEY;
  }

  // ActionののちBustかどうかを返す。
  public actionAndReturnIsBust(player: Player, type: ActionType): boolean {
    if (type === 'stand') {
      player.status = type;
      return false;
    } else if (type === 'hit') {
      player.status = type;
      const newCard = this.deck.drawOne() as Card;

      player.hand.push(newCard);

      if (player.getHandScore() > 21) {
        player.status = 'bust';
        return true;
      } else if (player.getHandScore() === 21) {
        player.status = 'stand';
        return false;
      } else {
        return false;
      }
    } else if (type === 'surrender') {
      player.status = type;
      if (!player.chips) {
        console.log('error in actionAndReturnIsBust');
        return false;
      }
      if (player.type === 'user') this.userResult = `${player.name} lose ${Math.round(player.betAmount / 2)}`;
      this.resultLog.push(`${player.name} lose ${Math.round(player.betAmount / 2)}`);
      player.chips += Math.round(player.betAmount / 2);
      player.betAmount = 0;
      return false;
    } else {
      player.status = type;
      if (!player.chips) return false;
      const newCard = this.deck.drawOne() as Card;

      player.hand.push(newCard);

      if (player.chips < player.betAmount) {
        console.log('error in double in actionAndReturnIsBust');
      }
      player.chips -= player.betAmount;
      player.betAmount *= 2;

      if (player.getHandScore() > 21) {
        player.status = 'bust';
        return true;
      } else if (player.getHandScore() === 21) {
        player.status = 'stand';
        return false;
      } else {
        return false;
      }
    }
  }

  // playerのハンドを表向きにする
  public faceUpCards(player: Player) {
    player.hand.forEach((card) => card.isDownCard && card.faceUp());
  }

  // テーブルをリセット
  public resetTable() {
    this.blackjackClearPlayerHandsAndStatusAndBetAmount();
    this.deck.resetDeck();
    this.resultLog = ['-----------'];
  }

  // ゲームオーバーかチェック
  public checkIsGameOver() {
    this.players.forEach((player) => {
      if (player.chips === null || player.chips === undefined) return;
      if (player.chips <= 0) player.isGameOver = true;
    });
  }
}
