let currentPuzzleIndex = -1;
let keysCollected = 0;
const totalKeys = 5;
let puzzleSolved = false;
const gameContent = document.getElementById('game-content');
let timerInterval;
const gameDuration = 20 * 60; // 20 minutes in seconds
let audioContext = new (window.AudioContext || window.webkitAudioContext)();
let currentMazePosition = {x: 0, y: 0};
let correctMorseSequence = "";
let currentWeightPuzzleStage = 1;
let selectedWeights = [];
let sortingItems = [];
let matchedPairs = 0;
let flippedCards = [];

// Updated array for background images based on room number
const backgroundImages = {
    'start': 'images/start_page.jpg',
    1: 'images/room1.jpg',
    2: 'images/room2.jpg',
    3: 'images/room3.jpg',
    4: 'images/room4.jpg',
    5: 'images/room5.jpg',
    'key_collected': 'images/key_collected.jpg',
    'end_game': 'images/end_page.jpg'
};
const puzzles = [
    {id: 1, room: 1, title: "The Light Sequence", description: "Four glowing orbs flicker in a specific order. Watch and then repeat the sequence by clicking the orbs.", puzzleType: "light-sequence", sequence: [0, 2, 1, 3], hint: "Focus and remember the order of the flashing lights. If you forget, you can re-watch the sequence."},
    {id: 2, room: 1, title: "The Fragmented Image", description: "A picture has been shattered into pieces. Reassemble it to reveal the next clue.", puzzleType: "jigsaw", image: "images/image_3fe13f.jpg", rows: 2, cols: 2, hint: "Look for the edges and corners of the image first. They are often easier to place."},
    {id: 3, room: 1, title: "The Glyph Grid", description: "A 3x3 grid awaits. Place the symbols (Sun, Moon, Star) so that each symbol appears exactly once in each row and each column.", puzzleType: "sudoku-like", correctSolution: [['Sun', 'Moon', 'Star'], ['Star', 'Sun', 'Moon'], ['Moon', 'Star', 'Sun']], initialState: [['Sun', '', ''], ['', '', 'Moon'], ['', 'Star', '']], symbols: ['Sun', 'Moon', 'Star'], hint: "Each symbol must appear exactly once in every row and every column."},
    {id: 4, room: 2, title: "The Labyrinthine Puzzle", description: "Navigate the maze from the start (blue) to the end (red) using the arrow keys.", puzzleType: "maze-puzzle", maze: [['start', 'path', 'wall', 'wall', 'wall'], ['wall', 'path', 'path', 'path', 'wall'], ['wall', 'wall', 'wall', 'path', 'wall'], ['wall', 'path', 'path', 'path', 'wall'], ['wall', 'path', 'wall', 'path', 'end']], hint: "Follow the open path. The exit is marked with a red square."},
    {id: 5, room: 2, title: "The Odd One Out", description: "From a list of words, identify the one that doesn't belong. The words are: Carrot, Apple, Potato, Corn.", puzzleType: "text-input", answer: "apple", hint: "Three of these grow underground."},
    {id: 6, room: 2, title: "The Roman Numeral Code", description: "A tablet displays a series of ancient numbers. What is the value of XXIV", puzzleType: "text-input", answer: "24", hint: "The code is a combination of two smaller numbers. Look for patterns in the numerals."},
    {id: 7, room: 3, title: "The Memory Match", description: "Flip two cards at a time to find matching emoji pairs. Find all the pairs to unlock the key.", puzzleType: "memory-match", items: [" 🍎 ", " 🍌 ", " 🍒 ", " 🍇 "], hint: "Pay attention to where each card is located. A good memory is your best tool."},
    {id: 8, room: 3, title: "The Morse Code Rhythm", description: "Listen to the sequence of beeps. A long beep is a DASH (-), and a short beep is a DOT (.). Input the correct sequence to proceed.", puzzleType: "morse-code", sequence: [200, 500, 200, 200], correctCode: ".--.", hint: "The message is a single letter. A dot is a short sound and a dash is a long sound."},
    {id: 9, room: 3, title: "The Lock Combination", description: "Solve the following equation to find the 3-digit combination: (10 * 5) - (4 * 7).", puzzleType: "math-code", answer: 22, hint: "Follow the order of operations: multiplication first, then subtraction. The result is a two-digit number."},
    {id: 10, room: 4, title: "The Directional Lock", description: "A lock requires a sequence of arrow movements. The sequence is: Up, Down, Left, Right.", puzzleType: "direction-sequence", sequence: ["up", "down", "left", "right"], hint: "The sequence is a common pattern often associated with video games. Look closely at the order."},
    {id: 11, room: 4, title: "The Alphabet Cipher", description: "Each number corresponds to a letter. Decode the word based on the pattern: 5, 18, 22, 1, 18, 9, 14, 7.", puzzleType: "text-input", answer: "ervaring", hint: "A=1, B=2, C=3... The word means 'experience' in another language."},
    {id: 12, room: 4, title: "The Shifting Weights of Wisdom", description: "The Alchemist's scales require two distinct weight measurements to unlock. First, combine the weights to reach a total of 22 grams. Once the scale is balanced, a new target will appear. You must then find a new combination of weights that sums to **25 grams**.", puzzleType: "complex-weight-puzzle", weights: [3, 5, 8, 10, 12, 15], target1: 22, target2: 25, hint: "The first target requires a combination of two weights. The second target requires a combination of three weights."},
    {id: 13, room: 5, title: "The Sorting Game", description: "Drag and drop the items to their correct categories: Fruits and Vegetables. Correctly sort all items to proceed.", puzzleType: "sorting-game", categories: {"Fruits": ["Apple", "Banana", "Cherry"], "Vegetables": ["Carrot", "Potato", "Broccoli"]}, hint: "Some items are commonly mistaken for a different category. Think botanically."},
    {id: 14, room: 5, title: "The Word Scramble", description: "Unscramble the following letters to reveal a hidden word: O C L K A P D.", puzzleType: "text-input", answer: "padlock", hint: "It's a common noun, plural."},
    {id: 15, room: 5, title: "The Final Conundrum", description: "An ancient keypad requires a specific sequence of numbers. The code is the two prime numbers between 20 and 30, written in ascending order.", puzzleType: "final-conundrum", solution: "2329", hint: "A prime number is only divisible by 1 and itself. Look at the numbers between 20 and 30."}
];

function setBackground(imageKey) {
    document.body.style.backgroundImage = `url(${backgroundImages[imageKey]})`;
}

function renderStartPage() {
    currentPuzzleIndex = -1;
    keysCollected = 0;
    puzzleSolved = false;
    clearInterval(timerInterval);
    document.getElementById('game-header').style.display = 'none';
    setBackground('start');
    gameContent.innerHTML = `
        <div class="intro-text">
            <h1>Escape Room: The Challenge</h1>
            <p>You've just stepped into a challenging room filled with puzzles and riddles. To escape, you'll need to solve a series of challenges.</p>
            <p>Your path to freedom lies in navigating five different rooms. Each room holds a key, and to get it, you must complete three challenges within that room. The challenges will test your logic, observation, and wits. Once all three are solved, you'll earn a key and unlock the next room.</p>
            <p>The clock is your main enemy. You only have 20 minutes to solve every puzzle and find all the keys. The timer starts the moment you begin, so every second counts. Stay sharp, think quickly, and pay close attention to every detail in the room.</p>
            <p>Are you ready to begin?</p>
        </div>
        <button onclick="startGame()">Begin Your Journey</button>
    `;
}

function startGame() {
    document.getElementById('game-header').style.display = 'flex';
    startTimer();
    loadNextPuzzle();
}

function startTimer() {
    let timeLeft = gameDuration;
    const timerElement = document.getElementById('timer');
    timerElement.textContent = `20:00`;
    timerInterval = setInterval(() => {
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerElement.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            showEndPage(false);
        }
    }, 1000);
}

function updateKeyCount() {
    const keyCountElement = document.getElementById('key-count');
    if (keyCountElement) {
        keyCountElement.textContent = keysCollected;
    }
}

function loadNextPuzzle() {
    if (currentPuzzleIndex >= puzzles.length - 1) {
        showEndPage(true);
        return;
    }
    currentPuzzleIndex++;
    const puzzle = puzzles[currentPuzzleIndex];
    
    // Set the background image based on the room number
    setBackground(puzzle.room);

    puzzleSolved = false;
    let puzzleContentHtml = '';
    let buttonsHtml = `<div class="button-container"><button id="hint-button">Need a Hint?</button></div>`;

    switch (puzzle.puzzleType) {
        case "light-sequence":
            puzzleContentHtml = `<div id="light-sequence-container" class="light-sequence-container"><div class="light-bulb" data-index="0"></div><div class="light-bulb" data-index="1"></div><div class="light-bulb" data-index="2"></div><div class="light-bulb" data-index="3"></div></div><p>Watch the lights, then click them in the same order.</p>`;
            buttonsHtml = `<div class="button-container"><button id="start-sequence-button">Start Sequence</button><button id="hint-button">Need a Hint?</button></div>`;
            break;
        case "jigsaw":
            puzzleContentHtml = `<div id="jigsaw-container" class="jigsaw-container"></div>`;
            break;
        case "sudoku-like":
            puzzleContentHtml = `<div id="sudoku-grid" class="sudoku-grid"></div><div class="symbol-palette">${puzzle.symbols.map(s => `<span class="symbol" data-symbol="${s}">${s === 'Sun' ? '☀️' : s === 'Moon' ? '🌙' : '⭐'}</span>`).join('')}</div><p>Click a grid cell, then click a symbol to place it.</p>`;
            break;
        case "maze-puzzle":
            puzzleContentHtml = `<div id="maze-container"></div><p>Use the arrow keys on your keyboard to move.</p>`;
            break;
        case "text-input":
            puzzleContentHtml = `<input type="text" id="text-input" placeholder="Enter your answer here">`;
            buttonsHtml = `<div class="button-container"><button id="submit-text-button">Submit</button><button id="hint-button">Need a Hint?</button></div>`;
            break;
        case "memory-match":
            puzzleContentHtml = `<div id="memory-match-container" class="memory-match-container"></div>`;
            break;
        case "morse-code":
            puzzleContentHtml = `<div class="morse-code-container"><button id="play-morse-button">Play Signal</button><button id="dot-button" class="morse-btn">.</button><button id="dash-button" class="morse-btn">-</button></div><p>Input your sequence: <span id="morse-input-display"></span></p>`;
            buttonsHtml = `<div class="button-container"><button id="submit-morse-button">Submit</button><button id="hint-button">Need a Hint?</button></div>`;
            break;
        case "math-code":
            puzzleContentHtml = `<input type="number" id="math-input" placeholder="Enter the code">`;
            buttonsHtml = `<div class="button-container"><button id="submit-math-button">Unlock</button><button id="hint-button">Need a Hint?</button></div>`;
            break;
        case "direction-sequence":
            puzzleContentHtml = `<div class="direction-container"><button class="arrow-button" data-dir="up">▲</button><div class="horizontal-arrows"><button class="arrow-button" data-dir="left">◀</button><button class="arrow-button" data-dir="right">▶</button></div><button class="arrow-button" data-dir="down">▼</button></div><p>Click the arrows in the correct sequence.</p>`;
            break;
        case "complex-weight-puzzle":
            puzzleContentHtml = `<p>Current Weight: <span id="current-weight">0</span> grams</p><div class="weight-tray">${puzzle.weights.map(w => `<button class="weight" data-weight="${w}">${w}g</button>`).join('')}</div><p id="puzzle-stage-text">First, find the combination for ${puzzle.target1} grams.</p>`;
            buttonsHtml = `<div class="button-container"><button id="weigh-button">Weigh</button><button id="hint-button">Need a Hint?</button></div>`;
            break;
        case "sorting-game":
            puzzleContentHtml = `<div class="sorting-container"><div id="fruits-container" class="sorting-bin" data-category="Fruits"><h3>Fruits</h3></div><div id="veget-container" class="sorting-bin" data-category="Vegetables"><h3>Vegetables</h3></div></div><div id="sorting-items" class="sorting-items"></div>`;
            break;
        case "final-conundrum":
            puzzleContentHtml = `<div class="keypad-container"><input type="text" id="conundrum-input" maxlength="4" readonly><div class="keypad-buttons"><button class="keypad-btn">7</button><button class="keypad-btn">8</button><button class="keypad-btn">9</button><button class="keypad-btn">4</button><button class="keypad-btn">5</button><button class="keypad-btn">6</button><button class="keypad-btn">1</button><button class="keypad-btn">2</button><button class="keypad-btn">3</button><button class="keypad-btn">C</button><button class="keypad-btn">0</button><button id="conundrum-submit" class="keypad-btn keypad-submit">ENTER</button></div></div>`;
            break;
    }
    gameContent.innerHTML = `<h2>${puzzle.title}</h2><p>${puzzle.description}</p><div class="puzzle-area">${puzzleContentHtml}${buttonsHtml}</div><p id="feedback"></p><p id="level-tracker">Puzzle ${currentPuzzleIndex + 1} of ${puzzles.length}</p>`;
    
    document.getElementById('hint-button').onclick = () => showHint(puzzle.id);
    
    switch (puzzle.puzzleType) {
        case "light-sequence":
            initializeLightSequencePuzzle(puzzle);
            break;
        case "jigsaw":
            initializeJigsawPuzzle(puzzle);
            break;
        case "sudoku-like":
            initializeSudokuLikePuzzle(puzzle);
            break;
        case "maze-puzzle":
            initializeMazePuzzle(puzzle);
            break;
        case "text-input":
            initializeTextInputPuzzle(puzzle);
            break;
        case "memory-match":
            initializeMemoryMatchPuzzle(puzzle);
            break;
        case "morse-code":
            initializeMorseCodePuzzle(puzzle);
            break;
        case "math-code":
            initializeMathCodePuzzle(puzzle);
            break;
        case "direction-sequence":
            initializeDirectionSequencePuzzle(puzzle);
            break;
        case "complex-weight-puzzle":
            initializeComplexWeightPuzzle(puzzle);
            break;
        case "sorting-game":
            initializeSortingGame(puzzle);
            break;
        case "final-conundrum":
            initializeFinalConundrum(puzzle);
            break;
    }
}

function puzzleSolvedSuccess() {
    if (puzzleSolved) return;
    puzzleSolved = true;
    const feedbackElement = document.getElementById('feedback');
    feedbackElement.textContent = "Correct!";
    feedbackElement.style.color = "green";
    disableCurrentPuzzleInputs();
    const currentPuzzle = puzzles[currentPuzzleIndex];
    if (currentPuzzle.id === 15) {
        showEndPage(true);
    } else if (currentPuzzle.id % 3 === 0) {
        keysCollected++;
        updateKeyCount();
        setTimeout(() => {
            showKeyCollectedPage(currentPuzzle.room);
        }, 1500);
    } else {
        setTimeout(() => {
            loadNextPuzzle();
        }, 1500);
    }
}

function showKeyCollectedPage(roomNumber) {
    setBackground('key_collected');
    gameContent.innerHTML = `<div class="key-collected-container"><h1>Key for Room ${roomNumber} Collected! 🔑</h1><p>You have unlocked a new area of the labyrinth.</p><p>You have ${keysCollected} of ${totalKeys} keys.</p><button onclick="loadNextPuzzle()">Continue to the next room</button></div>`;
}

function showHint(puzzleId) {
    const feedbackElement = document.getElementById('feedback');
    const puzzle = puzzles.find(p => p.id === puzzleId);
    if (puzzle && puzzle.hint) {
        feedbackElement.innerHTML = `<span class="hint-text">Hint: ${puzzle.hint}</span>`;
        feedbackElement.style.color = "blue";
    } else {
        feedbackElement.textContent = "No hint available for this puzzle.";
        feedbackElement.style.color = "orange";
    }
}

function disableCurrentPuzzleInputs() {
    const hintButton = document.getElementById('hint-button');
    if (hintButton) hintButton.disabled = true;
    document.querySelectorAll('input, button').forEach(el => el.disabled = true);
    document.querySelectorAll('.light-bulb, .jigsaw-piece, .sudoku-cell, .symbol, .gate-switch, .memory-card, .morse-btn, .arrow-button, .weight, .sorting-item').forEach(el => el.style.pointerEvents = 'none');
    if (puzzles[currentPuzzleIndex].puzzleType === 'maze-puzzle') {
        document.removeEventListener('keydown', handleMazeMove);
    }
}

function showEndPage(win = true) {
    setBackground('end_game');
    let message = "";
    let endClass = "";
    let title = "";
    clearInterval(timerInterval);
    document.getElementById('game-header').style.display = 'none';
    if (win) {
        // --- START OF CHANGED CODE ---
        title = "Freedom at Last. The Labyrinth's Master is Defeated.";
        message = "With the final key in hand, the ancient door creaks open. The secrets of this place are now yours to keep, and the challenge is complete. You have bested the labyrinth at its own game. Take a well-deserved bow, for you are the true master of this domain.";
        // --- END OF CHANGED CODE ---
        endClass = "game-win";
    } else {
        title = "Game Over!";
        message = "It seems you ran out of time. The labyrinth claims another victim. Better luck next time!";
        endClass = "game-end";
    }
    gameContent.innerHTML = `<h1 class="${endClass}">${title}</h1><p>${message}</p><button onclick="location.reload()">Play Again</button>`;
}

let playerTurn = false;
let playerSequence = [];
let sequenceIndex = 0;

function initializeLightSequencePuzzle(puzzle) {
    const bulbs = document.querySelectorAll('.light-bulb');
    const startBtn = document.getElementById('start-sequence-button');
    const feedbackElement = document.getElementById('feedback');
    playerTurn = false;
    playerSequence = [];
    sequenceIndex = 0;
    startBtn.onclick = () => {
        if (playerTurn || puzzleSolved) return;
        feedbackElement.textContent = "Watch carefully...";
        startBtn.disabled = true;
        playSequence(puzzle.sequence, bulbs);
    };
    bulbs.forEach(bulb => {
        bulb.onclick = () => {
            if (!playerTurn || puzzleSolved) return;
            const clickedIndex = parseInt(bulb.dataset.index);
            playerSequence.push(clickedIndex);
            bulb.classList.add('on');
            setTimeout(() => bulb.classList.remove('on'), 300);
            checkPlayerInput(puzzle.sequence);
        };
    });
}

function playSequence(sequence, bulbs) {
    const feedbackElement = document.getElementById('feedback');
    if (sequenceIndex < sequence.length) {
        const bulbToLight = bulbs[sequence[sequenceIndex]];
        bulbToLight.classList.add('on');
        setTimeout(() => {
            bulbToLight.classList.remove('on');
            sequenceIndex++;
            setTimeout(() => playSequence(sequence, bulbs), 500);
        }, 500);
    } else {
        playerTurn = true;
        feedbackElement.textContent = "Now, your turn! Repeat the sequence.";
        feedbackElement.style.color = "blue";
    }
}

function checkPlayerInput(correctSequence) {
    const feedbackElement = document.getElementById('feedback');
    const lastPlayerInput = playerSequence[playerSequence.length - 1];
    const expected = correctSequence[playerSequence.length - 1];
    if (lastPlayerInput !== expected) {
        feedbackElement.textContent = "Incorrect sequence! Try again.";
        feedbackElement.style.color = "red";
        playerTurn = false;
        playerSequence = [];
        sequenceIndex = 0;
        setTimeout(() => {
            feedbackElement.textContent = "Watch again...";
            document.getElementById('start-sequence-button').disabled = false;
        }, 1500);
    } else if (playerSequence.length === correctSequence.length) {
        puzzleSolvedSuccess();
    }
}

let activePiece = null;
let offsetX = 0;
let offsetY = 0;
let pieces = [];
let jigsawContainer;
let isDragging = false;

function initializeJigsawPuzzle(puzzle) {
    jigsawContainer = document.getElementById('jigsaw-container');
    jigsawContainer.innerHTML = '';
    const pieceWidth = jigsawContainer.offsetWidth / puzzle.cols;
    const pieceHeight = jigsawContainer.offsetHeight / puzzle.rows;
    pieces = [];
    let positions = [];
    for (let r = 0; r < puzzle.rows; r++) {
        for (let c = 0; c < puzzle.cols; c++) {
            positions.push({row: r, col: c});
        }
    }
    positions.sort(() => 0.5 - Math.random());
    positions.forEach((pos) => {
        const piece = document.createElement('div');
        piece.classList.add('jigsaw-piece');
        piece.style.width = `${pieceWidth}px`;
        piece.style.height = `${pieceHeight}px`;
        piece.style.backgroundImage = `url(${puzzle.image})`;
        piece.style.backgroundPosition = `-${pos.col * pieceWidth}px -${pos.row * pieceHeight}px`;
        piece.dataset.row = pos.row;
        piece.dataset.col = pos.col;
        let currentX = Math.random() * (jigsawContainer.offsetWidth - pieceWidth);
        let currentY = Math.random() * (jigsawContainer.offsetHeight - pieceHeight);
        piece.style.left = `${currentX}px`;
        piece.style.top = `${currentY}px`;
        pieces.push(piece);
        jigsawContainer.appendChild(piece);
        piece.addEventListener('mousedown', handlePieceDragStart);
        piece.addEventListener('touchstart', handlePieceDragStart);
    });
    window.addEventListener('mousemove', handlePieceDrag);
    window.addEventListener('touchmove', handlePieceDrag);
    window.addEventListener('mouseup', handlePieceDragEnd);
    window.addEventListener('touchend', handlePieceDragEnd);
}

function handlePieceDragStart(e) {
    if (e.target.classList.contains('jigsaw-piece') && !e.target.classList.contains('locked')) {
        e.preventDefault();
        isDragging = true;
        activePiece = e.target;
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        offsetX = clientX - activePiece.getBoundingClientRect().left;
        offsetY = clientY - activePiece.getBoundingClientRect().top;
        activePiece.style.zIndex = pieces.length;
    }
}

function handlePieceDrag(e) {
    if (!isDragging || !activePiece) return;
    e.preventDefault();
    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;
    const containerRect = jigsawContainer.getBoundingClientRect();
    let newX = clientX - offsetX - containerRect.left;
    let newY = clientY - offsetY - containerRect.top;
    activePiece.style.left = `${newX}px`;
    activePiece.style.top = `${newY}px`;
}

function handlePieceDragEnd() {
    if (!isDragging || !activePiece) return;
    isDragging = false;
    activePiece.style.zIndex = 1;
    const row = parseInt(activePiece.dataset.row);
    const col = parseInt(activePiece.dataset.col);
    const puzzle = puzzles.find(p => p.id === 2);
    const pieceWidth = jigsawContainer.offsetWidth / puzzle.cols;
    const pieceHeight = jigsawContainer.offsetHeight / puzzle.rows;
    const targetX = col * pieceWidth;
    const targetY = row * pieceHeight;
    const tolerance = 20;
    if (Math.abs(activePiece.offsetLeft - targetX) < tolerance && Math.abs(activePiece.offsetTop - targetY) < tolerance) {
        activePiece.style.left = `${targetX}px`;
        activePiece.style.top = `${targetY}px`;
        activePiece.classList.add('locked');
    }
    activePiece = null;
    checkJigsawSolved();
}

function checkJigsawSolved() {
    if (puzzleSolved) return;
    const allLocked = pieces.every(p => p.classList.contains('locked'));
    if (allLocked) {
        puzzleSolvedSuccess();
    }
}

let currentSudokuGridState = [];
let selectedSudokuCell = null;

function initializeSudokuLikePuzzle(puzzle) {
    const gridDiv = document.getElementById('sudoku-grid');
    currentSudokuGridState = JSON.parse(JSON.stringify(puzzle.initialState));
    gridDiv.innerHTML = '';
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            const cell = document.createElement('div');
            cell.classList.add('sudoku-cell');
            if (puzzle.initialState[r][c] !== '') {
                const symbolText = puzzle.initialState[r][c] === 'Sun' ? '☀️' : puzzle.initialState[r][c] === 'Moon' ? '🌙' : '⭐';
                cell.textContent = symbolText;
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
    document.querySelectorAll('.symbol').forEach(symbolEl => {
        symbolEl.addEventListener('click', () => {
            if (selectedSudokuCell && !selectedSudokuCell.classList.contains('pre-filled')) {
                const row = parseInt(selectedSudokuCell.dataset.row);
                const col = parseInt(selectedSudokuCell.dataset.col);
                const symbol = symbolEl.dataset.symbol;
                selectedSudokuCell.textContent = symbolEl.innerHTML;
                currentSudokuGridState[row][col] = symbol;
                selectedSudokuCell.classList.remove('selected');
                selectedSudokuCell = null;
                checkSudokuSolutionOnUpdate(puzzle);
            }
        });
    });
}

function checkSudokuSolutionOnUpdate(puzzle) {
    const feedbackElement = document.getElementById('feedback');
    let allFilled = currentSudokuGridState.flat().every(cell => cell !== '');
    if (!allFilled) {
        return;
    }
    if (validateSudokuLikePuzzle(currentSudokuGridState, puzzle.correctSolution)) {
        puzzleSolvedSuccess();
    } else {
        feedbackElement.textContent = "The pattern is incorrect. Keep trying!";
        feedbackElement.style.color = "red";
    }
}

function validateSudokuLikePuzzle(grid, solution) {
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            if (grid[r][c] !== solution[r][c]) {
                return false;
            }
        }
    }
    return true;
}

let playerPosition = {row: 0, col: 0};
let mazeCells = [];

function initializeMazePuzzle(puzzle) {
    const mazeContainer = document.getElementById('maze-container');
    mazeCells = [];
    mazeContainer.innerHTML = '';
    const rows = puzzle.maze.length;
    const cols = puzzle.maze[0].length;
    mazeContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cell = document.createElement('div');
            cell.classList.add('maze-cell');
            cell.classList.add(puzzle.maze[r][c]);
            if (puzzle.maze[r][c] === 'start') {
                playerPosition = {row: r, col: c};
            }
            cell.dataset.row = r;
            cell.dataset.col = c;
            mazeContainer.appendChild(cell);
            mazeCells.push(cell);
        }
    }
    updatePlayerPosition(playerPosition.row, playerPosition.col, true);
    document.addEventListener('keydown', handleMazeMove);
}

function updatePlayerPosition(newRow, newCol, isInitial = false) {
    const oldCell = document.querySelector(`.maze-cell.player`);
    if (oldCell && !isInitial) {
        oldCell.classList.remove('player');
    }
    const newCell = document.querySelector(`.maze-cell[data-row="${newRow}"][data-col="${newCol}"]`);
    if (newCell) {
        newCell.classList.add('player');
    }
    playerPosition = {row: newRow, col: newCol};
}

function handleMazeMove(e) {
    if (puzzleSolved) return;
    let newRow = playerPosition.row;
    let newCol = playerPosition.col;
    switch (e.key) {
        case 'ArrowUp':
            newRow--;
            break;
        case 'ArrowDown':
            newRow++;
            break;
        case 'ArrowLeft':
            newCol--;
            break;
        case 'ArrowRight':
            newCol++;
            break;
        default:
            return;
    }
    const puzzle = puzzles[currentPuzzleIndex];
    if (isValidMove(newRow, newCol, puzzle.maze)) {
        updatePlayerPosition(newRow, newCol);
        if (puzzle.maze[newRow][newCol] === 'end') {
            puzzleSolvedSuccess();
        }
    }
}

function isValidMove(row, col, maze) {
    if (row < 0 || row >= maze.length || col < 0 || col >= maze[0].length) {
        return false;
    }
    const cellType = maze[row][col];
    return cellType !== 'wall';
}

function initializeTextInputPuzzle(puzzle) {
    const submitBtn = document.getElementById('submit-text-button');
    const inputField = document.getElementById('text-input');
    const feedbackElement = document.getElementById('feedback');
    submitBtn.onclick = () => {
        if (puzzleSolved) return;
        const answer = inputField.value.trim().toLowerCase();
        if (answer === puzzle.answer) {
            puzzleSolvedSuccess();
        } else {
            feedbackElement.textContent = "That's not it. Try again.";
            feedbackElement.style.color = "red";
        }
    };
}

function initializeRomanNumeralPuzzle(puzzle) {
    const submitBtn = document.getElementById('submit-text-button');
    const inputField = document.getElementById('text-input');
    const feedbackElement = document.getElementById('feedback');
    submitBtn.onclick = () => {
        if (puzzleSolved) return;
        const answer = inputField.value.trim().toLowerCase();
        if (answer === puzzle.answer) {
            puzzleSolvedSuccess();
        } else {
            feedbackElement.textContent = "That's not it. Try again.";
            feedbackElement.style.color = "red";
        }
    };
}

function initializeMemoryMatchPuzzle(puzzle) {
    const container = document.getElementById('memory-match-container');
    container.innerHTML = '';
    const allItems = [...puzzle.items, ...puzzle.items].sort(() => 0.5 - Math.random());
    flippedCards = [];
    matchedPairs = 0;
    allItems.forEach(item => {
        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.dataset.item = item;
        card.innerHTML = `<span class="card-front">${item}</span><span class="card-back">?</span>`;
        card.addEventListener('click', () => {
            if (flippedCards.length < 2 && !card.classList.contains('flip') && !card.classList.contains('match')) {
                card.classList.add('flip');
                flippedCards.push(card);
                if (flippedCards.length === 2) {
                    setTimeout(checkMatch, 800);
                }
            }
        });
        container.appendChild(card);
    });
}

function checkMatch() {
    const [card1, card2] = flippedCards;
    if (card1.dataset.item === card2.dataset.item) {
        card1.classList.add('match');
        card2.classList.add('match');
        matchedPairs++;
        if (matchedPairs === puzzles[currentPuzzleIndex].items.length) {
            puzzleSolvedSuccess();
        }
    } else {
        card1.classList.remove('flip');
        card2.classList.remove('flip');
    }
    flippedCards = [];
}

let playerMorseInput = "";
const morseCodeMap = {".--.": "P"};
function initializeMorseCodePuzzle(puzzle) {
    const playBtn = document.getElementById('play-morse-button');
    const dotBtn = document.getElementById('dot-button');
    const dashBtn = document.getElementById('dash-button');
    const submitBtn = document.getElementById('submit-morse-button');
    const inputDisplay = document.getElementById('morse-input-display');
    playerMorseInput = "";
    inputDisplay.textContent = "";

    playBtn.onclick = () => playMorseSequence(puzzle.sequence);
    dotBtn.onclick = () => {
        if(puzzleSolved) return;
        playerMorseInput += ".";
        inputDisplay.textContent = playerMorseInput;
    };
    dashBtn.onclick = () => {
        if(puzzleSolved) return;
        playerMorseInput += "-";
        inputDisplay.textContent = playerMorseInput;
    };
    submitBtn.onclick = () => checkMorseCodeSolution(puzzle.correctCode);
}

function playMorseSequence(sequence) {
    if (!audioContext) {
        alert("Audio not supported in this browser.");
        return;
    }
    const dot = 200;
    const dash = 500;
    let time = audioContext.currentTime;

    sequence.forEach(duration => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        gainNode.gain.setValueAtTime(1, time);
        gainNode.gain.setValueAtTime(0, time + duration / 1000);
        oscillator.start(time);
        oscillator.stop(time + duration / 1000);
        time += duration / 1000 + 0.1;
    });
}

function checkMorseCodeSolution(correctCode) {
    const feedbackElement = document.getElementById('feedback');
    if (playerMorseInput === correctCode) {
        puzzleSolvedSuccess();
    } else {
        feedbackElement.textContent = "Incorrect code. Try again!";
        feedbackElement.style.color = "red";
    }
}

function initializeMathCodePuzzle(puzzle) {
    const input = document.getElementById('math-input');
    const submitBtn = document.getElementById('submit-math-button');
    submitBtn.onclick = () => checkMathCodeSolution(puzzle.answer);
    input.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            checkMathCodeSolution(puzzle.answer);
        }
    });
}

function checkMathCodeSolution(correctAnswer) {
    const input = document.getElementById('math-input');
    const feedbackElement = document.getElementById('feedback');
    if (parseInt(input.value) === correctAnswer) {
        puzzleSolvedSuccess();
    } else {
        feedbackElement.textContent = "Incorrect. The numbers don't add up!";
        feedbackElement.style.color = "red";
    }
}

function initializeDirectionSequencePuzzle(puzzle) {
    let playerSequence = [];
    const arrowButtons = document.querySelectorAll('.arrow-button');
    arrowButtons.forEach(btn => {
        btn.onclick = () => {
            if(puzzleSolved) return;
            playerSequence.push(btn.dataset.dir);
            checkDirectionSequenceSolution(playerSequence, puzzle.sequence);
        };
    });
}

function checkDirectionSequenceSolution(playerSequence, correctSequence) {
    const feedbackElement = document.getElementById('feedback');
    const lastPlayerInput = playerSequence[playerSequence.length - 1];
    const expected = correctSequence[playerSequence.length - 1];
    if (lastPlayerInput !== expected) {
        feedbackElement.textContent = "Incorrect sequence! The lock has reset.";
        feedbackElement.style.color = "red";
        playerSequence.length = 0;
    } else if (playerSequence.length === correctSequence.length) {
        puzzleSolvedSuccess();
    }
}

function initializeComplexWeightPuzzle(puzzle) {
    const weighBtn = document.getElementById('weigh-button');
    const weights = document.querySelectorAll('.weight');
    const currentWeightEl = document.getElementById('current-weight');
    currentWeightPuzzleStage = 1;
    selectedWeights = [];

    weights.forEach(btn => {
        btn.onclick = () => {
            if(puzzleSolved) return;
            btn.classList.toggle('selected');
            const weightVal = parseInt(btn.dataset.weight);
            if (btn.classList.contains('selected')) {
                selectedWeights.push(weightVal);
            } else {
                selectedWeights = selectedWeights.filter(w => w !== weightVal);
            }
            currentWeightEl.textContent = selectedWeights.reduce((sum, w) => sum + w, 0);
        };
    });
    weighBtn.onclick = () => checkComplexWeightSolution(puzzle);
}

function checkComplexWeightSolution(puzzle) {
    const currentWeightEl = document.getElementById('current-weight');
    const feedbackEl = document.getElementById('feedback');
    const puzzleStageText = document.getElementById('puzzle-stage-text');
    const currentWeightSum = selectedWeights.reduce((sum, w) => sum + w, 0);
    if (currentWeightPuzzleStage === 1) {
        if (currentWeightSum === puzzle.target1 && selectedWeights.length === 2) {
            currentWeightPuzzleStage = 2;
            selectedWeights = [];
            currentWeightEl.textContent = "0";
            puzzleStageText.textContent = `Now, find the combination for ${puzzle.target2} grams.`;
            feedbackEl.textContent = "Correct! Stage 1 complete.";
            feedbackEl.style.color = "green";
            document.querySelectorAll('.weight.selected').forEach(w => w.classList.remove('selected'));
        } else {
            feedbackEl.textContent = "Incorrect combination for the first target.";
            feedbackEl.style.color = "red";
        }
    } else if (currentWeightPuzzleStage === 2) {
        if (currentWeightSum === puzzle.target2 && selectedWeights.length === 3) {
            puzzleSolvedSuccess();
        } else {
            feedbackEl.textContent = "Incorrect combination for the second target.";
            feedbackEl.style.color = "red";
        }
    }
}

function initializeSortingGame(puzzle) {
    const itemsContainer = document.getElementById('sorting-items');
    sortingItems = [];
    itemsContainer.innerHTML = '';
    const allItems = Object.values(puzzle.categories).flat();
    allItems.sort(() => 0.5 - Math.random());
    allItems.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.classList.add('sorting-item');
        itemEl.textContent = item;
        itemEl.draggable = true;
        itemEl.dataset.originalCategory = findCategoryForItem(item, puzzle.categories);
        itemEl.addEventListener('dragstart', handleDragStart);
        sortingItems.push(itemEl);
        itemsContainer.appendChild(itemEl);
    });
    const bins = document.querySelectorAll('.sorting-bin');
    bins.forEach(bin => {
        bin.addEventListener('dragover', e => e.preventDefault());
        bin.addEventListener('drop', handleDrop);
    });
}

function findCategoryForItem(item, categories) {
    for (const category in categories) {
        if (categories[category].includes(item)) {
            return category;
        }
    }
    return null;
}

function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.textContent);
    e.target.classList.add('dragging');
}

function handleDrop(e) {
    e.preventDefault();
    const draggedItemText = e.dataTransfer.getData('text/plain');
    const draggedItemEl = document.querySelector('.sorting-item.dragging');
    const targetBinCategory = e.currentTarget.dataset.category;
    const originalCategory = draggedItemEl.dataset.originalCategory;
    if (targetBinCategory === originalCategory) {
        e.currentTarget.appendChild(draggedItemEl);
        draggedItemEl.classList.remove('dragging');
        draggedItemEl.classList.add('sorted');
        checkSortingSolution();
    } else {
        draggedItemEl.classList.remove('dragging');
        const feedbackEl = document.getElementById('feedback');
        feedbackEl.textContent = `That's not a ${targetBinCategory.toLowerCase()}. Try again.`;
        feedbackEl.style.color = "red";
    }
}

function checkSortingSolution() {
    const feedbackEl = document.getElementById('feedback');
    const totalItems = Object.values(puzzles[currentPuzzleIndex].categories).flat().length;
    const sortedItems = document.querySelectorAll('.sorting-item.sorted').length;
    if (sortedItems === totalItems) {
        puzzleSolvedSuccess();
    }
}

function initializeFinalConundrum(puzzle) {
    const inputField = document.getElementById('conundrum-input');
    const submitBtn = document.getElementById('conundrum-submit');
    const feedbackEl = document.getElementById('feedback');
    const keypadBtns = document.querySelectorAll('.keypad-btn');
    keypadBtns.forEach(btn => {
        btn.onclick = () => {
            if (puzzleSolved) return;
            const value = btn.textContent;
            if (value === 'C') {
                inputField.value = '';
            } else if (value !== 'ENTER') {
                if (inputField.value.length < puzzle.solution.length) {
                    inputField.value += value;
                }
            } else {
                if (inputField.value === puzzle.solution) {
                    puzzleSolvedSuccess();
                } else {
                    feedbackEl.textContent = "Incorrect code. The keypad buzzes ominously.";
                    feedbackEl.style.color = "red";
                    inputField.value = '';
                }
            }
        };
    });
}

// Initial call to render the starting page
renderStartPage();