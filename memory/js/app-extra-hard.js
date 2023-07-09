/*
This implementation of a memory game uses a few concepts you should know about before diving into the code.

# Sepration of concerns #

Each class is responsible for a single "thing", usually a feature or even just part of a feature.

For example the Highscores feature is divded into multiple classes with certain responsibilites:
Highscore: This class is responsible for just storing the data associated with a single highscore (currently name and
           score).
Highscores: This class is responsible for keeping track of all highscores that are needed for the highscore list
            (currently the 10 highest). It also covers making the highscores persistent over multiple sessions and page
			reloads.
HighscoreLine: This class is responsible for rendering a highscore in HTML and attaching it to the correct place in the
               DOM. It uses a template that it instantiates instead of creating the elements from javascript.
HighscoresList: This class is responsible for rendering the complete highscores list in HTML.
HighscoresView: This class is responsible for rendering the complete highscores view in HTML, combining the highscores
                list and all other features that are required for the highscores view.

# Using callbacks to components more independent #

Making components independent (also called decoupling) is a basic technique to keep them small, understandable and
maintainable.

A Callback is a function provided as a parameter by the caller of a function that the function calls to inform the
caller about certain events during execution (it refers back to the caller, that's where name ist comes from). The
most common use cases for callbacks are event handlers.

For example the HighscoresView takes a callback as parameter onPlayAgain in the constructor. The callback is triggered
by HighscoresView when a user clicks on the play again button. The HighscoresView does not care about clicks on the
play again button, but is responsible for keeping track of it, because it is part of the view. By providing the
callback parameter, HighscoresView has the possibility to inform the creator of the view object that the click happend.
In return the creator of HighscoresView does not need to know how to access the play again button inside the view. Now
when changing the play again button, we only need to modify the HighscoresView and the creator does not care, as long
as the callback is called somehow and the HighscoresView does not need to care about what happens when the player
clicks on the play again button because it can delegate the responsibility to someone else.

In more complex projects we would use events instead of callbacks to decouple components, but in our case it is
sufficient.
*/

/*
Utility function to prepend a character to a string until it reaches a certain length.
*/
function padLeft (value, count, character = ' ') {
	return (Array.from({ length: count + 1 }).join(character) + value).slice(-count);
}

/*
Utility function to format a time value in milliseconds as mm:ss. Drops the milliseconds part.
*/
function formatTime (value) {
	const seconds = Math.floor(value / 1000);
	const minutes = Math.floor(seconds / 60);
	return padLeft(minutes, 2, '0') + ':' + padLeft(seconds % 60, 2, '0');
}

/*
Names of the Fontawesome symbols used on the front of the cards.
See https://fontawesome.com/search
*/
const symbols = [
	'heart',
	'star',
	'bomb',
	'cloud',
	'face-smile',
	'car',
	'ghost',
	'camera',
	'fire',
	'gear',
	'lemon',
	'droplet',
	'flask',
	'palette',
	'bug',
	'shirt',
	'cross',
	'hammer',
	'rocket',
	'square',
	'fish',
	'mug-hot',
	'sun',
	'music',
	'leaf',
	'moon',
	'train',
	'ship',
	'lightbulb',
	'tooth',
	'spider',
	'skull',
	'shoe-prints',
	'sailboat',
	'poop'
];

const difficulties = {
	easy: {
		columns: 6,
		rows: 5,
		pairs: 15
	},
	medium: {
		columns: 8,
		rows: 5,
		pairs: 20
	},
	hard: {
		columns: 9,
		rows: 6,
		pairs: 25
	},
	'extra-hard': {
		columns: 10,
		rows: 7,
		pairs: 35
	}
}

const localStoragePrefix = 'hfg-memory__';
const highscoresLocalStorageKey = localStoragePrefix + 'highscores';

function sortByScore (left, right) {
	if (left.score < right.score) {
		return 1;
	} else if (left.score > right.score) {
		return -1;
	} else {
		return 0;
	}
}

function instantiateTemplate (selector) {
	const template = document.querySelector('#templates ' + selector);
	
	return template.cloneNode(true);
}

class SoundController {
	constructor () {
		this.flipSound = document.getElementById('card-flip-sound');
	}
	
	playFlipSound () {
		this.flipSound.volume = 0.3;
		this.flipSound.currentTime = 0;
		this.flipSound.play();
	}
}

class Highscore {
	constructor (name, score) {
		this.name = name;
		this.score = score;
	}
}

class HighscoreLine {
	constructor (place) {
		const template = instantiateTemplate('.highscore-line');
		
		this.placeElement = template.querySelector('.place');
		this.placeElement.innerHTML = place + '.';
		
		this.scoreElement = template.querySelector('.score');
		this.nameElement = template.querySelector('.name');
	}
	
	update (highScore) {
		if (highScore) {
			const { name, score } = highScore;
			
			this.scoreElement.innerHTML = score;
			this.nameElement.innerHTML = name;
		} else {
			this.scoreElement.innerHTML = '';
			this.nameElement.innerHTML = '';
		}
	}
	
	/*
	Usually we would attach the whole instantiated template to the container, but we use a flex grid to display the
	highscores as a table, so we need to add the elements individually.
	*/
	attachTo (container) {
		container.appendChild(this.placeElement);
		container.appendChild(this.scoreElement);
		container.appendChild(this.nameElement);
	}
}

class Highscores {
	constructor (
		maxNumberOfEntries = 10
	) {
		this.maxNumberOfEntries = maxNumberOfEntries;
		this.scores = []
		
		this.restoreScores();
	}
	
	add (highScore) {
		this.scores.push(highScore);
		this.scores.sort(sortByScore);
		this.scores = this.scores.slice(0, this.maxNumberOfEntries);

		this.storeScores();
	}
	
	restoreScores () {
		this.scores = JSON.parse(localStorage.getItem(highscoresLocalStorageKey) || '[]');
	}
	
	storeScores () {
		localStorage.setItem(highscoresLocalStorageKey, JSON.stringify(this.scores));
	}
}

class HighscoresList {
	constructor (highscores) {
		this.highscores = highscores;
		
		this.lines = Array.from({ length: highscores.maxNumberOfEntries }, (_, index) => new HighscoreLine(index + 1))
	}
	
	update () {
		for (let i = 0; i < this.lines.length; i++) {
			const line = this.lines[i];
			const highScore = this.highscores.scores[i];
			
			line.update(highScore);
		}
	}
	
	attachTo (container) {
		for (const line of this.lines) {
			line.attachTo(container);
		}
	}
}

class HighscoresView {
	constructor (
		onPlayAgain,
		highscores
	) {
		this.highscoresContainer = document.getElementById('highscores');
		
		const highscoresListContainer = this.highscoresContainer.querySelector('.highscores-list');
		this.highscoresList = new HighscoresList(highscores);
		this.highscoresList.attachTo(highscoresListContainer);
		
		this.playAgain = this.highscoresContainer.querySelector('button');
		this.playAgain.addEventListener('click', () => onPlayAgain());
	}
	
	attachTo (container) {
		container.appendChild(this.highscoresContainer);
	}
	
	update () {
		this.highscoresList.update();
	}
	
	show () {
		this.highscoresContainer.style.display = 'flex';
	}
	
	hide () {
		this.highscoresContainer.style.display = 'none';
	}
}

class Card {
	constructor ({
		symbol,
		onClick,
		index,
		onFlip,
		onDeal,
		onRemove
	}) {
		this.symbol = symbol;
		this.index = index;
		this.show = false;
		this.onClick = onClick;
		this.onFlip = onFlip;
		this.onDeal = onDeal;
		this.onRemove = onRemove;
		
		this.cardElement = instantiateTemplate('.cards-container');
		this.cardElement.addEventListener('click', onClick);
		
		this.cardBack = this.cardElement.querySelector('.card');
		this.cardFront = this.cardElement.querySelector('.symbol');
		
		const cardImage = this.cardFront.querySelector('i');
		cardImage.classList.add('fa-' + symbol);
	}
	
	attachTo (container) {
		container.appendChild(this.cardElement);
	}
	
	flip () {
		this.show = !this.show;
		const mode = this.show ? 'flip' : 'flip-back';

		this.cardBack.classList.remove('flip', 'flip-back');
		this.cardBack.classList.add(mode);
		
		this.cardFront.classList.remove('flip', 'flip-back');
		this.cardFront.classList.add(mode);

		this.onFlip();
	}
	
	remove () {
		this.cardBack.style.display = 'none';
		this.cardElement.removeEventListener('click', this.onClick);
		this.cardFront.style.transform = 'translate(0, 0)';
		this.cardFront.style.transition = 'transform 0.5s';

		this.onRemove();
		
		/*
		We need this timeout zero so the transition animation can be played correctly. Between setting the start state
		for the animation and setting the end state there has to be at least one processing tick in the browser to
		trigger the transition animation.
		*/
		setTimeout(() => {
			const bounds = this.cardFront.getBoundingClientRect();
			const center = (document.documentElement.clientWidth - bounds.width) / 2 - bounds.left;
			
			this.cardFront.style.transform = 'translate(' + center + 'px, ' + (-bounds.bottom) + 'px)';
			
			const dealTransformationHandler = () => {
				this.cardFront.removeEventListener('transitionend', dealTransformationHandler);
				this.cardFront.style.display = 'none';
			}
			
			this.cardFront.addEventListener('transitionend', dealTransformationHandler);
		}, 0);
	}
	
	deal (delay) {
		return new Promise((resolve, reject) => {
			/*
			We need this timeout zero so the browser has time to attach the card to the DOM and we get a correct value
			for getBoundingClientRect().
			*/
			setTimeout(() => {
				const bounds = this.cardBack.getBoundingClientRect();
				this.cardBack.style.transform = 'translate(' + (-bounds.left) + 'px, ' + (-bounds.bottom) + 'px)';
				
				setTimeout(() => {
					this.cardBack.style.transform = 'translate(0, 0)';
					this.cardBack.style.transition = 'transform 0.5s';
					
					const dealTransformationHandler = () => {
						this.cardBack.removeEventListener('transitionend', dealTransformationHandler);
						this.cardBack.style.removeProperty('transform');
						this.cardBack.style.removeProperty('transition');
						resolve();
					}
					
					this.cardBack.addEventListener('transitionend', dealTransformationHandler);

					this.onDeal();
				}, delay);
			}, 0);
		})
	}
}

class CardGrid {
	constructor ({
		numberOfColumns,
		numberOfRows,
		numberOfPairs,
		onScore,
		onMove,
		onFinish,
		onCardFlipped,
		onCardDealt,
		onCardRemoved
	}) {
		const root = document.documentElement;
		root.style.setProperty('--card-columns', numberOfColumns);
		root.style.setProperty('--card-rows', numberOfRows);
		
		const usedSymbols = symbols.slice(0, numberOfPairs);
		const deck = usedSymbols.concat(usedSymbols);
		
		this.cards = [];
		this.selected = [];
		this.solveTimer = null;
		this.onScore = onScore;
		this.onMove = onMove;
		this.onFinish = onFinish;
		this.cardsDealt = false;
		this.enabled = true;
		
		for (let i = 0; i < numberOfRows && deck.length > 0; i++) {
			for (let j = 0; j < numberOfColumns && deck.length > 0; j++) {
				const deckIndex = Math.floor(Math.random() * deck.length);
				const symbol = deck[deckIndex];
				deck.splice(deckIndex, 1);
				
				const card = new Card({
					symbol,
					onClick: () => {
						if (this.enabled) {
							this.flipCard(card);
						}
					},
					index: i * numberOfColumns + j,
					onFlip: () => onCardFlipped(card),
					onDeal: () => onCardDealt(card),
					onRemove: () => onCardRemoved(card)
				});
				this.cards.push(card);
			}
		}
	}
	
	attachTo (container) {
		container.replaceChildren();
		
		for (const card of this.cards) {
			card.attachTo(container);
		}
	}
	
	deal () {
		if (!this.cardsDealt) {
			return Promise.all(
				this.cards.map(
					(card, index) => card.deal(index * 200)
				)
			)
				.then(() => {
					this.cardsDealt = true;
				});
		} else {
			return Promise.resolve();
		}
	}
	
	flipCard (card) {
		if (this.cardsDealt) {
			if (this.selected.length < 2 && !this.selected.includes(card)) {
				this.selected.push(card);
				card.flip();
			}
			
			if (this.selected.length === 2 && this.solveTimer === null) {
				this.solveTimer = setTimeout(() => {
					this.solveTimer = null;
					this.checkSelection();
				}, 1000);
			}
		}
	}
	
	checkSelection () {
		const moveSuccessful = this.selected[0].symbol === this.selected[1].symbol;		

		if (moveSuccessful) {
			if (typeof this.onScore === 'function') {
				this.onScore();
			}
			
			for (const card of this.selected) {
				card.remove();
				
				const index = this.cards.indexOf(card);
				
				if (index !== -1) {
					this.cards.splice(index, 1);
				}
			}

			if (this.cards.length === 0 && typeof this.onFinish === 'function') {
				this.onFinish();
			}
		} else {
			for (const card of this.selected) {
				card.flip();
			}
		}
		
		this.selected = [];
		
		this.onMove(moveSuccessful);
	}
	
	enable () {
		this.enabled = true;
	}
	
	disable () {
		this.enabled = false;
	}
	
	flipCardByIndex (selectedIndex) {
		const card = this.cards.find(({ index }) => index === selectedIndex);
		
		if (card) {
			this.flipCard(card);
		}
	}
}

class CardsView {
	constructor ({
		onScore,
		onMove,
		onFinish,
		onCardFlipped,
		onCardDealt,
		onCardRemoved
	}) {
		this.onScore = onScore;
		this.onMove = onMove;
		this.onFinish = onFinish;
		this.onCardFlipped = onCardFlipped;
		this.onCardDealt = onCardDealt;
		this.onCardRemoved = onCardRemoved;
		
		this.cardsContainer = document.getElementById('cards');
	}
	
	restart (numberOfColumns, numberOfRows, numberOfPairs) {
		this.cards = new CardGrid({
			numberOfColumns,
			numberOfRows,
			numberOfPairs,
			onScore: () => this.onScore(),
			onMove: (successful) => this.onMove(successful),
			onFinish: () => this.onFinish(),
			onCardFlipped: (card) => this.onCardFlipped(card),
			onCardDealt: (card) => this.onCardDealt(card),
			onCardRemoved: (card) => this.onCardRemoved(card)
		});
		this.cards.attachTo(this.cardsContainer);
		return this.cards.deal();
	}
	
	attachTo (container) {
		container.appendChild(this.cardsContainer);
	}
	
	show () {
		this.cardsContainer.style.display = 'grid';
	}
	
	hide () {
		this.cardsContainer.style.display = 'none';
	}
	
	enable () {
		this.cards.enable();
	}
	
	disable () {
		this.cards.disable();
	}
	
	flipCardByIndex (index) {
		this.cards.flipCardByIndex(index);
	}
}

class Player {
	constructor (name, isHuman) {
		this.name = name;
		this.isHuman = isHuman;
		this.score = 0;
		this.moves = 0;
	}
	
	addScore (score) {
		this.score += score;
	}
	
	addMoves (moves) {
		this.moves += moves;
	}
	
	reset () {
		this.moves = 0;
		this.score = 0;
	}
}

let playerViewCount = 0;

class PlayerView {
	constructor (player, index, onRemove) {
		this.player = player;
		
		this.viewId = playerViewCount;
		playerViewCount++;
		this.humanPlayerName = '';

		this.playerViewContainer = instantiateTemplate('.player-input');
		
		this.playerLabel = this.playerViewContainer.querySelector('.player-label');
		
		this.playerNameInput = this.playerViewContainer.querySelector('.player-name');
		this.playerNameInput.value = this.player.name;
		this.playerNameInput.addEventListener('change', () => this.player.name = this.playerNameInput.value);
		
		this.removeButton = this.playerViewContainer.querySelector('.remove-button');
		this.removeButton.addEventListener('click', () => onRemove());

		this.aiPlayerCheckbox = this.playerViewContainer.querySelector('.human-ai-switch');
		this.aiPlayerCheckbox.id = 'human-ai-switch-' + this.viewId;
		this.aiPlayerCheckbox.addEventListener('change', () => this.toggleAi());
		this.aiPlayerCheckboxLabel = this.playerViewContainer.querySelector('label');
		this.aiPlayerCheckboxLabel.setAttribute('for', this.aiPlayerCheckbox.id);

		this.updateIndex(index);
	}
	
	updateIndex (index, removeButtonEnabled) {
		this.playerLabel.innerHTML = 'Player ' + (index + 1) + ' Name:';
		this.removeButton.style.display = removeButtonEnabled ? 'flex' : 'none';
	}
	
	toggleAi () {
		if (this.aiPlayerCheckbox.checked) {
			this.humanPlayerName = this.player.name;
			this.player.name = 'Computer ' + (this.viewId + 1);
			this.playerNameInput.value = this.player.name;
			this.player.isHuman = false;
			this.playerNameInput.setAttribute('disabled', 'disabled');
		} else {
			this.player.name = this.humanPlayerName;
			this.playerNameInput.value = this.player.name;
			this.player.isHuman = true;
			this.playerNameInput.removeAttribute('disabled');
		}
	}
	
	attachTo (container) {
		container.appendChild(this.playerViewContainer);
	}
	
	removeFrom (container) {
		container.removeChild(this.playerViewContainer);
	}
}

class PlayersList {
	constructor (container) {
		this.nextPlayerIndex = 0;
		this.container = container;
		
		this.players = [];
		this.playerViews = [];
	
		this.addPlayer();
	}

	addPlayer () {
		const newPlayer = new Player('Player ' + (this.nextPlayerIndex + 1), true);
		const newPlayerView = new PlayerView(
			newPlayer,
			this.players.length,
			() => {
				const index = this.players.indexOf(newPlayer);
				
				if (index !== -1) {
					this.players.splice(index, 1);
					this.playerViews.splice(index, 1);
					newPlayerView.removeFrom(this.container);
					
					for (let i = 0; i < this.playerViews.length; i++) {
						this.playerViews[i].updateIndex(i, this.players.length > 1);
					}
				}
			}
		);

		newPlayerView.attachTo(this.container);

		this.players.push(newPlayer);
		this.playerViews.push(newPlayerView);
		
		for (let i = 0; i < this.playerViews.length; i++) {
			this.playerViews[i].updateIndex(i, this.players.length > 1);
		}
		
		this.nextPlayerIndex++;
	}
	
	getPlayers () {
		return this.players;
	}
}

class StartGameView {
	constructor (onStartGame, onShowHighscore) {
		this.startGameContainer = document.getElementById('start-game-view');
		const showHighscoreListButton = document.getElementById('show-highscore-list');
		showHighscoreListButton.addEventListener('click', () => onShowHighscore());
		
		const playerSelection = document.getElementById('player-selection');
		this.playersList = new PlayersList(playerSelection);
		
		const addPlayerButton = document.getElementById('add-player');
		addPlayerButton.addEventListener('click', () => this.playersList.addPlayer());
		
		for (const difficulty of Object.keys(difficulties)) {
			const startGameButton = document.getElementById('start-game-' + difficulty);
			startGameButton.addEventListener('click', () => onStartGame(difficulty, this.playersList.getPlayers()));
		}
	}
	
	attachTo (container) {
		container.appendChild(this.startGameContainer);
	}
	
	show () {
		this.startGameContainer.style.display = 'flex';
	}
	
	hide () {
		this.startGameContainer.style.display = 'none';
	}
}

class EnterHighscoreView {
	constructor (onScoreAdded) {
		this.winningPlayer = null;
		this.enterHighscoreContainer = document.getElementById('enter-highscore-view');
		this.winnerNameDisplay = document.getElementById('winner-name');
		this.achievedScoreDisplay = document.getElementById('achieved-score');
		this.achievedTimeDisplay = document.getElementById('achieved-time');
		this.usedMovesDisplay = document.getElementById('used-moves');
		this.highscoreNameInput = document.getElementById('highscore-name');
		this.enterHighscoreButton = document.getElementById('enter-highscore');
		this.enterHighscoreButton.addEventListener('click', () => {
			onScoreAdded(this.highscoreNameInput.value, this.winningPlayer);
		});
	}
	
	attachTo (container) {
		container.appendChild(this.enterHighscoreContainer);
	}
	
	show (winningPlayer, time) {
		const { name, score, moves } = winningPlayer;
		
		this.winningPlayer = winningPlayer;
		this.highscoreNameInput.value = name;
		this.winnerNameDisplay.innerHTML = name + ' won!'
		this.achievedScoreDisplay.innerHTML = 'Your Score: ' + score;
		this.achievedTimeDisplay.innerHTML = 'Your Time: ' + formatTime(time);
		this.usedMovesDisplay.innerHTML = 'Used Moves: ' + moves;
		this.enterHighscoreContainer.style.display = 'flex';
	}
	
	hide () {
		this.enterHighscoreContainer.style.display = 'none';
	}
}

class MemoryGame {
	constructor () {
		this.gameRunning = false;
		this.gameStartTime = 0;
		this.gameScore = 0;
		this.usedMoves = 0;
		this.playTime = 0;
		this.currentPlayer = 0;
		this.players = [];

		this.content = document.getElementById('content');
		this.scoreDisplay = document.getElementById('score');
		this.timerDisplay = document.getElementById('timer');
		this.aiPlayerController = new AiPlayerController();
		this.soundController = new SoundController();
		this.highscores = new Highscores();
		
		this.cardsView = new CardsView({
			onScore: () => this.addScore(1),
			onMove: (successful) => {
				this.addMoves(1);
				this.finishMove(successful);
			},
			onFinish: () => {
				this.addMoves(1);
				this.stopGame();
			},
			onCardFlipped: (card) => {
				this.soundController.playFlipSound();
				this.aiPlayerController.onCardFlipped(card);
				
				if (
					this.aiPlayerController.continueTurn()
					&& !this.players[this.currentPlayer].isHuman
				) {
					this.doAiTurn();
				}
			},
			onCardDealt: (card) => {
				this.soundController.playFlipSound();
			},
			onCardRemoved: (card) => {
				this.soundController.playFlipSound();
				this.aiPlayerController.onCardRemoved(card);
			}
		});
		this.cardsView.attachTo(this.content);
		
		this.startGameView = new StartGameView(
			(difficulty, players) => this.restartGame(difficulty, players),
			() => this.showView(this.highscoresView)
		);
		this.startGameView.attachTo(this.content);

		this.highscoresView = new HighscoresView(
			() => this.selectDifficulty(),
			this.highscores
		);
		this.highscoresView.attachTo(this.content);

		this.enterHighscore = new EnterHighscoreView((name, winningPlayer) => this.addHighscore(name, winningPlayer));
		this.enterHighscore.attachTo(this.content);
		
		this.showView(this.startGameView);
	}
	
	restartGame (difficulty, players) {
		let {
			columns,
			rows,
			pairs
		} = difficulties[difficulty];

		if (screen.orientation.type === 'portrait-primary' || screen.orientation.type === 'portrait-secondary') {
			const tmp = columns;
			columns = rows;
			rows = tmp;
		}

		this.cardsView.restart(columns, rows, pairs).then(() => {
			this.startTimer();
			
			if (this.players[this.currentPlayer].isHuman) {
				this.cardsView.enable();
			} else {
				this.cardsView.disable();
			}
			
			if (!this.players[this.currentPlayer].isHuman) {
				this.doAiTurn();
			}
		});
		
		this.aiPlayerController.startGame(pairs * 2);
		this.startGame(players);
	}
	
	selectDifficulty () {
		this.showView(this.startGameView);
	}
	
	startGame (players) {
		this.currentPlayer = 0;
		this.players = players;
		this.playTime = 0;
		this.updateScoreDisplay();
		
		for (const player of this.players) {
			player.reset();
		}

		this.showView(this.cardsView);
	}
	
	stopGame () {
		this.gameRunning = false;
		
		let winningPlayer = this.players[0];
		
		for (let i = 1; i < this.players.length; i++) {
			const player = this.players[i];
			
			if (player.score > winningPlayer.score) {
				winningPlayer = player;
			}
		}
		
		this.showView(
			this.enterHighscore,
			winningPlayer,
			this.playTime
		);
	}
	
	startTimer () {
		this.gameRunning = true;
		this.gameStartTime = performance.now();
		this.tickTimer();
	}
	
	tickTimer (timestamp) {
		const deltaTime = timestamp - this.gameStartTime;
		this.playTime = deltaTime;
		this.timerDisplay.innerHTML = formatTime(deltaTime);
		
		if (this.gameRunning) {
			window.requestAnimationFrame((timestamp) => this.tickTimer(timestamp));
		}
	}
	
	addScore (score) {
		this.players[this.currentPlayer].addScore(score);
		this.updateScoreDisplay();
	}
	
	addMoves (moves) {
		this.players[this.currentPlayer].addMoves(moves);
	}
	
	finishMove (successful) {
		if (!successful) {
			this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
			
			if (this.players[this.currentPlayer].isHuman) {
				this.cardsView.enable();
			} else {
				this.cardsView.disable();
			}
			
			this.updateScoreDisplay();
		}
		
		if (!this.players[this.currentPlayer].isHuman) {
			this.doAiTurn();
		}
	}
	
	updateScoreDisplay () {
		const { name, score } = this.players[this.currentPlayer]
		this.scoreDisplay.innerHTML = 'Score ' + name + ': ' + score;
	}
	
	addHighscore (name, { score }) {
		this.highscores.add(new Highscore(name, score));
		this.highscoresView.update();
		this.showView(this.highscoresView);
	}
	
	showView (view, ...showParameters) {
		this.startGameView.hide();
		this.cardsView.hide();
		this.highscoresView.hide();
		this.enterHighscore.hide();
		
		view.show(...showParameters);
		
		this.content.style.overflow = view === this.startGameView ? 'auto' : 'hidden';
	}
	
	doAiTurn () {
		const chosenCardIndex = this.aiPlayerController.chooseCard();
		this.cardsView.flipCardByIndex(chosenCardIndex);
	}
}

/*
This AI controller implements a simple strategy.

When it is the AI player's turn:
1. Uncover all known pairs.
2. If we do not know which cards form a pair, flip a random card that was not yet uncovered.
3.a) If we know the position of the second card of this pair, flip it.
3.b) Otherwise flip a random card that was already flipped before.

By only using the values of cards that were flipped at least once, we make sure the AI player does not know more than
a human player.
*/
class AiPlayerController {
	constructor () {
		this.knownCards = [];
		this.flippedCards = [];
	}
	
	startGame (numberOfCards) {
		this.knownCards = Array.from({ length: numberOfCards }, () => null);
	}
	
	onCardFlipped (card) {
		const { index } = card;
		this.knownCards[index] = card.symbol;
		
		const position = this.flippedCards.indexOf(index);
		if (position !== -1) {
			this.flippedCards.splice(position, 1);
		} else {
			this.flippedCards.push(index);
		}
	}
	
	onCardRemoved (card) {
		const { index } = card;
		this.knownCards[index] = undefined;

		const position = this.flippedCards.indexOf(index);
		if (position !== -1) {
			this.flippedCards.splice(position, 1);
		}
	}
	
	chooseCard () {
		const availableCards = this.knownCards.map((value, index) => index).filter((index) => this.knownCards[index] !== undefined && !this.flippedCards.includes(index));
		const knownSymbols = availableCards.filter((index) => this.knownCards[index] !== null);
		const unknownCards = availableCards.filter((index) => this.knownCards[index] === null);
		
		if (this.flippedCards.length === 1) {
			const pairCard = knownSymbols.find((symbol) => this.knownCards[symbol] === this.knownCards[this.flippedCards[0]])
			
			if (pairCard !== null && pairCard !== undefined) {
				return pairCard
			} else if (knownSymbols.length > 0) {
				const card = knownSymbols[Math.floor(Math.random() * knownSymbols.length)];
				return card;
			} else {
				const card = unknownCards[Math.floor(Math.random() * unknownCards.length)];
				return card;
			}
		} else {
			let pairFound = false;
			const pair = [];
			
			for (let i = 0; i < knownSymbols.length - 1 && !pairFound; i++) {
				for (let j = i + 1; j < knownSymbols.length && !pairFound; j++) {
					if (this.knownCards[knownSymbols[i]] === this.knownCards[knownSymbols[j]]) {
						pairFound = true;
						pair[0] = knownSymbols[i];
						pair[1] = knownSymbols[j];
					}
				}
			}
			
			if (pairFound) {
				return pair[0];
			} else {
				const card = unknownCards[Math.floor(Math.random() * unknownCards.length)];
				return card;
			}
		}
	}
	
	continueTurn () {
		return this.flippedCards.length < 2;
	}
}

window.addEventListener('load', () => {
	const game = new MemoryGame();
})
