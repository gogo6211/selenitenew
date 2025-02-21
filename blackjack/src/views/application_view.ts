import { Controller } from '../controllers/application_controller';
import { Player, Status } from '../models/Player';
import { Table } from '../models/Table';
export class View {
  private root: HTMLElement;
  constructor(public controller: Controller) {
    this.root = document.getElementById('root') as HTMLElement;
  }
  renderStartPage() {
    this.root.innerHTML = `
    <section id="start-page" class="w-full h-full flex justify-center align-ce">
        <div class="container m-auto text-center p-5">
          <h1 class="mb-5 font-semibold text-3xl text-gray-100 tracking-tight">Welcome to Card Game!</h1>
          <input type="text" name="name" id="name-input" placeholder="username" class="shadow mb-5 w-72 border bg-gray-100 text-gray-700 border-gray-300 py-2 pl-3 rounded-md outline-none focus:outline-none focus:bg-white focus:border-gray-500" />
          <div class="relative w-72 m-auto mb-5">
            <select id="game-type-select" class="shadow block appearance-none w-full bg-gray-100 border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-md leading-tight focus:outline-none focus:bg-white focus:border-gray-500">
              <option>brackjack</option>
              <option>porker</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
            </div>
          </div>
          <div>
            <button id="start-button" class="shadow py-3 w-72 text-xl text-white bg-green-500 hover:bg-green-400 rounded-xl">Start Game</button>
          </div>
        </div>
      </section>
    `;

    const nameInput = document.getElementById('name-input') as HTMLInputElement;
    const gameTypeSelect = document.getElementById('game-type-select') as HTMLSelectElement;
    const startBtn = document.getElementById('start-button') as HTMLElement;

    startBtn.addEventListener('click', () => {
      if (nameInput.value.length > 10) {
        alert('10文字以内で入力して下さい');
        nameInput.value = '';
        return;
      }
      if (nameInput.value === 'AI1' || nameInput.value === 'AI2') {
        alert('その名前は使うことができません');
        nameInput.value = '';
        return;
      }
      this.controller.startGame(nameInput.value, gameTypeSelect.value);
    });
  }

  public renderTable(table: Table) {
    const players = table.players;
    const betDenomination = table.betDenomination;
    let chips: number = 400;

    // playerをレンダリング
    players.forEach((player) => {
      if (player.type === 'house') this.renderHouse(player);
      else if (player.type === 'ai') this.renderAI(player);
      else {
        if (player.chips) chips = player.chips;
        this.renderUser(player);
      }
      if (player.isGameOver) {
        this.updateStatus(player, null);
      }
    });

    if (table.gamePhase === 'betting') {
      // betModalをレンダリング
      this.renderBetOperationModal(chips, betDenomination);
    } else if (table.gamePhase === 'acting') {
      // betをレンダリング
      this.renderBet(players);
    }
  }

  public renderTableMock(table: Table) {
    const players = table.players;
    const ai_names = players.filter((player) => player.type === 'ai').map((player) => player.name);

    this.root.innerHTML = `
    <section class="w-full h-full flex justify-center align-center">
      <div class="container m-auto text-center h-4/5">
        <div class="h-2/6 w-full flex justify-center">
          <div id="house-container" class="h-full min:w-1/3"></div>
        </div>
        <div class="h-2/6 w-full flex relative justify-between">
          <div id="${ai_names[0]}-container" class="z-10 h-full min:w-1/3"></div>
          <div id="bet-space" class="z-0 h-full absolute right-1/2 transform translate-x-1/2 w-24 md:w-36 flex justify-center items-center gap-0"></div>
          <div id="${ai_names[1]}-container" class="z-10 h-full min:w-1/3"></div>
        </div>
        <div class="h-2/6 w-full flex justify-center">
          <div id="user-container" class="bg-green-700 h-full min:w-2/5"></div>
        </div>
      </div>
      <div class="fixed top-0 left-0 p-3">
        <a class="fa-stack fa-1x" href="https://github.com/hiromu617/BlackJack" target="_blank" rel="noopener noreferrer">
          <i class="fas fa-circle fa-stack-2x fa-inverse"></i>
          <i class="fab fa-github fa-stack-2x" style="color: #333"></i>
        </a>
      </div>
      <div id="operation-space" class="z-10 fixed pb-2 w-full bottom-0 flex justify-center gap-2 md:gap-5 align-center"></div>
      <div id="bet-operation-space" class="hidden z-20 fixed w-4/5 md:w-1/3 h-2/3 top-1/2 transform -translate-y-1/2 bg-white rounded-2xl flex justify-center items-center flex-col gap-10 shadow-2xl"></div>
      <div id="user-result-space" class="hidden z-20 fixed transform -translate-y-1/2 w-4/5 md:w-1/3 h-1/3 top-1/2 bg-white rounded-2xl flex justify-center items-center flex-col gap-10 shadow-2xl"></div>
      <div id="log" class="overflow-scroll z-5 fixed pb-2 w-1/3 h-32 md:h-52 top-0 right-0 text-center"></div>
    </section>
    `;
  }

  public renderOperaion(isAbleToDouble?: boolean) {
    const operaionSpace = document.getElementById('operation-space');
    if (!operaionSpace) {
      console.log('error renderOperaion');
      return;
    }
    operaionSpace.innerHTML = `
    <button id="surrender" class="rounded-full h-20 w-20 md:h-24 md:w-24 flex items-center justify-center bg-red-500 hover:bg-red-600 disabled:opacity-50 shadow-lg text-white text-sm">SURRENDER</button>
    <button id="stand" class="rounded-full h-20 w-20 md:h-24 md:w-24 flex items-center justify-center bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 shadow-lg text-white">STAND</button>
    <button id="hit" class="rounded-full h-20 w-20 md:h-24 md:w-24 flex items-center justify-center bg-blue-500 hover:bg-blue-600 disabled:opacity-50 shadow-lg text-white">HIT</button>
    <button id="double" class="rounded-full h-20 w-20 md:h-24 md:w-24 flex items-center justify-center bg-purple-500 hover:bg-purple-600 disabled:opacity-50 shadow-lg text-white">DOUBLE</button>
    `;

    const surrenderBtn = document.getElementById('surrender');
    const standBtn = document.getElementById('stand');
    const hitBtn = document.getElementById('hit');
    const doubleBtn = document.getElementById('double');


    if (!surrenderBtn || !standBtn || !hitBtn || !doubleBtn) {
      console.log('error 130');
      return;
    }

    if(isAbleToDouble){
      doubleBtn.setAttribute('disabled', 'true');
    }

    surrenderBtn.addEventListener('click', () => {
      this.controller.handleUserAction('surrender');
    });
    standBtn.addEventListener('click', () => {
      this.controller.handleUserAction('stand');
    });
    hitBtn.addEventListener('click', () => {
      this.controller.handleUserAction('hit');
    });
    doubleBtn.addEventListener('click', () => {
      this.controller.handleUserAction('double');
    });
  }

  private renderBetOperationModal(chip: number, betDenomination: number[]) {
    const betOperationSpace = document.getElementById('bet-operation-space');
    if (!betOperationSpace) {
      console.log('error renderOprtionModal');
      return;
    }
    const ID = { CURRENT_CHIP: 'current-chip', BET_MONEY: 'bet-money', BET_BTNS: 'bet-btns', RESET_BTN: 'reset-btn', BET_DECISION_BTN: 'bet-decision-btn' } as const;

    betOperationSpace.innerHTML = `
          <div>
            <p class="text-2xl text-gray-800 font-bold">You Bet <span id=${ID.BET_MONEY}>0</span> </p>
          </div>
          <div class="h-auto flex justify-center items-center gap-2">
            <span class="rounded-full h-8 w-8 flex items-center justify-center bg-yellow-600 shadow-lg text-white text-sm">c</span>
            <span id=${ID.CURRENT_CHIP} class="text-gray-700 font-semibold">${chip}</span>
          </div>
          <div id=${ID.BET_BTNS} class="h-auto flex justify-center items-center gap-2">
          </div>
          <div class="p-3  mt-2 text-center space-x-4 md:block">
            <button id=${ID.RESET_BTN} class="mb-2 md:mb-0 bg-white px-5 py-2 text-sm shadow-sm font-medium tracking-wider border text-gray-600 rounded-full hover:shadow-lg hover:bg-gray-100">
                Reset
            </button>
            <button id=${ID.BET_DECISION_BTN} class="mb-2 md:mb-0 bg-red-500 border border-red-500 px-5 py-2 text-sm shadow-sm font-medium tracking-wider text-white rounded-full hover:shadow-lg hover:bg-red-600">Bet</button>
          </div>
    `;
    // modalを表示
    betOperationSpace.classList.remove('hidden');

    const currentChip = document.getElementById(ID.CURRENT_CHIP);
    const betMoney = document.getElementById(ID.BET_MONEY);
    const betBtns = document.getElementById(ID.BET_BTNS);
    const resetBtn = document.getElementById(ID.RESET_BTN);
    const betDecisionBtn = document.getElementById(ID.BET_DECISION_BTN);

    if (!currentChip || !betMoney || !betBtns || !resetBtn || !betDecisionBtn) {
      console.log('error in renderBetOperationModal');
      return;
    }

    betDenomination.forEach((val) => {
      const btn = document.createElement('button');
      btn.classList.add('rounded-full', 'h-12', 'w-12', 'flex', 'items-center', 'justify-center', 'bg-yellow-500', 'hover:bg-yellow-600', 'shadow-lg', 'text-white', 'text-sm');
      btn.textContent = String(val);
      btn.addEventListener('click', () => {
        const betMoneyVal = betMoney.textContent;
        const currentChipVal = currentChip.textContent;

        if (!betMoneyVal || !currentChipVal) return;
        const betMoneyNum = parseInt(betMoneyVal);
        const currentChipNum = parseInt(currentChipVal);

        if (currentChipNum - val < 0) return;
        betMoney.textContent = String(betMoneyNum + val);
        currentChip.textContent = String(currentChipNum - val);
      });
      betBtns.appendChild(btn);
    });

    resetBtn.addEventListener('click', () => {
      betMoney.textContent = '0';
      currentChip.textContent = String(chip);
    });
    betDecisionBtn.addEventListener('click', () => {
      const betMoneyVal = betMoney.textContent;
      if (!betMoneyVal) return;
      const betMoneyNum = parseInt(betMoneyVal);
      if (betMoneyNum === 0) return;

      // close modal
      betOperationSpace.classList.add('hidden');
      this.controller.handleBettingPhase(betMoneyNum);
    });
  }

  public renderUserResultModal(userLog: string) {
    const userResultSpace = document.getElementById('user-result-space');
    if (!userResultSpace) {
      console.log('error renderUserResultModal');
      return;
    }
    const NEXT_GAME_BTN = 'next_game-btn';

    userResultSpace.innerHTML = `
          <div>
            <p class="text-2xl text-gray-800 font-bold">${userLog}</p>
          </div>
    `;

    if (userLog === 'GAME OVER') {
      userResultSpace.innerHTML += `
      <button id=${NEXT_GAME_BTN} class="bg-red-500 border px-5 py-2 text-sm shadow-sm font-medium tracking-wider text-white rounded-full hover:shadow-lg hover:bg-blue-600">New Game</button>
      `;
    } else {
      userResultSpace.innerHTML += `
      <button id=${NEXT_GAME_BTN} class="bg-blue-500 border px-5 py-2 text-sm shadow-sm font-medium tracking-wider text-white rounded-full hover:shadow-lg hover:bg-blue-600">Next Game</button>
      `;
    }
    // modalを表示
    userResultSpace.classList.remove('hidden');

    const nextGameBtn = document.getElementById(NEXT_GAME_BTN);
    if (!nextGameBtn) return;

    nextGameBtn.addEventListener('click', () => {
      userResultSpace.classList.add('hidden');
      this.controller.nextGame();
    });
  }

  public renderHouse(player: Player) {
    if (player.type !== 'house') return;
    const houseContainer = document.getElementById('house-container');
    if (!houseContainer) {
      console.log('error in renderHouse');
      return;
    }
    houseContainer.innerHTML = `
    <div class="mb-2">
      <span class="shadow text-xl md:text-2xl inline-block bg-white rounded-full px-4 py-1 text-xl font-semibold text-gray-800">${player.name}</span>
    </div>
    <div id="${player.name}-status" class="h-4 flex justify-center items-center gap-2">
    </div>
    <div id="${player.name}-cards-container" class="overflow-scroll flex gap-2 align-center justify-center mt-3">
    </div>
    `;
  }
  public renderUser(player: Player) {
    if (player.type !== 'user') return;
    const userContainer = document.getElementById('user-container');
    if (!userContainer) {
      console.log('error in renderUser');
      return;
    }
    userContainer.innerHTML = `
    <div class="mb-2">
      <span id="user-name" class="shadow text-xl md:text-2xl inline-block bg-white rounded-full px-4 py-1 text-xl font-semibold text-gray-800">${player.name}</span>
    </div>
    <div class="h-4 flex justify-center items-center gap-2">
      <span class="rounded-full h-4 w-4 flex items-center justify-center bg-yellow-600 shadow-lg text-white text-sm">c</span>
      <span id="${player.name}-money" class="text-white text-sm">${player.chips}</span>
      <div id="${player.name}-status">
      </div>
    </div>
    <div id="${player.name}-cards-container" class="overflow-scroll flex gap-2 align-center justify-center mt-3">
    </div>
    `;
  }

  public renderAI(player: Player) {
    if (player.type !== 'ai') return;
    const aiContainer = document.getElementById(player.name + '-container');
    if (!aiContainer) {
      console.log('error in renderAi');
      return;
    }
    aiContainer.innerHTML = `
    <div class="mb-2">
      <span class="shadow text-xl md:text-2xl inline-block bg-gray-700 rounded-full px-4 py-1 text-xl font-semibold text-white">${player.name}</span>
    </div>
      <div class="h-4 flex justify-center items-center gap-2">
        <span class="rounded-full h-4 w-4 flex items-center justify-center bg-yellow-600 shadow-lg text-white text-sm">c</span>
        <span id="${player.name}-money" class="text-white text-sm">${player.chips}</span>
        <div id="${player.name}-status">
        </div>
      </div>
    <div id="${player.name}-cards-container" class="flex gap-0.5 md:gap-2 align-center justify-center mt-3">
    </div>
    `;
  }

  // TODO: refactoring
  private renderBet(players: Player[]) {
    const betSpace = document.getElementById('bet-space');
    if (!betSpace) {
      console.log('error in renderBet');
      return;
    }
    const user = players.find((player) => player.type === 'user');
    const AIs = players.filter((player) => player.type === 'ai');

    if (!user) {
      console.log('error in renderBet');
      return;
    }
    betSpace.innerHTML = '';
    if (AIs[0].betAmount !== 0) {
      betSpace.innerHTML += `
      <div id="${AIs[0].name}-betmoney" class="absolute left-0 rounded-full h-10 w-10 md:h-12 md:w-12 flex items-center justify-center bg-gray-700 shadow-lg text-white text-sm">${AIs[0].betAmount}</div>
      `;
    }
    if (user.betAmount !== 0) {
      betSpace.innerHTML += `
    <div id="${user.name}-betmoney" class="absolute bottom-5 rounded-full h-10 w-10 md:h-12 md:w-12 flex items-center justify-center bg-white shadow-lg text-gray-800 text-sm">${user.betAmount}</div>
    `;
    }
    if (AIs[1].betAmount !== 0) {
      betSpace.innerHTML += `
    <div id="${AIs[1].name}-betmoney" class="absolute right-0 rounded-full h-10 w-10 md:h-12 md:w-12 flex items-center justify-center bg-gray-700 shadow-lg text-white text-sm">${AIs[1].betAmount}</div>
    `;
    }
  }

  public renderCards(player: Player) {
    const cardConteiner = document.getElementById(player.name + '-cards-container');
    if (!cardConteiner) {
      console.log('error renderInitialCards');
      console.log(player.name);
      return;
    }
    cardConteiner.innerHTML = '';

    player.hand.forEach((card) => {
      const cardDiv = document.createElement('div');

      // TODO: 条件分技が汚い
      if (card.isDownCard) {
        cardDiv.classList.add('relative', 'flex', 'justify-center', 'align-ceter', 'w-16', 'h-24', 'md:w-20', 'md:h-32', 'bg-gray-900', 'rounded', 'shadow', 'text-center');
        cardDiv.innerHTML = `
        <p class="text-white text-3xl m-auto">?</p>
        `;
      } else {
        if (player.type === 'house' || player.type === 'user') {
          cardDiv.classList.add('relative', 'flex', 'justify-center', 'align-ceter', 'w-16', 'h-24', 'md:w-20', 'md:h-32', 'bg-white', 'rounded', 'shadow', 'text-center');
          cardDiv.innerHTML = `
          <img src="${card.suit}.png" class="h-8 md:h-10 m-auto" />
          <span class="absolute top-0 left-1 text-2xl mt-2">${card.rank}</span>
          `;
        } else if (player.type === 'ai') {
          cardDiv.classList.add('relative', 'flex', 'justify-center', 'align-ceter', 'w-8', 'h-12', 'md:w-16', 'md:h-24', 'bg-white', 'rounded', 'shadow', 'text-center');
          cardDiv.innerHTML = `
          <img src="${card.suit}.png" class="h-4 md:h-8 m-auto" />
          <span class="absolute top-0 left-1 text-xs md:text-xl md:mt-2">${card.rank}</span>
          `;
        }
      }
      cardConteiner.appendChild(cardDiv);
    });
  }

  public renderLogs(logs: string[]) {
    const logContainer = document.getElementById('log');
    if (!logContainer) {
      console.log('error in renderLogs');
      return;
    }

    logs.forEach((log) => {
      logContainer.innerHTML += `
      <p class="text-white text-sm md:text-lg">${log}</p>
      `;
    });
  }

  public updateStatus(player: Player, status: Status) {
    const statusDiv = document.getElementById(player.name + '-status');
    if (!statusDiv) {
      console.log('error in updateStatus');
      return;
    }

    if (player.isGameOver) {
      statusDiv.innerHTML = `<span class="rounded-full px-2 bg-red-500 shadow-lg text-white text-xs md:text-sm uppercase">GAME OVER</span>`;
      return;
    }

    if (status === 'stand') {
      statusDiv.innerHTML = `<span class="rounded-full px-2 bg-yellow-500 shadow-lg text-white text-xs md:text-sm">stand</span>`;
    } else if (status === 'hit') {
      statusDiv.innerHTML = `<span class="rounded-full px-2 bg-blue-500 shadow-lg text-white text-xs md:text-sm uppercase">hit</span>`;
    } else if (status === 'surrender') {
      statusDiv.innerHTML = `<span class="rounded-full px-2 bg-red-500 shadow-lg text-white text-xs md:text-sm uppercase">surrender</span>`;
    } else if (status === 'double') {
      statusDiv.innerHTML = `<span class="rounded-full px-2 bg-purple-500 shadow-lg text-white text-xs md:text-sm uppercase">double</span>`;
    } else if (status === 'bust') {
      statusDiv.innerHTML = `<span class="rounded-full px-2 bg-red-500 shadow-lg text-white text-xs md:text-sm uppercase">bust</span>`;
    } else if (status === 'blackjack') {
      statusDiv.innerHTML = `<span class="rounded-full px-2 bg-gray-800 shadow-lg text-white text-xs md:text-sm uppercase">BJ</span>`;
    } else if (status === null) {
      statusDiv.innerHTML = ``;
    }
  }
  // ユーザーのチップを更新
  public updateChips(player: Player) {
    const playerMoneySpan = document.getElementById(player.name + '-money');
    if (!playerMoneySpan) {
      console.log('error in updateChips notFound span');
      return;
    }
    if (!player.chips) {
      console.log('error in updateChips not found chips');
      return;
    }
    playerMoneySpan.textContent = String(player.chips);
  }

  // playerのベットを更新
  public updateBet(player: Player) {
    const playerBet = document.getElementById(player.name + '-betmoney');
    if (!playerBet) return;
    if (!player.chips) return;

    // ベットが０の時はDOMを削除
    if (player.betAmount === 0) {
      playerBet.classList.add('hidden');
      return;
    }
    playerBet.textContent = String(player.betAmount);
  }

  // operationを更新
  public updateOperation(player: Player) {
    const surrenderBtn = document.getElementById('surrender');
    const standBtn = document.getElementById('stand');
    const hitBtn = document.getElementById('hit');
    const doubleBtn = document.getElementById('double');

    if (player.getHandScore() === 21 || player.status === 'stand' || player.status === 'double' || player.status === 'surrender' || player.status === 'bust' || player.status === 'blackjack') {
      surrenderBtn?.setAttribute('disabled', 'true');
      standBtn?.setAttribute('disabled', 'true');
      hitBtn?.setAttribute('disabled', 'true');
      doubleBtn?.setAttribute('disabled', 'true');
    } else {
      surrenderBtn?.setAttribute('disabled', 'true');
      doubleBtn?.setAttribute('disabled', 'true');
    }
  }
}
