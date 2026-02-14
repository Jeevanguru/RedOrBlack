import { Suit, Card } from "../../interfaces/index.js";

const suits: Suit[] = [
    { name: 'Diamonds', color: 'red' },
    { name: 'Hearts', color: 'red' },
    { name: 'Clubs', color: 'black' },
    { name: 'Spades', color: 'black' },
];

const ranks: string[] = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];

const deck: Card[] = [];

for (const suit of suits) {
    for (const rank of ranks) {
        deck.push({
            rank,
            suit: suit.name,
            color: suit.color,
        });
    }
}

function shuffle(arr: Card[]) :Card[] {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export function getRandomCard(): Card {
    const shuffledDeck = shuffle(deck);
    const index = Math.floor(Math.random() * shuffledDeck.length);
    return shuffledDeck[index];
}