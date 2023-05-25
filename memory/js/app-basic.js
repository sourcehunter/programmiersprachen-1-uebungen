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

class Card {
	constructor (symbol, onClick) {
		this.symbol = symbol;
		this.show = false;
		this.onClick = onClick;
		
		this.cardElement = document.createElement('div');
		this.cardElement.classList.add('cards-container');
		this.cardElement.addEventListener('click', onClick);
		
		this.cardBack = document.createElement('div');
		this.cardBack.classList.add('card');

		this.cardFront = document.createElement('div');
		this.cardFront.classList.add('symbol');
		this.cardFront.innerHTML = '<i class="fa-solid fa-' + symbol + '"></i>';
		
		this.cardElement.appendChild(this.cardBack);
		this.cardElement.appendChild(this.cardFront);
		
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
	constructor (numberOfColumns, numberOfRows) {
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
				
				const card = new Card(symbol, () => this.cardFlip(card));
				this.cards.push(card);
			}
		}
	}
	
	attachTo (container) {
		for (const card of this.cards) {
			card.attachTo(container);
		}
	}
	
	cardFlip (card) {
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
		if (this.selected[0].symbol === this.selected[1].symbol) {
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

window.addEventListener('load', () => {
	let columns = 8;
	let rows = 5;

	if (screen.orientation.type === 'portrait-primary' || screen.orientation.type === 'portrait-secondary') {
		columns = 5;
		rows = 8;
	}

	const cardsGrid = document.querySelector('.cards');
	const cards = new CardGrid(columns, rows);
	cards.attachTo(cardsGrid);
})
