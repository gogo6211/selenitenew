import { Card, Suit } from './Card';

export class Deck {
  private cards: Card[];

  constructor(readonly gameType: 'blackjack') {
    this.cards = [];
    this.resetDeck();
  }

  // デッキをリセットしてシャッフルする
  public resetDeck() {
    this.cards.length = 0;
    const suits: Suit[] = ['H', 'S', 'C', 'D'];
    suits.forEach((suit) => {
      this.cards.push(...[new Card(suit, 'A'), new Card(suit, 1), new Card(suit, 2), new Card(suit, 3), new Card(suit, 4), new Card(suit, 5), new Card(suit, 6), new Card(suit, 7), new Card(suit, 8), new Card(suit, 9), new Card(suit, 10), new Card(suit, 'J'), new Card(suit, 'Q'), new Card(suit, 'K')]);
    });
    this.shuffle();
    console.log(this.cards);
  }

  // 先頭のカードを返す
  public drawOne() {
    return this.cards.pop();
  }

  private shuffle() {
    for (let i = this.cards.length; 1 < i; i--) {
      let k = Math.floor(Math.random() * i);
      [this.cards[k], this.cards[i - 1]] = [this.cards[i - 1], this.cards[k]];
    }
    console.log(this.cards);
  }
}
