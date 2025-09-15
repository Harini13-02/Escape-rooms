let currentPuzzleIndex = -1;
let keysCollected = 0;
const totalKeys = 5;
let puzzleSolved = false;
const gameContent = document.getElementById('game-content');
let timerInterval;
const gameDuration = 20 * 60; // 20 minutes in seconds
let audioContext = new (window.AudioContext || window.webkitAudioContext)();
let playerPosition = {row: 0, col: 0};
let mazeCells = [];
let correctMorseSequence = "";
let currentWeightPuzzleStage = 1;
let selectedWeights = [];
let sortingItems = [];
let matchedPairs = 0;
let flippedCards = [];
let playerDirectionSequence = [];
let currentDirectionSequencePuzzle = null;
let puzzleWeights = null;
let activePiece = null;
let offsetX = 0;
let offsetY = 0;
let pieces = [];
let jigsawContainer;
let isDragging = false;
let playerTurn = false;
let playerSequence = [];
let sequenceIndex = 0;
let currentSudokuGridState = [];
let selectedSudokuCell = null;
let playerPositionMaze = {row: 0, col: 0};
let mazeGrid = [];
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
  {id: 1, room: 1, title: "The Light Sequence", description: "Four glowing orbs flicker in a specific order. Watch and then repeat the sequence by clicking the orbs.", puzzleType: "light-sequence", sequence: [0, 2, 1, 3, 2, 0], hint: "Focus and remember the order of the flashing lights. If you forget, you can re-watch the sequence."},
  {id: 2, room: 1, title: "The Fragmented Image", description: "A picture has been shattered into pieces. Reassemble it to reveal the next clue.", puzzleType: "jigsaw", image: "images/image_3fe13f.jpg", rows: 3, cols: 3, hint: "Look for the edges and corners of the image first. They are often easier to place."},
  {id: 3, room: 1, title: "The Glyph Grid", description: "A 3x3 grid awaits. Place the symbols so that each one appears exactly once in each row and each column.", puzzleType: "sudoku-like", correctSolution: [['☀️', '🌙', '⭐'], ['⭐', '☀️', '🌙'], ['🌙', '⭐', '☀️']], initialState: [['☀️', '', ''], ['', '', '🌙'], ['', '⭐', '']], symbols: ['☀️', '🌙', '⭐'], hint: "Each symbol must appear exactly once in every row and every column."},
  {id: 4, room: 2, title: "The Sphinx's Riddle", description: "I am a secret ratio that lives in every circle. You can find me by dividing the distance around a circle's edge by the distance straight across its middle.My numbers go on forever without ever repeating.What number am I?", puzzleType: "text-input", answer: "pi", hint: "he answer is the famous constant that links a circle's circumference to its diameter."},
  {id: 5, room: 2, title: "The Odd One Out", description: "From a list of words, identify the one that doesn't belong. The words are: Red Yellow Pink Blue ", puzzleType: "text-input", answer: "pink", hint: "Think of primary colors!!"},
  {id: 6, room: 2, title: "The Roman Numeral Code", description: "A tablet displays a series of ancient numbers. What is the value of (LXXVI - XXXV) + (XLIV + XVIII) ?", puzzleType: "text-input", answer: "103", hint: "L=50, X=10. Remember that a smaller number before a larger one means subtraction, but after it means addition."},
  {id: 7, room: 3, title: "The Memory Match", description: "Flip two cards at a time to find matching emoji pairs. Find all the pairs to unlock the key.", puzzleType: "memory-match", items: ["🍎", "🍌", "🍒", "🍇"], hint: "Pay attention to where each card is located. A good memory is your best tool."},
  {id: 8, room: 3, title: "The Morse Code Rhythm", description: "Listen to the sequence of beeps. A long beep is a DASH (-), and a short beep is a DOT (.). Input the correct sequence to proceed.", puzzleType: "morse-code", sequence: [200, 500, 200, 200], correctCode: ".--.", hint: "The message is a single letter. A dot is a short sound and a dash is a long sound."},
  {id: 9, room: 3, title: "The Lock Combination", description: "Solve the following equation to find the 3-digit combination: (10 * 5) - (4 * 7).", puzzleType: "math-code", answer: 22, hint: "Follow the order of operations: multiplication first, then subtraction. The result is a two-digit number."},
  {id: 10, room: 4, title: "The Directional Lock", description: "A lock requires a sequence of arrow movements. The sequence is: Up, Up, Down, Down, Left, Right, Left, Right, B, A.", puzzleType: "direction-sequence", sequence: ["up", "up", "down", "down", "left", "right", "left", "right", "b", "a"], hint: "The sequence is a common pattern often associated with video games. Look closely at the order."},
  {id: 11, room: 4, title: "The Alphabet Cipher", description: "Each number corresponds to a letter. Decode the word based on the pattern: 5, 18, 22, 1, 18, 9, 14, 7.", puzzleType: "text-input", answer: "ervaring", hint: "A=1, B=2, C=3... The word means 'experience' in another language."},
  {id: 12, room: 4, title: "The Shifting Weights of Wisdom", description: "The Alchemist's scales require two distinct weight measurements to unlock. First, combine the weights to reach a total of 22 grams. Once the scale is balanced, a new target will appear. You must then find a new combination of weights that sums to 25 grams.", puzzleType: "complex-weight-puzzle", weights: [3, 5, 8, 10, 12, 15], target1: 22, target2: 25, hint: "The first target requires a combination of two weights. The second target requires a combination of three weights."},
  {id: 13, room: 5, title: "The Sorting Game", description: "Drag and drop the items to their correct categories: Living Things and Non-Living Things. Correctly sort all items to proceed.", puzzleType: "sorting-game", categories: {"Living Things": ["Tree", "Mushroom", "Insect","Flower"], "Non- Living Things": ["Rock", "Water", "Vehicle","Fire"]}, hint: "Some items are commonly mistaken for a different category. Think botanically."},
  {id: 14, room: 5, title: "The Word Scramble", description: "Unscramble the following letters to reveal a hidden word: A L P O K C D .", puzzleType: "text-input", answer: "padlock", hint: " Think of something you use to secure a gate, locker, or a bicycle chain.."},
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
      <p>You've just stepped into a challenging room filled with puzzles and riddles.
      To escape, you'll need to solve a series of challenges.</p>
      <p>Your path to freedom lies in navigating five different rooms.
      Each room holds a key, and to get it, you must complete three challenges within that room.
      The challenges will test your logic, observation, and wits. Once all three are solved, you'll earn a key and unlock the next room.</p>
      <p>The clock is your main enemy. You only have 20 minutes to solve every puzzle and find all the keys.
      The timer starts the moment you begin, so every second counts.
      Stay sharp, think quickly, and pay close attention to every detail in the room.</p>
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
  // Base button container that always includes Restart and Hint
  let buttonsHtml = `<div class="button-container"><button id="restart-button">Restart</button><button id="hint-button">Need a Hint?</button></div>`;
  switch (puzzle.puzzleType) {
    case "light-sequence":
      puzzleContentHtml = `<div id="light-sequence-container" class="light-sequence-container"><div class="light-bulb" data-index="0"></div><div class="light-bulb" data-index="1"></div><div class="light-bulb" data-index="2"></div><div class="light-bulb" data-index="3"></div></div><p>Watch the lights, then click them in the same order.</p>`;
      buttonsHtml = `<div class="button-container"><button id="start-sequence-button">Start Sequence</button>${buttonsHtml}</div>`;
      break;
    case "jigsaw":
      puzzleContentHtml = `<div id="jigsaw-container" class="jigsaw-container"></div>`;
      break;
    case "sudoku-like":
      puzzleContentHtml = `<div id="sudoku-grid" class="sudoku-grid"></div><div class="symbol-palette">${puzzle.symbols.map(s => `<span class="symbol" data-symbol="${s}">${s}</span>`).join('')}</div><p>Click a grid cell, then click a symbol to place it.</p>`;
      break;
    case "maze-puzzle":
      puzzleContentHtml = `<div id="maze-container"></div><p>Use the arrow keys on your keyboard to move.</p><div class="maze-buttons-mobile"><button class="arrow-button" data-dir="up"> ▲ </button><div class="horizontal-arrows"><button class="arrow-button" data-dir="left"> ◀ </button><button class="arrow-button" data-dir="right"> ▶ </button></div><button class="arrow-button" data-dir="down"> ▼ </button></div>`;
      break;
    case "text-input":
      puzzleContentHtml = `<input type="text" id="text-input" placeholder="Enter your answer here">`;
      buttonsHtml = `<div class="button-container"><button id="submit-text-button">Submit</button>${buttonsHtml}</div>`;
      break;
    case "memory-match":
      puzzleContentHtml = `<div id="memory-match-container" class="memory-match-container"></div>`;
      break;
    case "morse-code":
      puzzleContentHtml = `<div class="morse-code-container"><button id="play-morse-button">Play Signal</button><button id="dot-button" class="morse-btn">.</button><button id="dash-button" class="morse-btn">-</button></div><p>Input your sequence: <span id="morse-input-display"></span></p>`;
      buttonsHtml = `<div class="button-container"><button id="submit-morse-button">Submit</button>${buttonsHtml}</div>`;
      break;
    case "math-code":
      puzzleContentHtml = `<input type="number" id="math-input" placeholder="Enter the code">`;
      buttonsHtml = `<div class="button-container"><button id="submit-math-button">Unlock</button>${buttonsHtml}</div>`;
      break;
    case "direction-sequence":
      puzzleContentHtml = `<div class="direction-container"><button class="arrow-button" data-dir="up"> ▲ </button><div class="horizontal-arrows"><button class="arrow-button" data-dir="left"> ◀ </button><button class="arrow-button" data-dir="right"> ▶ </button></div><button class="arrow-button" data-dir="down"> ▼ </button><div class="konami-buttons"><button class="konami-btn" data-dir="b">B</button><button class="konami-btn" data-dir="a">A</button></div></div><p>Click the arrows in the correct sequence.</p>`;
      break;
    case "complex-weight-puzzle":
      puzzleContentHtml = `<p>Current Weight: <span id="current-weight">0</span> grams</p><div class="weight-tray">${puzzle.weights.map(w => `<button class="weight" data-weight="${w}">${w}g</button>`).join('')}</div><p id="puzzle-stage-text">First, find the combination for ${puzzle.target1} grams.</p>`;
      buttonsHtml = `<div class="button-container"><button id="weigh-button">Weigh</button>${buttonsHtml}</div>`;
      break;
    case "sorting-game":
      puzzleContentHtml = `<div class="sorting-container"><div id="living-things-container" class="sorting-bin" data-category="Living Things"><h3>Living Things</h3></div><div id="non-living-things-container" class="sorting-bin" data-category="Non- Living Things"><h3>Non- Living Things</h3></div></div><div id="sorting-items" class="sorting-items"></div>`;
      break;
    case "final-conundrum":
      puzzleContentHtml = `<div class="keypad-container"><input type="text" id="conundrum-input" maxlength="4" readonly><div class="keypad-buttons"><button class="keypad-btn">7</button><button class="keypad-btn">8</button><button class="keypad-btn">9</button><button class="keypad-btn">4</button><button class="keypad-btn">5</button><button class="keypad-btn">6</button><button class="keypad-btn">1</button><button class="keypad-btn">2</button><button class="keypad-btn">3</button><button class="keypad-btn">C</button><button class="keypad-btn">0</button><button id="conundrum-submit">ENTER</button></div></div>`;
      buttonsHtml = `<div class="button-container"><button id="conundrum-submit">ENTER</button>${buttonsHtml}</div>`;
      break;
  }
  gameContent.innerHTML = `<h2>${puzzle.title}</h2><p>${puzzle.description}</p><div class="puzzle-area">${puzzleContentHtml}${buttonsHtml}</div><p id="feedback"></p><p id="level-tracker">Puzzle ${currentPuzzleIndex + 1} of ${puzzles.length}</p>`;
  if (document.getElementById('hint-button')) {
    document.getElementById('hint-button').onclick = () => showHint(puzzle.id);
  }
  // Generic restart button handler
  if (document.getElementById('restart-button')) {
    document.getElementById('restart-button').onclick = () => restartCurrentPuzzle();
  }
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
function restartCurrentPuzzle() {
  // Go back one puzzle index to reload the same puzzle
  currentPuzzleIndex--;
  loadNextPuzzle();
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
  gameContent.innerHTML = `<div class="key-collected-container"><h1>Key for Room ${roomNumber} Collected! 🔑 </h1><p>You have unlocked a new area of the labyrinth.</p><p>You have ${keysCollected} of ${totalKeys} keys.</p><button onclick="loadNextPuzzle()">Continue to the next room</button></div>`;
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
    title = "Congratulations, Escapist!";
    message = "You have successfully collected all five mystical keys and found your freedom! Your intellect and perseverance have prevailed.";
    endClass = "game-win";
  } else {
    title = "Game Over!";
    message = "It seems you ran out of time. The labyrinth claims another victim. Better luck next time!";
    endClass = "game-end";
  }
  gameContent.innerHTML = `<h1 class="${endClass}">${title}</h1><p>${message}</p><button onclick="location.reload()">Play Again</button>`;
}
// Puzzle Initialization and Logic Functions
// Light Sequence Puzzle
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
// Jigsaw Puzzle
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
// Sudoku-like Puzzle
function initializeSudokuLikePuzzle(puzzle) {
  const gridDiv = document.getElementById('sudoku-grid');
  currentSudokuGridState = JSON.parse(JSON.stringify(puzzle.initialState));
  function renderGrid() {
    gridDiv.innerHTML = '';
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const cell = document.createElement('div');
        cell.classList.add('sudoku-cell');
        cell.dataset.row = r;
        cell.dataset.col = c;
        const symbol = currentSudokuGridState[r][c];
        if (symbol !== '') {
          cell.textContent = symbol;
          cell.classList.add('fixed');
        } else {
          cell.onclick = () => {
            if (puzzleSolved) return;
            if (selectedSudokuCell) {
              selectedSudokuCell.classList.remove('selected');
            }
            selectedSudokuCell = cell;
            selectedSudokuCell.classList.add('selected');
          };
        }
        gridDiv.appendChild(cell);
      }
    }
  }
  renderGrid();
  document.querySelectorAll('.symbol').forEach(symbolBtn => {
    symbolBtn.onclick = () => {
      if (puzzleSolved) return;
      if (selectedSudokuCell && !selectedSudokuCell.classList.contains('fixed')) {
        const row = parseInt(selectedSudokuCell.dataset.row);
        const col = parseInt(selectedSudokuCell.dataset.col);
        const symbol = symbolBtn.dataset.symbol;
        currentSudokuGridState[row][col] = symbol;
        selectedSudokuCell.textContent = symbol;
        selectedSudokuCell.classList.remove('selected');
        selectedSudokuCell = null;
        checkSudokuSolved(puzzle);
      }
    };
  });
}
function checkSudokuSolved(puzzle) {
  if (puzzleSolved) return;
  const feedbackEl = document.getElementById('feedback');
  // Trim spaces from the solution array for a robust comparison
  const trimmedSolution = puzzle.correctSolution.map(row => row.map(cell => cell.trim()));
  // Trim spaces from the current state for a robust comparison
  const trimmedCurrentState = currentSudokuGridState.map(row => row.map(cell => cell.trim()));
  const isCorrect = JSON.stringify(trimmedCurrentState) === JSON.stringify(trimmedSolution);
  if (isCorrect) {
    puzzleSolvedSuccess();
  } else {
    feedbackEl.textContent = "Incorrect combination. Keep trying!";
    feedbackEl.style.color = "red";
  }
}
// Maze Puzzle
function initializeMazePuzzle(puzzle) {
  const mazeContainer = document.getElementById('maze-container');
  mazeContainer.innerHTML = '';
  mazeGrid = puzzle.maze.map(row => row.slice());
  playerPositionMaze = findPlayerPosition(mazeGrid);
  renderMaze();
  document.addEventListener('keydown', handleMazeMove);
  document.querySelectorAll('.arrow-button').forEach(btn => {
    btn.onclick = (e) => {
      if (puzzleSolved) return;
      handleMobileMove(e.target.dataset.dir);
    };
  });
}
function findPlayerPosition(grid) {
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c] === 'start') {
        return {row: r, col: c};
      }
    }
  }
}
function renderMaze() {
  const mazeContainer = document.getElementById('maze-container');
  mazeContainer.innerHTML = '';
  for (let r = 0; r < mazeGrid.length; r++) {
    for (let c = 0; c < mazeGrid[r].length; c++) {
      const cell = document.createElement('div');
      cell.classList.add('maze-cell', mazeGrid[r][c]);
      if (r === playerPositionMaze.row && c === playerPositionMaze.col) {
        cell.classList.add('player');
      }
      mazeContainer.appendChild(cell);
    }
  }
}
function handleMazeMove(e) {
  if (puzzleSolved) return;
  let newRow = playerPositionMaze.row;
  let newCol = playerPositionMaze.col;
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
  checkMove(newRow, newCol);
}
function handleMobileMove(dir) {
  let newRow = playerPositionMaze.row;
  let newCol = playerPositionMaze.col;
  switch (dir) {
    case 'up':
      newRow--;
      break;
    case 'down':
      newRow++;
      break;
    case 'left':
      newCol--;
      break;
    case 'right':
      newCol++;
      break;
  }
  checkMove(newRow, newCol);
}
function checkMove(newRow, newCol) {
  if (newRow >= 0 && newRow < mazeGrid.length && newCol >= 0 && newCol < mazeGrid[0].length && mazeGrid[newRow][newCol] !== 'wall') {
    if (mazeGrid[newRow][newCol] === 'end') {
      puzzleSolvedSuccess();
    }
    playerPositionMaze.row = newRow;
    playerPositionMaze.col = newCol;
    renderMaze();
  }
}
// Text Input Puzzle
function initializeTextInputPuzzle(puzzle) {
  const inputField = document.getElementById('text-input');
  const submitBtn = document.getElementById('submit-text-button');
  const feedbackElement = document.getElementById('feedback');
  submitBtn.onclick = () => {
    if (puzzleSolved) return;
    const userAnswer = inputField.value.trim().toLowerCase();
    if (userAnswer === puzzle.answer.trim().toLowerCase()) {
      puzzleSolvedSuccess();
    } else {
      feedbackElement.textContent = "Incorrect answer. Try again.";
      feedbackElement.style.color = "red";
    }
  };
}
// Memory Match Puzzle
function initializeMemoryMatchPuzzle(puzzle) {
  const container = document.getElementById('memory-match-container');
  container.innerHTML = '';
  matchedPairs = 0;
  flippedCards = [];
  const cards = [...puzzle.items, ...puzzle.items];
  cards.sort(() => 0.5 - Math.random());
  cards.forEach((item, index) => {
    const card = document.createElement('div');
    card.classList.add('memory-card');
    card.dataset.item = item;
    card.innerHTML = `<div class="card-back"></div><div class="card-front">${item}</div>`;
    card.addEventListener('click', () => flipCard(card));
    container.appendChild(card);
  });
}
function flipCard(card) {
  if (flippedCards.length < 2 && !card.classList.contains('flipped') && !card.classList.contains('matched')) {
    card.classList.add('flipped');
    flippedCards.push(card);
    if (flippedCards.length === 2) {
      setTimeout(checkMatch, 1000);
    }
  }
}
function checkMatch() {
  const [card1, card2] = flippedCards;
  if (card1.dataset.item === card2.dataset.item) {
    card1.classList.add('matched');
    card2.classList.add('matched');
    matchedPairs++;
    if (matchedPairs === puzzles[currentPuzzleIndex].items.length) {
      puzzleSolvedSuccess();
    }
  } else {
    card1.classList.remove('flipped');
    card2.classList.remove('flipped');
  }
  flippedCards = [];
}
// Morse Code Puzzle
function initializeMorseCodePuzzle(puzzle) {
  const playBtn = document.getElementById('play-morse-button');
  const dotBtn = document.getElementById('dot-button');
  const dashBtn = document.getElementById('dash-button');
  const submitBtn = document.getElementById('submit-morse-button');
  const inputDisplay = document.getElementById('morse-input-display');
  const feedbackEl = document.getElementById('feedback');
  let inputSequence = "";
  playBtn.onclick = () => {
    if (puzzleSolved) return;
    playMorseSequence(puzzle.sequence);
  };
  dotBtn.onclick = () => {
    if (puzzleSolved) return;
    inputSequence += ".";
    inputDisplay.textContent = inputSequence;
  };
  dashBtn.onclick = () => {
    if (puzzleSolved) return;
    inputSequence += "-";
    inputDisplay.textContent = inputSequence;
  };
  submitBtn.onclick = () => {
    if (puzzleSolved) return;
    if (inputSequence === puzzle.correctCode) {
      puzzleSolvedSuccess();
    } else {
      feedbackEl.textContent = "Incorrect sequence. Try again.";
      feedbackEl.style.color = "red";
      inputSequence = "";
      inputDisplay.textContent = "";
    }
  };
}
function playMorseSequence(sequence) {
  let currentTime = audioContext.currentTime;
  sequence.forEach(duration => {
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, currentTime);
    oscillator.connect(audioContext.destination);
    oscillator.start(currentTime);
    oscillator.stop(currentTime + duration / 1000);
    currentTime += duration / 1000 + 0.1;
  });
}
// Math Code Puzzle
function initializeMathCodePuzzle(puzzle) {
  const inputField = document.getElementById('math-input');
  const submitBtn = document.getElementById('submit-math-button');
  const feedbackEl = document.getElementById('feedback');
  submitBtn.onclick = () => {
    if (puzzleSolved) return;
    const userAnswer = parseInt(inputField.value, 10);
    if (userAnswer === puzzle.answer) {
      puzzleSolvedSuccess();
    } else {
      feedbackEl.textContent = "Incorrect code. Try again.";
      feedbackEl.style.color = "red";
    }
  };
}
// Direction Sequence
function initializeDirectionSequencePuzzle(puzzle) {
  const directionButtons = document.querySelectorAll('.arrow-button, .konami-btn');
  const feedbackEl = document.getElementById('feedback');
  playerDirectionSequence = [];
  directionButtons.forEach(btn => {
    btn.onclick = () => {
      if (puzzleSolved) return;
      const direction = btn.dataset.dir;
      playerDirectionSequence.push(direction);
      if (playerDirectionSequence.length === puzzle.sequence.length) {
        checkDirectionSequence(puzzle);
      } else if (playerDirectionSequence.length > puzzle.sequence.length) {
        playerDirectionSequence = [direction];
      }
    };
  });
}
function checkDirectionSequence(puzzle) {
  const feedbackEl = document.getElementById('feedback');
  if (JSON.stringify(playerDirectionSequence) === JSON.stringify(puzzle.sequence)) {
    puzzleSolvedSuccess();
  } else {
    feedbackEl.textContent = "Incorrect sequence. Try again.";
    feedbackEl.style.color = "red";
    playerDirectionSequence = [];
  }
}
// Complex Weight Puzzle
function initializeComplexWeightPuzzle(puzzle) {
  const weighBtn = document.getElementById('weigh-button');
  const feedbackEl = document.getElementById('feedback');
  const currentWeightSpan = document.getElementById('current-weight');
  const stageText = document.getElementById('puzzle-stage-text');
  currentWeightPuzzleStage = 1;
  selectedWeights = [];
  function updateWeight() {
    const total = selectedWeights.reduce((sum, w) => sum + w, 0);
    currentWeightSpan.textContent = total;
  }
  document.querySelectorAll('.weight').forEach(btn => {
    btn.onclick = () => {
      if (puzzleSolved) return;
      const weight = parseInt(btn.dataset.weight, 10);
      if (btn.classList.contains('selected')) {
        btn.classList.remove('selected');
        selectedWeights = selectedWeights.filter(w => w !== weight);
      } else {
        btn.classList.add('selected');
        selectedWeights.push(weight);
      }
      updateWeight();
    };
  });
  weighBtn.onclick = () => {
    if (puzzleSolved) return;
    const currentTotal = selectedWeights.reduce((sum, w) => sum + w, 0);
    if (currentWeightPuzzleStage === 1) {
      if (currentTotal === puzzle.target1) {
        feedbackEl.textContent = "Stage 1 complete! Now, find the combination for 25 grams.";
        feedbackEl.style.color = "green";
        currentWeightPuzzleStage = 2;
        stageText.textContent = `Second, find the combination for ${puzzle.target2} grams.`;
        selectedWeights = [];
        updateWeight();
        document.querySelectorAll('.weight.selected').forEach(btn => btn.classList.remove('selected'));
      } else {
        feedbackEl.textContent = "Incorrect weight. Try again.";
        feedbackEl.style.color = "red";
      }
    } else if (currentWeightPuzzleStage === 2) {
      if (currentTotal === puzzle.target2) {
        puzzleSolvedSuccess();
      } else {
        feedbackEl.textContent = "Incorrect weight. Try again.";
        feedbackEl.style.color = "red";
      }
    }
  };
}
// Sorting Game
function initializeSortingGame(puzzle) {
  const itemsContainer = document.getElementById('sorting-items');
  const bins = document.querySelectorAll('.sorting-bin');
  const feedbackEl = document.getElementById('feedback');
  itemsContainer.innerHTML = '';
  sortingItems = [];
  const allItems = Object.entries(puzzle.categories).flatMap(([category, items]) => items.map(item => ({item, category})));
  allItems.sort(() => Math.random() - 0.5);
  allItems.forEach(obj => {
    const item = document.createElement('div');
    item.classList.add('sorting-item');
    item.textContent = obj.item;
    item.draggable = true;
    item.dataset.item = obj.item;
    item.dataset.correctCategory = obj.category;
    itemsContainer.appendChild(item);
  });
  let draggedItem = null;
  itemsContainer.addEventListener('dragstart', (e) => {
    draggedItem = e.target;
    e.dataTransfer.setData('text/plain', draggedItem.dataset.item);
  });
  bins.forEach(bin => {
    bin.addEventListener('dragover', (e) => {
      e.preventDefault();
      bin.classList.add('drag-over');
    });
    bin.addEventListener('dragleave', () => {
      bin.classList.remove('drag-over');
    });
    bin.addEventListener('drop', (e) => {
      e.preventDefault();
      bin.classList.remove('drag-over');
      const droppedCategory = bin.dataset.category;
      if (draggedItem.dataset.correctCategory === droppedCategory) {
        bin.appendChild(draggedItem);
        draggedItem.classList.add('sorted');
        feedbackEl.textContent = "Correct!";
        feedbackEl.style.color = "green";
      } else {
        feedbackEl.textContent = "Incorrect category. Try again.";
        feedbackEl.style.color = "red";
      }
      draggedItem = null;
      checkSortingSolution();
    });
  });
}
function checkSortingSolution() {
  const feedbackEl = document.getElementById('feedback');
  const totalItems = Object.values(puzzles[currentPuzzleIndex].categories).flat().length;
  const sortedItems = document.querySelectorAll('.sorting-item.sorted').length;
  if (sortedItems === totalItems) {
    puzzleSolvedSuccess();
  }
}
// Final Conundrum
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
        if (inputField.value.length < inputField.maxLength) {
          inputField.value += value;
        }
      }
    };
  });
  submitBtn.onclick = () => {
    if (puzzleSolved) return;
    if (inputField.value === puzzle.solution) {
      puzzleSolvedSuccess();
    } else {
      feedbackEl.textContent = "Incorrect code. Try again.";
      feedbackEl.style.color = "red";
    }
  };
}
// Initial call to set up the start page
renderStartPage();
