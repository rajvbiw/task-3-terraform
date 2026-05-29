// ==========================================
// NEON STRIKE - TIC-TAC-TOE ENGINE & AUDIO
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const cells = document.querySelectorAll('.cell-btn');
  const boardEl = document.getElementById('ttt-board');
  const gameStatusDisplay = document.getElementById('game-status-display');
  const turnDot = document.getElementById('turn-dot');
  
  const resetGameBtn = document.getElementById('reset-game-btn');
  const clearStatsBtn = document.getElementById('clear-stats-btn');
  
  // Game Setup Toggles
  const modeAiRadio = document.getElementById('mode-ai');
  const modePvpRadio = document.getElementById('mode-pvp');
  const diffEasyRadio = document.getElementById('diff-easy');
  const diffMediumRadio = document.getElementById('diff-medium');
  const diffHardRadio = document.getElementById('diff-hard');
  const difficultyGroup = document.getElementById('difficulty-group');
  
  // Name Inputs
  const p1NameInput = document.getElementById('p1-name-input');
  const p2NameInput = document.getElementById('p2-name-input');
  
  // Scoreboard Elements
  const p1ScoreLabel = document.getElementById('p1-score-label');
  const p2ScoreLabel = document.getElementById('p2-score-label');
  const scoreP1El = document.getElementById('score-p1');
  const scoreP2El = document.getElementById('score-p2');
  const scoreDrawsEl = document.getElementById('score-draws');
  const statWinrateEl = document.getElementById('stat-winrate');
  const statStreakEl = document.getElementById('stat-streak');
  
  // SVG strike components
  const strikeSvg = document.getElementById('strike-svg');
  const strikeLine = document.getElementById('strike-line');
  
  // Mute control
  const muteToggleBtn = document.getElementById('mute-toggle-btn');
  const soundIcon = document.getElementById('sound-icon');
  
  // Confetti canvas
  const confettiCanvas = document.getElementById('confetti-canvas');
  const ctx = confettiCanvas.getContext('2d');

  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  
  let board = ['', '', '', '', '', '', '', '', ''];
  let currentPlayer = 'X';
  let isGameActive = true;
  let gameMode = 'ai'; // 'ai' or 'pvp'
  let aiDifficulty = 'medium'; // 'easy', 'medium', 'hard'
  
  let p1Name = 'Player 1';
  let p2Name = 'System AI';
  
  let scoreP1 = 0;
  let scoreP2 = 0;
  let scoreDraws = 0;
  let currentStreak = 0;
  let maxStreak = 0;
  let isMuted = false;
  
  const WINNING_COMBINATIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];

  // SVG Line coordinates for winning strikes (300x300 viewBox scale)
  const STRIKE_COORDINATES = {
    0: { x1: 15, y1: 50, x2: 285, y2: 50 },    // Row 0 [0,1,2]
    1: { x1: 15, y1: 150, x2: 285, y2: 150 },  // Row 1 [3,4,5]
    2: { x1: 15, y1: 250, x2: 285, y2: 250 },  // Row 2 [6,7,8]
    3: { x1: 50, y1: 15, x2: 50, y2: 285 },    // Col 0 [0,3,6]
    4: { x1: 150, y1: 15, x2: 150, y2: 285 },  // Col 1 [1,4,7]
    5: { x1: 250, y1: 15, x2: 250, y2: 285 },  // Col 2 [2,5,8]
    6: { x1: 20, y1: 20, x2: 280, y2: 280 },   // Diagonal 0 [0,4,8]
    7: { x1: 280, y1: 20, x2: 20, y2: 280 }    // Diagonal 1 [2,4,6]
  };

  // ==========================================
  // PROCEDURAL AUDIO ENGINE (Web Audio API)
  // ==========================================
  
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  function playTone(freq, duration, type = 'sine', slideTo = 0) {
    if (isMuted) return;
    initAudio();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    
    try {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      
      if (slideTo > 0) {
        osc.frequency.exponentialRampToValueAtTime(slideTo, audioCtx.currentTime + duration);
      }
      
      gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn("Audio synthesis error: ", e);
    }
  }

  function playTap() {
    playTone(330, 0.1, 'sine');
  }

  function playTapO() {
    playTone(261.63, 0.12, 'triangle');
  }

  function playWin() {
    const now = audioCtx ? audioCtx.currentTime : 0;
    // Play a happy major arpeggio
    setTimeout(() => playTone(261.63, 0.15, 'sine'), 0); // C4
    setTimeout(() => playTone(329.63, 0.15, 'sine'), 100); // E4
    setTimeout(() => playTone(392.00, 0.15, 'sine'), 200); // G4
    setTimeout(() => playTone(523.25, 0.4, 'sine'), 300); // C5
  }

  function playLoss() {
    // Sad descending slide
    playTone(220, 0.6, 'sawtooth', 110);
  }

  function playDraw() {
    // Two quick neutral beeps
    playTone(220, 0.15, 'triangle');
    setTimeout(() => playTone(220, 0.15, 'triangle'), 150);
  }

  function playResetSound() {
    // Laser sweeps up
    playTone(150, 0.35, 'sine', 600);
  }

  // ==========================================
  // CONFETTI CANVAS ENGINE
  // ==========================================
  
  let confettiParticles = [];
  let confettiAnimationId = null;

  function resizeCanvas() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class ConfettiParticle {
    constructor() {
      this.x = Math.random() * confettiCanvas.width;
      this.y = Math.random() * confettiCanvas.height - confettiCanvas.height;
      this.size = Math.random() * 8 + 6;
      this.color = ['#00f0ff', '#ff007f', '#fbbf24', '#10b981', '#8b5cf6', '#f97316'][Math.floor(Math.random() * 6)];
      this.speed = Math.random() * 3 + 2;
      this.angle = Math.random() * 360;
      this.spinSpeed = Math.random() * 4 - 2;
      this.wobble = Math.random() * 10;
      this.wobbleSpeed = Math.random() * 0.05 + 0.02;
    }

    update() {
      this.y += this.speed;
      this.x += Math.sin(this.wobble) * 0.5;
      this.wobble += this.wobbleSpeed;
      this.angle += this.spinSpeed;
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle * Math.PI / 180);
      ctx.fillStyle = this.color;
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
      ctx.restore();
    }
  }

  function startConfetti() {
    stopConfetti();
    confettiParticles = Array.from({ length: 120 }, () => new ConfettiParticle());
    animateConfetti();
  }

  function stopConfetti() {
    if (confettiAnimationId) {
      cancelAnimationFrame(confettiAnimationId);
      confettiAnimationId = null;
    }
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }

  function animateConfetti() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    let active = false;

    confettiParticles.forEach(p => {
      p.update();
      p.draw();
      if (p.y < confettiCanvas.height) {
        active = true;
      }
    });

    if (active) {
      confettiAnimationId = requestAnimationFrame(animateConfetti);
    }
  }

  // ==========================================
  // STATS & PERSISTENCE
  // ==========================================
  
  function loadStats() {
    scoreP1 = parseInt(localStorage.getItem('ns_score_p1')) || 0;
    scoreP2 = parseInt(localStorage.getItem('ns_score_p2')) || 0;
    scoreDraws = parseInt(localStorage.getItem('ns_score_draws')) || 0;
    currentStreak = parseInt(localStorage.getItem('ns_current_streak')) || 0;
    maxStreak = parseInt(localStorage.getItem('ns_max_streak')) || 0;
    isMuted = localStorage.getItem('ns_muted') === 'true';
    
    // Names
    p1Name = localStorage.getItem('ns_p1_name') || 'Player 1';
    gameMode = localStorage.getItem('ns_game_mode') || 'ai';
    aiDifficulty = localStorage.getItem('ns_difficulty') || 'medium';
    
    if (gameMode === 'ai') {
      p2Name = 'System AI';
      p2NameInput.value = 'System AI';
      p2NameInput.disabled = true;
    } else {
      p2Name = localStorage.getItem('ns_p2_name') || 'Player 2';
      p2NameInput.value = p2Name;
      p2NameInput.disabled = false;
    }

    // Set UI values
    p1NameInput.value = p1Name;
    
    // Check radio buttons
    document.querySelector(`input[name="game-mode"][value="${gameMode}"]`).checked = true;
    document.querySelector(`input[name="ai-difficulty"][value="${aiDifficulty}"]`).checked = true;
    
    if (gameMode === 'pvp') {
      difficultyGroup.style.display = 'none';
    } else {
      difficultyGroup.style.display = 'block';
    }

    updateMuteUI();
    updateScoreboardUI();
  }

  function saveStats() {
    localStorage.setItem('ns_score_p1', scoreP1);
    localStorage.setItem('ns_score_p2', scoreP2);
    localStorage.setItem('ns_score_draws', scoreDraws);
    localStorage.setItem('ns_current_streak', currentStreak);
    localStorage.setItem('ns_max_streak', maxStreak);
  }

  function updateScoreboardUI() {
    p1ScoreLabel.textContent = `${p1Name} (X)`;
    p2ScoreLabel.textContent = `${p2Name} (O)`;
    
    scoreP1El.textContent = scoreP1;
    scoreP2El.textContent = scoreP2;
    scoreDrawsEl.textContent = scoreDraws;
    
    statStreakEl.textContent = maxStreak;
    
    const totalGames = scoreP1 + scoreP2 + scoreDraws;
    if (totalGames === 0) {
      statWinrateEl.textContent = '0%';
    } else {
      const winRate = ((scoreP1 / totalGames) * 100).toFixed(0);
      statWinrateEl.textContent = `${winRate}%`;
    }
  }

  function updateMuteUI() {
    if (isMuted) {
      soundIcon.innerHTML = `<path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
      muteToggleBtn.classList.add('muted');
    } else {
      soundIcon.innerHTML = `<path d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
      muteToggleBtn.classList.remove('muted');
    }
  }

  // ==========================================
  // VISUALS & SVG MARKERS
  // ==========================================
  
  function drawXMarker() {
    return `
      <svg class="marker-svg" viewBox="0 0 100 100">
        <line x1="20" y1="20" x2="80" y2="80" class="path-x" />
        <line x1="80" y1="20" x2="20" y2="80" class="path-x path-x-2" />
      </svg>
    `;
  }

  function drawOMarker() {
    return `
      <svg class="marker-svg" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="30" class="path-o" />
      </svg>
    `;
  }

  function triggerWinningStrike(comboIndex, winner) {
    const coords = STRIKE_COORDINATES[comboIndex];
    if (!coords) return;
    
    // Set coordinates
    strikeLine.setAttribute('x1', coords.x1);
    strikeLine.setAttribute('y1', coords.y1);
    strikeLine.setAttribute('x2', coords.x2);
    strikeLine.setAttribute('y2', coords.y2);
    
    // Clear previous win classes
    strikeLine.className.baseVal = '';
    strikeLine.classList.add(winner === 'X' ? 'x-win' : 'o-win');
    
    // Display SVG and animate
    strikeSvg.style.display = 'block';
    
    // Offset force trigger reflow
    strikeLine.getBoundingClientRect();
    
    // Animate line in
    strikeLine.style.strokeDashoffset = '0';
  }

  function clearWinningStrike() {
    strikeLine.style.strokeDashoffset = '450';
    setTimeout(() => {
      strikeSvg.style.display = 'none';
    }, 150);
  }

  function updateStatusIndicator() {
    turnDot.className = 'pulse-dot active';
    if (currentPlayer === 'X') {
      turnDot.classList.add('x-turn');
      gameStatusDisplay.textContent = `${p1Name}'s turn (Place X)`;
    } else {
      turnDot.classList.add('o-turn');
      gameStatusDisplay.textContent = `${p2Name}'s turn (Place O)`;
    }
  }

  // ==========================================
  // GAMEPLAY FLOW
  // ==========================================
  
  function handleCellClick(cell, index) {
    if (board[index] !== '' || !isGameActive) return;
    
    // Register human turn
    makeMove(index, currentPlayer);
    
    if (checkGameEnd(currentPlayer)) {
      return;
    }
    
    // Switch Turn
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateStatusIndicator();
    
    // AI Turn trigger
    if (gameMode === 'ai' && currentPlayer === 'O') {
      isGameActive = false; // Block user inputs during AI turn
      gameStatusDisplay.textContent = 'AI is calculating...';
      
      const thinkTime = Math.random() * 200 + 400; // Natural latency
      setTimeout(() => {
        const aiMove = getAIMove();
        makeMove(aiMove, 'O');
        
        if (checkGameEnd('O')) {
          return;
        }
        
        currentPlayer = 'X';
        isGameActive = true;
        updateStatusIndicator();
      }, thinkTime);
    }
  }

  function makeMove(index, player) {
    board[index] = player;
    const cell = cells[index];
    cell.disabled = true;
    
    // Inject custom SVG with delay for smooth draws
    if (player === 'X') {
      cell.innerHTML = drawXMarker();
      playTap();
    } else {
      cell.innerHTML = drawOMarker();
      playTapO();
    }
  }

  function checkGameEnd(player) {
    let roundWon = false;
    let comboIndex = null;
    let winningCombo = null;

    for (let i = 0; i < WINNING_COMBINATIONS.length; i++) {
      const combo = WINNING_COMBINATIONS[i];
      if (board[combo[0]] === player && board[combo[1]] === player && board[combo[2]] === player) {
        roundWon = true;
        comboIndex = i;
        winningCombo = combo;
        break;
      }
    }

    if (roundWon) {
      isGameActive = false;
      triggerWinningStrike(comboIndex, player);
      
      // Highlight winning elements
      winningCombo.forEach(idx => {
        cells[idx].classList.add('highlighted-winning-cell');
      });

      // Update scores
      if (player === 'X') {
        scoreP1++;
        currentStreak++;
        if (currentStreak > maxStreak) maxStreak = currentStreak;
        
        gameStatusDisplay.textContent = `${p1Name} wins the match! 🎉`;
        playWin();
        startConfetti();
      } else {
        scoreP2++;
        currentStreak = 0;
        
        gameStatusDisplay.textContent = `${p2Name} dominates! 💀`;
        playLoss();
      }
      
      saveStats();
      updateScoreboardUI();
      return true;
    }

    const roundDraw = !board.includes('');
    if (roundDraw) {
      isGameActive = false;
      scoreDraws++;
      currentStreak = 0;
      
      triggerWinningStrike(-1, 'draw');
      gameStatusDisplay.textContent = 'Perfect Stalemate (Draw) 🤝';
      playDraw();
      
      saveStats();
      updateScoreboardUI();
      return true;
    }

    return false;
  }

  function restartMatch() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    isGameActive = true;
    
    clearWinningStrike();
    stopConfetti();
    playResetSound();
    
    cells.forEach(cell => {
      cell.innerHTML = '';
      cell.disabled = false;
      cell.className = 'cell-btn';
    });
    
    updateStatusIndicator();
  }

  function resetAllScores() {
    scoreP1 = 0;
    scoreP2 = 0;
    scoreDraws = 0;
    currentStreak = 0;
    maxStreak = 0;
    
    saveStats();
    updateScoreboardUI();
    restartMatch();
  }

  // ==========================================
  // SYSTEM AI (EASY, MEDIUM, MINIMAX)
  // ==========================================
  
  function getAIMove() {
    // 1. Easy difficulty: 45% random choice, 55% perfect minimax choice
    if (aiDifficulty === 'easy') {
      if (Math.random() < 0.45) {
        return getRandomMove();
      }
      return getBestMinimaxMove();
    }
    
    // 2. Medium difficulty: 25% random choice, 75% perfect minimax choice
    if (aiDifficulty === 'medium') {
      if (Math.random() < 0.25) {
        return getRandomMove();
      }
      return getBestMinimaxMove();
    }
    
    // 3. Perfect unbeatable minimax
    return getBestMinimaxMove();
  }

  function getRandomMove() {
    const emptyIndices = [];
    board.forEach((val, idx) => {
      if (val === '') emptyIndices.push(idx);
    });
    return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  }

  function getBestMinimaxMove() {
    let bestScore = -Infinity;
    let move = 0;

    for (let i = 0; i < 9; i++) {
      if (board[i] === '') {
        board[i] = 'O';
        let score = minimax(board, 0, false);
        board[i] = '';
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }
    return move;
  }

  function minimax(boardState, depth, isMaximizing) {
    // Check terminals
    if (checkWinning(boardState, 'O')) return 10 - depth;
    if (checkWinning(boardState, 'X')) return depth - 10;
    if (!boardState.includes('')) return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (boardState[i] === '') {
          boardState[i] = 'O';
          let score = minimax(boardState, depth + 1, false);
          boardState[i] = '';
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (boardState[i] === '') {
          boardState[i] = 'X';
          let score = minimax(boardState, depth + 1, true);
          boardState[i] = '';
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  }

  function checkWinning(boardState, player) {
    for (let i = 0; i < WINNING_COMBINATIONS.length; i++) {
      const combo = WINNING_COMBINATIONS[i];
      if (boardState[combo[0]] === player && boardState[combo[1]] === player && boardState[combo[2]] === player) {
        return true;
      }
    }
    return false;
  }

  // ==========================================
  // THEME ENGINE SELECTION
  // ==========================================
  
  const themeBtns = document.querySelectorAll('.theme-btn');
  
  function initTheme() {
    const savedTheme = localStorage.getItem('ns_theme') || 'cyberpunk';
    setTheme(savedTheme);
  }

  function setTheme(themeId) {
    document.documentElement.setAttribute('data-theme', themeId);
    localStorage.setItem('ns_theme', themeId);
    
    themeBtns.forEach(btn => {
      if (btn.getAttribute('data-theme-id') === themeId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const themeId = btn.getAttribute('data-theme-id');
      setTheme(themeId);
      // Play brief high frequency synth beep when selecting theme
      playTone(660, 0.08, 'sine');
    });
  });

  // ==========================================
  // EVENT LISTENERS
  // ==========================================
  
  cells.forEach(cell => {
    cell.addEventListener('click', () => {
      const index = parseInt(cell.getAttribute('data-index'));
      handleCellClick(cell, index);
    });
  });

  resetGameBtn.addEventListener('click', restartMatch);
  clearStatsBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all game metrics? This cannot be undone.')) {
      resetAllScores();
    }
  });

  // Mode Selection
  modeAiRadio.addEventListener('change', () => {
    gameMode = 'ai';
    localStorage.setItem('ns_game_mode', 'ai');
    difficultyGroup.style.display = 'block';
    
    p2Name = 'System AI';
    p2NameInput.value = 'System AI';
    p2NameInput.disabled = true;
    
    resetAllScores();
  });

  modePvpRadio.addEventListener('change', () => {
    gameMode = 'pvp';
    localStorage.setItem('ns_game_mode', 'pvp');
    difficultyGroup.style.display = 'none';
    
    p2Name = localStorage.getItem('ns_p2_name') || 'Player 2';
    p2NameInput.value = p2Name;
    p2NameInput.disabled = false;
    
    resetAllScores();
  });

  // Difficulty selection
  [diffEasyRadio, diffMediumRadio, diffHardRadio].forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.checked) {
        aiDifficulty = radio.value;
        localStorage.setItem('ns_difficulty', aiDifficulty);
        playTone(440, 0.06, 'triangle');
      }
    });
  });

  // Name changes with debounced persistence
  p1NameInput.addEventListener('input', () => {
    const val = p1NameInput.value.trim();
    p1Name = val || 'Player 1';
    localStorage.setItem('ns_p1_name', p1Name);
    updateScoreboardUI();
  });

  p2NameInput.addEventListener('input', () => {
    if (gameMode === 'pvp') {
      const val = p2NameInput.value.trim();
      p2Name = val || 'Player 2';
      localStorage.setItem('ns_p2_name', p2Name);
      updateScoreboardUI();
    }
  });

  // Sound FX toggle
  muteToggleBtn.addEventListener('click', () => {
    isMuted = !isMuted;
    localStorage.setItem('ns_muted', isMuted);
    updateMuteUI();
    
    if (!isMuted) {
      // Play happy confirmation sound
      playTone(440, 0.1, 'sine');
    }
  });

  // Start initialization
  loadStats();
  initTheme();
  restartMatch();
});
