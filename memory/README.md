# Memory (Final Project)
Memory is a card game where the player (or players) have to find pairs between laid out cards. The cards ar turned on their back and a player is only allowed to turn two cards on their front at the same time. When the symbols or images on the cards match, they are removed from the game and counted as points and the player can continue their round. When they don't match, they are turned back on their back and it is the next player's turn.
- https://en.wikipedia.org/wiki/Concentration_(card_game)
- https://de.wikipedia.org/wiki/Memory_(Spiel)

## Basic
1. Create a playing field of cards of 20 pairs shuffled and laid out in a grid of 8x5 cards with their backs facing the player.
2. Let the player click on a card to turn it on the face side. The player cannot turn a card that is face up on its back.
3. When a player has turned two cards on their face side, compare their symbol: if the symbol is the same, remove the cards from the game, otherwise turn them on their back again.
4. Choose the symbols or images on the face side of the cards to your own liking.
5. Create a responsive design, so that when the screen size changes, everything stays visible and is accessible by the player.

## Intermediate
6. Allow the player to restart the game without reloading the page.
7. Keep score of how many cards or pairs the player has successfully collected and display the score.
8. Add a timer that starts running as soon, as the game is started and stops as soon as the player has collected the last pair. Display the timer as minutes and seconds in ##:## format.
9. Add animations for:
	- flipping a card
	- collecting a matching pair
	- initially dealing out the cards

## Hard
10. Allow the player to select a difficulty. Choosing a difficulty should modify the number of pairs dealt:
	- easy = 15 pairs
	- medium = 20 pairs
	- hard = 25 pairs
	- extra hard = 35 pairs
11. Add sound effects to:
	- flipping a card
	- collecting a pair
	- dealing cards
12. Display a win screen with the achieved score and used time for the player.
13. Add a 2 player mode where a player can flip two cards as long as those cards match.
	- Let the player select between 1 and 2 player mode in the beginning.
	- When a player flips two non-matching cards the cards will be turn on their back again and his turn ends.
	- On the win screen show which player has won.
14. Add a highscore list.
	- The player can add his name to the highscore list when they finished a game with their score or time.
	- Allow the player to view the top 10 highscore list.

## Exceptionally Hard
15. Allow the player to play against the computer in 2 player (and multiplayer) mode.
	- Let the player select in the beginning if they want to play against a computer or human player.
16. Extend the 2 player mode to allow any number of players chosen by the player.
17. Make the highscores permanent: Save and restore the highscore list between page reloads.

# Grading

- Code a working game including all basic features to reach grade 4.0 - 3.0
- Code a working game including all basic and intermediate features to reach grade 3.0 - 2.0
- Code a working game including all basic, intermediate and min one hard features to reach grade 2.0 - 1.3
- Code a working game including all basic and intermediate features and hard or min one exceptionally hard features to reach a grade higher than 1.3

Differentiation within a grading bracket will be based on:
- readability and understandablity of your code
- code documentation
- well structured git commits and commit messages (at least 1 per feature)

Develop in a separate branch and merge to main or make a pull request to main when you are finished.
