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

		this.updateDisplay();
	}
	
	attachTo (container) {
		container.appendChild(this.cardElement);
	}
	
	updateDisplay () {
		this.cardBack.style.display = this.show ? 'none' : 'block';
		this.cardFront.style.display = this.show ? 'flex' : 'none';
	}
	
	flip () {
		this.show = !this.show;
		this.updateDisplay();
	}
	
	disable () {
		this.cardBack.style.display = 'none';
		this.cardFront.style.display = 'none';
		this.cardElement.removeEventListener('click', this.onClick);
	}
}

class CardGrid {
	constructor ({
		numberOfColumns,
		numberOfRows
	}) {
		const root = document.documentElement;
		root.style.setProperty('--card-columns', numberOfColumns);
		root.style.setProperty('--card-rows', numberOfRows);
		
		const deck = symbols.concat(symbols);
		
		this.cards = [];
		this.selected = [];
		this.solveTimer = null;
		
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
	
	flipCard (card) {
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
	
	checkSelection () {
		const moveSuccessful = this.selected[0].symbol === this.selected[1].symbol;
		
		if (moveSuccessful) {
			for (const card of this.selected) {
				card.disable();
				
				const index = this.cards.indexOf(card);
				
				if (index !== -1) {
					this.cards.splice(index, 1);
				}
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
	constructor () {
		this.cardsContainer = document.getElementById('cards');
	}
	
	restart (numberOfColumns, numberOfRows) {
		this.cards = new CardGrid({
			numberOfColumns,
			numberOfRows
		});
		this.cards.attachTo(this.cardsContainer);
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

class MemoryGame {
	constructor () {
		this.content = document.getElementById('content');

		this.cardsView = new CardsView();
		this.cardsView.attachTo(this.content);

		this.cardsView.show();
	}
	
	restartGame () {
		let columns = 8;
		let rows = 5;
		
		if (screen.orientation.type === 'portrait-primary' || screen.orientation.type === 'portrait-secondary') {
			const tmp = columns;
			columns = rows;
			rows = tmp;
		}

		this.cardsView.restart(columns, rows)
	}
}

window.addEventListener('load', () => {
	const game = new MemoryGame();
	game.restartGame();
})
