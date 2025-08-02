// script.js

// --- Game State Variables ---
let currentRoom = 0; // 0: Start, 1-5: Rooms, 6: End
const gameContainer = document.getElementById('game-container');
let puzzleSolved = false; // Flag to prevent multiple submissions after solving a puzzle

// --- Room Data (Define your rooms and puzzles here) ---
const rooms = [
    // Room 1: The Logic Grid (Sudoku-like)
    {
        id: 1,
        name: "The Ancient Pattern",
        description: "An old stone tablet has a 3x3 grid with strange symbols. Arrange the symbols (Sun, Moon, Star) so that each row and column contains exactly one of each symbol. Click a cell, then click a symbol in the palette to place it.",
        puzzleType: "sudoku-like",
        // The correct solution for reference (A=Sun, B=Moon, C=Star)
        correctSolution: [
            ['Sun', 'Moon', 'Star'],
            ['Star', 'Sun', 'Moon'],
            ['Moon', 'Star', 'Sun']
        ],
        // Initial state of the grid (empty cells represented by '')
        initialState: [
            ['Sun', '', ''],
            ['', '', 'Moon'],
            ['', 'Star', '']
        ],
        hint: "Each symbol must appear exactly once in every row and every column. Start with the obvious placements!",
        image: "ancient_chamber.jpg" // Placeholder for an image
    },
    // Room 2: The Memory Matching Game
    {
        id: 2,
        name: "The Hall of Echoes",
        description: "The walls are lined with covered tiles. Find all the matching pairs of mystical creatures to open the next door.",
        puzzleType: "matching-game",
        // Symbols/images for the cards (must be in pairs)
        cards: ['Dragon', 'Phoenix', 'Griffin', 'Unicorn', 'Dragon', 'Phoenix', 'Griffin', 'Unicorn'],
        hint: "Concentrate and remember the location of each creature.",
        image: "echo_hall.jpg"
    },
    // Room 3: The Cryptic Safe (Combination Lock)
    {
        id: 3,
        name: "The Watcher's Vault",
        description: "A secure vault door awaits a 4-digit code. Clues are carved into the pillars around the room:<br>1. The number of continents.<br>2. The number of sides on a hexagon.<br>3. The number of colors in a rainbow.<br>4. The number of days in a week.",
        puzzleType: "combination-lock",
        answer: "7677", // The combined string of digits
        hint: "Think about general knowledge. No tricks, just facts.",
        image: "vault_room.jpg"
    },
    // Room 4: The Ancient Riddle
    {
        id: 4,
        name: "The Chamber of Whispers",
        description: "A faint voice whispers from the shadows: 'I have cities, but no houses; forests, but no trees; and water, but no fish. What am I?' Enter your answer below.",
        puzzleType: "riddle",
        answer: "map",
        hint: "It's something you look at to find your way around the world.",
        image: "whispers_chamber.jpg"
    },
    // Room 5: The Final Conundrum (Numeric Sequence)
    {
        id: 5,
        name: "The Portal Nexus",
        description: "A shimmering portal hums, requiring a final sequence of numbers. A stone tablet nearby reads: '1, 1, 2, 3, 5, 8, ?, ?'. Enter the next two numbers in the sequence.",
        puzzleType: "sequence", // This will use a single text input for now
        answer: "1321", // The next two numbers are 13 and 21, concatenated
        hint: "This sequence is famous in mathematics. Each number is the sum of the two preceding ones.",
        image: "portal_nexus.jpg"
    }
];

// --- Game Functions ---

// Displays the start page
function renderStartPage() {
    currentRoom = 0; // Ensure we are on the start page
    puzzleSolved = false; // Reset for new game
    gameContainer.innerHTML = `
        <h1>The Mystical Escape!</h1>
        <p>Welcome, seeker! You find yourself trapped in an ancient labyrinth. Five mystical rooms lie ahead, each guarded by a unique challenge. Only by solving these puzzles can you unravel the secrets and find your way to freedom.</p>
        <p>Are you ready to test your wit?</p>
        <button onclick="startGame()">Begin Your Journey</button>
    `;
    gameContainer.className = ''; // Clear any room-specific classes
    // Set a default background for the start page if desired, or let CSS handle body default
    gameContainer.style.backgroundImage = 'none';
}

// Starts the game and moves to the first room
function startGame() {
    currentRoom = 1;
    renderRoom(currentRoom);
}

// Renders the content of a specific room based on its ID
function renderRoom(roomNumber) {
    puzzleSolved = false; // Reset for each new room

    if (roomNumber > rooms.length) {
        showEndPage(true); // Player won
        return;
    }

    const room = rooms.find(r => r.id === roomNumber);
    if (!room) {
        console.error("Room not found for ID:", roomNumber);
        showEndPage(false); // Indicate failure or error
        return;
    }

    // Set room-specific background (optional, using CSS class for transition)
    gameContainer.className = `room-${room.id}`;

    // --- Dynamic Puzzle Rendering ---
    let puzzleContentHtml = '';
    let submitButtonNeeded = true;
    let hintButtonNeeded = true;

    if (room.puzzleType === "riddle" || room.puzzleType === "sequence") {
        puzzleContentHtml = `
            <input type="text" id="puzzle-answer" placeholder="Type your answer here">
        `;
    } else if (room.puzzleType === "sudoku-like") {
        puzzleContentHtml = `
            <div id="sudoku-grid" class="sudoku-grid"></div>
            <div class="symbol-palette">
                <span class="symbol" data-symbol="Sun">☀️</span>
                <span class="symbol" data-symbol="Moon">🌙</span>
                <span class="symbol" data-symbol="Star">⭐</span>
            </div>
            <p>Click a grid cell, then click a symbol to place it.</p>
        `;
    } else if (room.puzzleType === "matching-game") {
        puzzleContentHtml = `
            <div id="memory-grid" class="memory-grid"></div>
        `;
        submitButtonNeeded = false; // Matching game checks automatically
        hintButtonNeeded = false; // Hint for memory game is usually "keep trying"
    } else if (room.puzzleType === "combination-lock") {
        puzzleContentHtml = `
            <div class="combination-lock">
                <input type="number" id="lock-digit-1" class="lock-digit-input" min="0" max="9" maxlength="1">
                <input type="number" id="lock-digit-2" class="lock-digit-input" min="0" max="9" maxlength="1">
                <input type="number" id="lock-digit-3" class="lock-digit-input" min="0" max="9" maxlength="1">
                <input type="number" id="lock-digit-4" class="lock-digit-input" min="0" max="9" maxlength="1">
            </div>
        `;
    }

    // Combine HTML for the room
    gameContainer.innerHTML = `
        <div class="room-content">
            <h2>${room.name}</h2>
            <p>${room.description}</p>
            <div class="puzzle-area">
                ${puzzleContentHtml}
                ${submitButtonNeeded ? `<button id="submit-button" onclick="checkAnswer(${room.id})">Unlock Door</button>` : ''}
                ${hintButtonNeeded ? `<button id="hint-button" onclick="showHint(${room.id})">Need a Hint?</button>` : ''}
            </div>
            <p id="feedback"></p>
        </div>
    `;

    // --- Post-Render Puzzle Initialization ---
    if (room.puzzleType === "sudoku-like") {
        initializeSudokuLikePuzzle(room);
    } else if (room.puzzleType === "matching-game") {
        initializeMatchingGame(room);
    } else if (room.puzzleType === "combination-lock") {
        initializeCombinationLock(room);
    }
}

// Checks the player's answer for the current room's puzzle
function checkAnswer(roomId) {
    if (puzzleSolved) return; // Prevent double submission

    const room = rooms.find(r => r.id === roomId);
    const feedbackElement = document.getElementById('feedback');
    let isCorrect = false;
    let userAnswer;

    if (room.puzzleType === "riddle" || room.puzzleType === "sequence") {
        userAnswer = document.getElementById('puzzle-answer').value.toLowerCase().trim();
        isCorrect = (userAnswer === room.answer) || (room.altAnswers && room.altAnswers.includes(userAnswer));
    } else if (room.puzzleType === "sudoku-like") {
        // Sudoku-like logic is handled by `validateSudokuLikePuzzle`
        // This button won't exist for auto-checking puzzles
        // This `checkAnswer` specifically is for button-triggered checks
        const currentGrid = getSudokuGridState(); // Function to retrieve current grid state
        isCorrect = validateSudokuLikePuzzle(currentGrid, room.correctSolution);
    } else if (room.puzzleType === "combination-lock") {
        const d1 = document.getElementById('lock-digit-1').value;
        const d2 = document.getElementById('lock-digit-2').value;
        const d3 = document.getElementById('lock-digit-3').value;
        const d4 = document.getElementById('lock-digit-4').value;
        userAnswer = `${d1}${d2}${d3}${d4}`;
        isCorrect = (userAnswer === room.answer);
    }

    if (isCorrect) {
        puzzleSolved = true;
        feedbackElement.textContent = "Correct! The path to the next room opens...";
        feedbackElement.style.color = "green";
        disableCurrentPuzzleInputs(); // Disable inputs/buttons after success

        setTimeout(() => {
            currentRoom++;
            renderRoom(currentRoom); // Move to the next room
        }, 1800);
    } else {
        feedbackElement.textContent = "That's not quite right. Try again!";
        feedbackElement.style.color = "red";
    }
}

// Helper to disable puzzle inputs/buttons after a correct answer
function disableCurrentPuzzleInputs() {
    const inputField = document.getElementById('puzzle-answer');
    if (inputField) inputField.disabled = true;

    const submitButton = document.getElementById('submit-button');
    if (submitButton) submitButton.disabled = true;

    const hintButton = document.getElementById('hint-button');
    if (hintButton) hintButton.disabled = true;

    // Specific for lock inputs
    document.querySelectorAll('.lock-digit-input').forEach(input => input.disabled = true);
    // For sudoku symbols
    document.querySelectorAll('.symbol').forEach(symbol => symbol.style.pointerEvents = 'none');
    document.querySelectorAll('.sudoku-cell').forEach(cell => cell.style.pointerEvents = 'none');
}


// Displays a hint for the current room's puzzle
function showHint(roomId) {
    const feedbackElement = document.getElementById('feedback');
    const room = rooms.find(r => r.id === roomId);
    if (room && room.hint) {
        feedbackElement.innerHTML = `<span class="hint-text">Hint: ${room.hint}</span>`;
        feedbackElement.style.color = "blue";
    } else {
        feedbackElement.textContent = "No hint available for this puzzle.";
        feedbackElement.style.color = "orange";
    }
}

// Displays the end page (win or lose)
function showEndPage(win = true) {
    let message = "";
    let endClass = "";
    let title = "";

    if (win) {
        title = "Congratulations, Escapist!";
        message = "You have successfully navigated all five treacherous rooms and found your freedom! Your intellect and perseverance have prevailed.";
        endClass = "game-win";
    } else {
        title = "Game Over!";
        message = "It seems your journey ended prematurely. The labyrinth claims another victim. Better luck next time!";
        endClass = "game-end";
    }

    gameContainer.innerHTML = `
        <h1 class="${endClass}">${title}</h1>
        <p>${message}</p>
        <button onclick="location.reload()">Play Again</button>
    `;
    gameContainer.className = ''; // Clear any room-specific classes
    gameContainer.classList.add(endClass); // Add end-specific class
}

// --- Puzzle Specific Initialization Functions ---

// Sudoku-like Puzzle
let currentSudokuGridState = [];
let selectedSudokuCell = null;

function initializeSudokuLikePuzzle(room) {
    const gridDiv = document.getElementById('sudoku-grid');
    currentSudokuGridState = JSON.parse(JSON.stringify(room.initialState)); // Deep copy initial state

    // Clear previous cells
    gridDiv.innerHTML = '';

    // Generate grid cells
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            const cell = document.createElement('div');
            cell.classList.add('sudoku-cell');
            if (room.initialState[r][c] !== '') {
                cell.textContent = room.initialState[r][c];
                cell.classList.add('pre-filled');
            } else {
                cell.dataset.row = r;
                cell.dataset.col = c;
                cell.addEventListener('click', () => {
                    if (selectedSudokuCell) selectedSudokuCell.classList.remove('selected');
                    selectedSudokuCell = cell;
                    selectedSudokuCell.classList.add('selected');
                });
            }
            gridDiv.appendChild(cell);
        }
    }

    // Add event listeners to palette symbols
    document.querySelectorAll('.symbol').forEach(symbolEl => {
        symbolEl.addEventListener('click', () => {
            if (selectedSudokuCell && !selectedSudokuCell.classList.contains('pre-filled')) {
                const row = parseInt(selectedSudokuCell.dataset.row);
                const col = parseInt(selectedSudokuCell.dataset.col);
                const symbol = symbolEl.dataset.symbol;

                selectedSudokuCell.textContent = symbolEl.innerHTML; // Use innerHTML for emoji
                currentSudokuGridState[row][col] = symbol; // Store actual symbol for logic

                selectedSudokuCell.classList.remove('selected');
                selectedSudokuCell = null; // Deselect after placing

                // Auto-check the grid whenever a symbol is placed (optional, can be moved to button click)
                checkSudokuSolutionOnUpdate(room.id);
            }
        });
    });
}

function getSudokuGridState() {
    return currentSudokuGridState;
}

function checkSudokuSolutionOnUpdate(roomId) {
    if (puzzleSolved) return;

    const room = rooms.find(r => r.id === roomId);
    const feedbackElement = document.getElementById('feedback');

    // Only check if all cells are filled before validating the full solution
    let allFilled = true;
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            if (currentSudokuGridState[r][c] === '') {
                allFilled = false;
                break;
            }
        }
        if (!allFilled) break;
    }

    if (!allFilled) {
        feedbackElement.textContent = "Fill all cells to check the pattern!";
        feedbackElement.style.color = "orange";
        return;
    }

    // Now validate the grid
    if (validateSudokuLikePuzzle(currentSudokuGridState, room.correctSolution)) {
        puzzleSolved = true;
        feedbackElement.textContent = "The ancient pattern shimmers and opens the way!";
        feedbackElement.style.color = "green";
        disableCurrentPuzzleInputs();
        setTimeout(() => {
            currentRoom++;
            renderRoom(currentRoom);
        }, 1800);
    } else {
        feedbackElement.textContent = "The pattern is incorrect. Keep trying!";
        feedbackElement.style.color = "red";
    }
}

// Actual validation logic for the Sudoku-like puzzle
function validateSudokuLikePuzzle(grid, solution) {
    // For this simple 3x3 with unique rows/cols, we can just compare to the solution
    // For more complex rules, you'd implement row/col/block unique checks
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            if (grid[r][c] !== solution[r][c]) {
                return false;
            }
        }
    }
    return true;
}


// Memory Matching Game
let flippedCards = [];
let matchedPairs = 0;
let totalPairs = 0;
let lockBoard = false; // To prevent rapid clicking issues

function initializeMatchingGame(room) {
    const gridDiv = document.getElementById('memory-grid');
    gridDiv.innerHTML = ''; // Clear any existing cards

    let cardsArray = [...room.cards]; // Make a copy
    cardsArray.sort(() => 0.5 - Math.random()); // Shuffle cards
    totalPairs = cardsArray.length / 2;
    matchedPairs = 0; // Reset for new game
    flippedCards = [];
    lockBoard = false;

    cardsArray.forEach((value, index) => {
        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.dataset.value = value;
        card.dataset.index = index; // Unique identifier for each card instance

        const cardInner = `
            <div class="card-face card-back"></div>
            <div class="card-face card-front">${value}</div>
        `;
        // For image-based cards, you'd use: `<img src="images/${value.toLowerCase()}.png" alt="${value}">`

        card.innerHTML = cardInner;
        card.addEventListener('click', () => flipCard(card, room.id));
        gridDiv.appendChild(card);
    });
}

function flipCard(card, roomId) {
    if (lockBoard || card.classList.contains('is-flipped') || card.classList.contains('is-matched') || puzzleSolved) {
        return;
    }

    card.classList.add('is-flipped');
    flippedCards.push(card);

    if (flippedCards.length === 2) {
        lockBoard = true;
        setTimeout(() => checkForMatch(roomId), 1000); // Check after a short delay
    }
}

function checkForMatch(roomId) {
    const feedbackElement = document.getElementById('feedback');
    const [card1, card2] = flippedCards;

    if (card1.dataset.value === card2.dataset.value) {
        // Match found
        card1.classList.add('is-matched');
        card2.classList.add('is-matched');
        matchedPairs++;
        feedbackElement.textContent = "Match found!";
        feedbackElement.style.color = "green";

        if (matchedPairs === totalPairs) {
            puzzleSolved = true;
            feedbackElement.textContent = "All pairs matched! The door echoes open!";
            feedbackElement.style.color = "#00ff99";
            disableCurrentPuzzleInputs(); // Not strictly needed as cards become disabled
            setTimeout(() => {
                currentRoom++;
                renderRoom(currentRoom);
            }, 1800);
        }
    } else {
        // No match, flip back
        card1.classList.remove('is-flipped');
        card2.classList.remove('is-flipped');
        feedbackElement.textContent = "No match, try again!";
        feedbackElement.style.color = "orange";
    }
    flippedCards = []; // Reset flipped cards
    lockBoard = false; // Unlock board for next clicks
}


// Combination Lock
function initializeCombinationLock(room) {
    const inputs = document.querySelectorAll('.lock-digit-input');
    inputs.forEach(input => {
        input.value = ''; // Clear previous values
        input.addEventListener('input', (e) => {
            // Automatically move focus to the next input
            if (e.target.value.length === 1) {
                const nextInput = e.target.nextElementSibling;
                if (nextInput && nextInput.classList.contains('lock-digit-input')) {
                    nextInput.focus();
                }
            }
            // If the last digit is entered, trigger checkAnswer
            if (e.target.id === 'lock-digit-4' && e.target.value.length === 1) {
                checkAnswer(room.id);
            }
        });
        // Allow only single digit numbers
        input.addEventListener('keydown', (e) => {
            // Allow backspace, delete, arrow keys
            if (e.key === 'Backspace' || e.key === 'Delete' || e.key.startsWith('Arrow')) {
                return;
            }
            // Allow only digits
            if (!/^\d$/.test(e.key)) {
                e.preventDefault();
            }
        });
    });
}

// --- Initial Game Load ---
// This ensures the start page is rendered when the page loads
document.addEventListener('DOMContentLoaded', renderStartPage);