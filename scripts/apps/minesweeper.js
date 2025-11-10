apps.minesweeper = {
    title: 'Minesweeper',
    icon: './images/icons/minesweeper.ico',
    windowClass: 'minesweeper-window',
    contentClass: 'minesweeper-content',
    getContent: function () {
        return `
            <div class="minesweeper-header">
                <div class="mine-counter">010</div>
                <button class="face-button">._.</button>
                <div class="timer-counter">000</div>
            </div>
            <div class="minesweeper-grid"></div>
        `;
    },
    init: function (windowElement) {
        const GRID_SIZE = 8;
        const MINE_COUNT = 10;
        let grid = [];
        let revealed = [];
        let flagged = [];
        let gameOver = false;
        let firstClick = true;
        let timer = 0;
        let timerInterval = null;
        const gridElement = windowElement.querySelector('.minesweeper-grid');
        const faceButton = windowElement.querySelector('.face-button');
        const mineCounter = windowElement.querySelector('.mine-counter');
        const timerCounter = windowElement.querySelector('.timer-counter');
        initGame();
        faceButton.addEventListener('click', resetGame);
        function initGame() {
            grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
            revealed = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(false));
            flagged = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(false));
            gameOver = false;
            firstClick = true;
            timer = 0;
            if (timerInterval) clearInterval(timerInterval);
            updateCounters();
            renderGrid();
        }
        function resetGame() {
            faceButton.textContent = '._.';
            initGame();
        }
        function placeMines(excludeRow, excludeCol) {
            let minesPlaced = 0;
            while (minesPlaced < MINE_COUNT) {
                const row = Math.floor(Math.random() * GRID_SIZE);
                const col = Math.floor(Math.random() * GRID_SIZE);
                if (grid[row][col] !== -1 && !(row === excludeRow && col === excludeCol)) {
                    grid[row][col] = -1;
                    minesPlaced++;
                    for (let dr = -1; dr <= 1; dr++) {
                        for (let dc = -1; dc <= 1; dc++) {
                            const nr = row + dr;
                            const nc = col + dc;
                            if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE && grid[nr][nc] !== -1) {
                                grid[nr][nc]++;
                            }
                        }
                    }
                }
            }
        }
        function renderGrid() {
            gridElement.innerHTML = '';
            for (let row = 0; row < GRID_SIZE; row++) {
                for (let col = 0; col < GRID_SIZE; col++) {
                    const cell = document.createElement('div');
                    cell.className = 'mine-cell';
                    cell.dataset.row = row;
                    cell.dataset.col = col;
                    if (revealed[row][col]) {
                        cell.classList.add('revealed');
                        if (grid[row][col] === -1) {
                            cell.textContent = '💣';
                            cell.classList.add('mine');
                        } else if (grid[row][col] > 0) {
                            cell.textContent = grid[row][col];
                            cell.classList.add(`number-${grid[row][col]}`);
                        }
                    } else if (flagged[row][col]) {
                        cell.textContent = '🚩';
                    }
                    cell.addEventListener('click', () => handleCellClick(row, col));
                    cell.addEventListener('contextmenu', (e) => {
                        e.preventDefault();
                        handleRightClick(row, col);
                    });
                    gridElement.appendChild(cell);
                }
            }
        }
        function handleCellClick(row, col) {
            if (gameOver || revealed[row][col] || flagged[row][col]) return;
            if (firstClick) {
                placeMines(row, col);
                firstClick = false;
                startTimer();
            }
            if (grid[row][col] === -1) {
                revealAllMines();
                gameOver = true;
                faceButton.textContent = '×_×';
                if (timerInterval) clearInterval(timerInterval);
            } else {
                revealCell(row, col);
                checkWin();
            }

            renderGrid();
        }
        function handleRightClick(row, col) {
            if (gameOver || revealed[row][col]) return;
            flagged[row][col] = !flagged[row][col];
            updateCounters();
            renderGrid();
        }
        function revealCell(row, col) {
            if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) return;
            if (revealed[row][col] || flagged[row][col]) return;
            revealed[row][col] = true;
            if (grid[row][col] === 0) {
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        revealCell(row + dr, col + dc);
                    }
                }
            }
        }
        function revealAllMines() {
            for (let row = 0; row < GRID_SIZE; row++) {
                for (let col = 0; col < GRID_SIZE; col++) {
                    if (grid[row][col] === -1) {
                        revealed[row][col] = true;
                    }
                }
            }
        }
        function checkWin() {
            let unrevealedCount = 0;
            for (let row = 0; row < GRID_SIZE; row++) {
                for (let col = 0; col < GRID_SIZE; col++) {
                    if (!revealed[row][col] && grid[row][col] !== -1) {
                        unrevealedCount++;
                    }
                }
            }
            if (unrevealedCount === 0) {
                gameOver = true;
                faceButton.textContent = '^_^';
                if (timerInterval) clearInterval(timerInterval);
            }
        }
        function updateCounters() {
            let flagCount = 0;
            for (let row = 0; row < GRID_SIZE; row++) {
                for (let col = 0; col < GRID_SIZE; col++) {
                    if (flagged[row][col]) flagCount++;
                }
            }
            mineCounter.textContent = String(MINE_COUNT - flagCount).padStart(3, '0');
            timerCounter.textContent = String(timer).padStart(3, '0');
        }
        function startTimer() {
            timerInterval = setInterval(() => {
                timer++;
                if (timer > 999) timer = 999;
                updateCounters();
            }, 1000);
        }
    }
};