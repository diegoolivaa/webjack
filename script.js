/**
 * Author: Diego Oliva
 * Project Name: WebJack
 * Date: 12/10/2026
 * Version: 1.0
 */

const startBtn = document.getElementById('start-btn');
const mainMenu = document.getElementById('main-menu');
const gameScreen = document.getElementById('game-screen');
const hitBtn = document.getElementById('hit-btn');
const standBtn = document.getElementById('stand-btn');
const gameMsg = document.getElementById('game-message');
const restartBtn = document.getElementById('restart-btn');
const messageText = document.getElementById('msg-txt');
const bankrollSpan = document.getElementById('bankroll-display');
const currentBetSpan = document.getElementById('current-bet-display');
const playerCardsDiv = document.getElementById('player-cards');
const dealerCardsDiv = document.getElementById('dealer-cards');
const playerScoreSpan = document.getElementById('player-score');
const dealerScoreSpan = document.getElementById('dealer-score');
const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const dealBtn = document.getElementById('deal-btn');

let deck = [];
let playerScore = 0;
let dealerScore = 0;
let playerHand = [];
let dealerHand = [];
let gameInProgress = false;
let gameOver = true;

let bankroll = parseInt(localStorage.getItem('webjack-bankroll')) || 500;
let currentBet = 0;

function saveAndLoadBankroll() {
    try {
        localStorage.setItem('webjack-bankroll', bankroll);
    } catch (e) {}
    updateMoneyDisplay();
}

function addBet(amount) {
    if (!gameInProgress && bankroll >= amount) {
        currentBet += amount;
        bankroll -= amount;
        playSound('chip-sound');
        saveAndLoadBankroll();
    }
}

function clearBet() {
    if (!gameInProgress && currentBet > 0) {
        bankroll += currentBet;
        currentBet = 0;
        saveAndLoadBankroll();
    }
}

function updateMoneyDisplay() {
    if (bankrollSpan) {
        bankrollSpan.textContent = bankroll;
    }
    if (currentBetSpan) {
        currentBetSpan.textContent = currentBet;
    } else {
        const betDisplay = document.getElementById('current-bet-display');
        if (betDisplay) {
            betDisplay.textContent = currentBet;
        }
    }
}

function makeDeck() {
    deck = [];
    for (let suit of suits) {
        for (let value of values) {
            deck.push({ suit: suit, value: value });
        }
    }
}

function shuffleDeck() {
    for (let i = deck.length - 1; i>0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

function calculateScore(hand) {
    let score = 0;
    let aceCount = 0;
    
    for (let card of hand) {
        if (!card) continue;
        
        if (card.value === 'A') {
            aceCount++;
            score += 11;
        } else if (['J', 'Q', 'K', '10'].includes(card.value)) {
            score += 10;
        } else {
            score += parseInt(card.value);
        }
    }
    
    while (score > 21 && aceCount > 0) {
        score -= 10;
        aceCount--;
    }

    return score;
}

function updateBoard() { 
    playerCardsDiv.innerHTML = '';
    dealerCardsDiv.innerHTML = '';

    for (let card of playerHand) {
        let img = document.createElement('img');

        let formattedCard = card.value;
        if (['2','3','4','5','6','7','8','9'].includes(card.value)) {
            formattedCard = '0' + card.value;
        } else {
            formattedCard = card.value.toUpperCase();
        }

        img.src = `./img/card_${card.suit}_${formattedCard}.png`;
        img.style.width = '100px';
        img.style.imageRendering = 'pixelated';
        img.classList.add('new-card');
        playerCardsDiv.appendChild(img);
    }

    for (let i = 0; i < dealerHand.length; i++) {
            let card = dealerHand[i];
            let img = document.createElement('img');

            if (i === 1 && !gameOver) {
                img.src = `./img/card_back.png`;
            } else {
            let formattedCard = card.value;
            if (['2','3','4','5','6','7','8','9'].includes(card.value)) {
                formattedCard = '0' + card.value;
            } else {
                formattedCard = card.value.toUpperCase();
            }

            img.src = `./img/card_${card.suit}_${formattedCard}.png`;
        }

        img.style.width = '100px';
        img.style.imageRendering = 'pixelated';
        dealerCardsDiv.appendChild(img);
    }

    playerScore = calculateScore(playerHand);

    if (!gameOver) {
        dealerScore = calculateScore([dealerHand[0]]);
    } else {
        dealerScore = calculateScore(dealerHand);
    }

    playerScoreSpan.textContent = playerScore;
    dealerScoreSpan.textContent = dealerScore;
}

function startGame() {
    if (currentBet === 0) {
        alert("Place a bet!");
        return;
    }

    gameInProgress = true;
    gameOver = false;
    playSound('deal-sound');

    gameMsg.style.display = 'none';
    restartBtn.style.display = 'none';
    makeDeck();
    shuffleDeck();

    playerHand = [];
    dealerHand = [];

    playerHand.push(deck.pop());
    dealerHand.push(deck.pop());
    playerHand.push(deck.pop());
    dealerHand.push(deck.pop());

    updateBoard();

    if (playerScore === 21) {
        gameOver = true;
        updateBoard();
        gameMsg.style.display = 'flex';
        
        if (dealerScore === 21) {
            messageText.textContent = "BOTH HAVE BLACKJACK - PUSH!";
            resolveHandPayout('PUSH');
        } else {
            messageText.textContent = "BLACKJACK! YOU WIN!";
            resolveHandPayout('BLACKJACK');
        }
        restartBtn.style.display = 'block';
    }
}

function resolveHandPayout(result) {
    if (result === 'WIN') {
        bankroll += currentBet * 2;
        playSound('win-sound');
    } else if (result === 'BLACKJACK') {
        bankroll += currentBet + (currentBet * 1.5);
        playSound('win-sound');
    } else if (result === 'PUSH') {
        bankroll += currentBet;
        playSound('win-sound');
    } else if (result === 'LOSS') {
        currentBet = 0;
        gameInProgress = false;
        playSound('lose-sound');
    }

    currentBet = 0;
    gameInProgress = false;
    saveAndLoadBankroll();
} 

function hitCard() {
    if (!gameOver && deck.length > 0) {
        playerHand.push(deck.pop());
        playSound('deal-sound');

        updateBoard();

        if (playerScore > 21) {
            gameOver = true;
            updateBoard();

            gameMsg.style.display = 'flex';
            messageText.textContent = 'Player BUSTED! Dealer wins!';
            restartBtn.style.display = 'block'; 
            currentBet = 0;
            playSound('lose-sound');
            gameInProgress = false;
            updateMoneyDisplay();
        }
    }
}

function standTurn() {
    if (gameOver) return;

    gameOver = true;
    dealerScore = calculateScore(dealerHand);

    while (dealerScore < 17 && deck.length > 0) {
        dealerHand.push(deck.pop());
        dealerScore = calculateScore(dealerHand);
    }

    updateBoard();

    playerScore = calculateScore(playerHand);
    dealerScore = calculateScore(dealerHand);

    gameMsg.style.display = 'flex';

    if (dealerScore > 21) {
        messageText.textContent = "DEALER BUSTED! YOU WIN!";
        resolveHandPayout('WIN');
    } else if (dealerScore > playerScore) {
        messageText.textContent = "DEALER WINS!";
        resolveHandPayout('LOSS');
    } else if (dealerScore < playerScore) {
        messageText.textContent = "YOU WIN!";
        resolveHandPayout('WIN');
    } else {
        messageText.textContent = "IT'S A TIE (PUSH)!";
        resolveHandPayout('PUSH');
    }
    
    restartBtn.style.display = 'block';
}

startBtn.addEventListener('click', () => {
    mainMenu.style.display = 'none';
    gameScreen.style.display = 'block';
});

restartBtn.addEventListener('click', () => {
    gameMsg.style.display = 'none';
    restartBtn.style.display = 'none';

    gameInProgress = false;
    currentBet = 0;
    playerHand = [];
    dealerHand = [];

    updateBoard();
    updateMoneyDisplay();
});

hitBtn.addEventListener('click', () => {
    hitCard();
});

standBtn.addEventListener('click', () => {
    standTurn();
});

dealBtn.addEventListener('click', () => {
    startGame();
});

function playSound(soundId) {
    const sound = document.getElementById(soundId);
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(e => {
            console.log("AUDIO MISSING OR BLOCKED ", e);
        });
    }
}