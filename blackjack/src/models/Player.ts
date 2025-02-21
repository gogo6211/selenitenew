import { Card } from './Card';
export type ActionType = 'surrender' | 'stand' | 'hit' | 'double';
export type Status = ActionType | 'bust' | 'blackjack' | null;

type PlayerType = 'ai' | 'house' | 'user';
export class Player {
  public betAmount: number;
  public status: Status;
  public hand: Card[];
  public isGameOver: boolean;
  public AIType?: 'gampler' | 'chiken';

  constructor(public name: string, public type: PlayerType, public gameType: string, public chips?: number) {
    this.betAmount = 0;
    this.hand = [];
    this.status = null;
    this.isGameOver = false;
    if (this.type === 'ai') {
      if (Math.floor(Math.random() * 2 + 1) === 1) this.AIType = 'gampler';
      else this.AIType = 'chiken';
    }
  }

  public isBlackJack(): boolean {
    return this.getHandScore() === 21 && this.hand.length === 2;
  }

  public getHandScore(): number {
    let score = 0;
    this.hand.forEach((card) => {
      score += card.getRankNumber();
    });
    if (score > 21) {
      const numOfA = this.hand.filter((card) => card.rank === 'A').length;
      for (let i = 1; i <= numOfA; i++) {
        if (score <= 21) return score;
        score -= 10;
      }
    }
    return score;
  }

  public decideAIBetMoney(): number {
    if (!this.AIType) return 100;
    if (this.chips === undefined) return 100;

    // 0~chipsの５刻みの乱数
    const betNum = Math.round((Math.random() * this.chips) / 2 / 5) * 5;
    if (betNum === 0) return 5;
    if (betNum > this.chips) return this.chips;
    return betNum;
  }
}
