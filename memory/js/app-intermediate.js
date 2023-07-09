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
	'square'
];

function instantiateTemplate (selector) {
	const template = document.querySelector('#templates ' + selector);
	
	return template.cloneNode(true);
}

class Card {
	constructor ({
		symbol,
		onClick
	}) {
		this.symbol = symbol;
		this.show = false;
		this.onClick = onClick;
		
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
	}
	
	remove () {
		this.cardBack.style.display = 'none';
		this.cardElement.removeEventListener('click', this.onClick);
		this.cardFront.style.transform = 'translate(0, 0)';
		this.cardFront.style.transition = 'transform 0.5s';

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
				}, delay);
			}, 0);
		})
	}
}

class CardGrid {
	constructor ({
		numberOfColumns,
		numberOfRows,
		onFinish,
		onScore
	}) {
		const root = document.documentElement;
		root.style.setProperty('--card-columns', numberOfColumns);
		root.style.setProperty('--card-rows', numberOfRows);
		
		const deck = symbols.concat(symbols);
		
		this.cards = [];
		this.selected = [];
		this.solveTimer = null;
		this.onFinish = onFinish;
		this.onScore = onScore;
		this.cardsDealt = false;
		
		for (let i = 0; i < numberOfRows; i++) {
			for (let j = 0; j < numberOfColumns; j++) {
				const deckIndex = Math.floor(Math.random() * deck.length);
				const symbol = deck[deckIndex];
				deck.splice(deckIndex, 1);
				
				const card = new Card({
					symbol,
					onClick: () => this.flipCard(card)
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
					(card, index) => card.deal(index * 100)
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
					this.checkSelection();
					this.solveTimer = null;
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
	}
}

class CardsView {
	constructor ({
		onScore,
		onFinish
	}) {
		this.onScore = onScore;
		this.onFinish = onFinish;
		
		this.cardsContainer = document.getElementById('cards');
	}
	
	restart (numberOfColumns, numberOfRows) {
		this.cards = new CardGrid({
			numberOfColumns,
			numberOfRows,
			onScore: () => this.onScore(),
			onFinish: () => this.onFinish()
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
}

class StartGameView {
	constructor (onStartGame) {
		this.startGameContainer = document.getElementById('start-game-view');
		this.startGameButton = this.startGameContainer.querySelector('.start-game');
	
		this.startGameButton.addEventListener('click', () => onStartGame());
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

class MemoryGame {
	constructor () {
		this.gameRunning = false;
		this.gameStartTime = 0;
		this.gameScore = 0;

		this.content = document.getElementById('content');
		this.scoreDisplay = document.getElementById('score');
		this.timerDisplay = document.getElementById('timer');

		this.cardsView = new CardsView({
			onScore: () => this.addScore(1),
			onFinish: () => this.stopGame()
		});
		this.cardsView.attachTo(this.content);

		this.startGameView = new StartGameView(
			() => this.restartGame()
		);
		this.startGameView.attachTo(this.content);

		this.showView(this.startGameView);
	}
	
	restartGame () {
		let columns = 8;
		let rows = 5;
		
		if (screen.orientation.type === 'portrait-primary' || screen.orientation.type === 'portrait-secondary') {
			const tmp = columns;
			columns = rows;
			rows = tmp;
		}

		this.cardsView.restart(columns, rows).then(() => this.startTimer());

		this.startGame();
	}
	
	startGame () {
		this.gameScore = 0;
		this.updateScoreDisplay();

		this.showView(this.cardsView);
	}
	
	stopGame () {
		this.gameRunning = false;
		
		this.showView(this.startGameView);
	}
	
	startTimer () {
		this.gameRunning = true;
		this.gameStartTime = performance.now();
		this.tickTimer();
	}
	
	tickTimer (timestamp) {
		const deltaTime = timestamp - this.gameStartTime;
		this.timerDisplay.innerHTML = formatTime(deltaTime);
		
		if (this.gameRunning) {
			window.requestAnimationFrame((timestamp) => this.tickTimer(timestamp));
		}
	}
	
	addScore (score) {
		this.gameScore += score;
		this.updateScoreDisplay();
	}
	
	updateScoreDisplay () {
		this.scoreDisplay.innerHTML = 'Score: ' + this.gameScore;
	}

	showView (view, ...showParameters) {
		this.startGameView.hide();
		this.cardsView.hide();
		
		view.show();
	}
}

window.addEventListener('load', () => {
	const game = new MemoryGame();
})
