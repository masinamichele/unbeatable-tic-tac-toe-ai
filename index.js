const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const firstPlayer = process.argv[2] || 'player';
if (!['player', 'cpu'].includes(firstPlayer)) {
  console.log(`Invalid argument at position 1: ${firstPlayer}. Must be one of: player, cpu`);
  process.exit(1);
}

const numberMode = process.argv[3] || 'normal';
if (!['normal', 'reverse'].includes(numberMode)) {
  console.log(`Invalid argument at position 2: ${numberMode}. Must be one of: normal, reverse`);
  process.exit(1);
}

const _ = 0; // Empty
const P = 1; // Player
const C = 2; // CPU
const $ = 3; // Any non-empty

const charset = { [_]: '', [C]: '◯', [P]: '✖' };
const color = { [charset[_]]: 30, [charset[C]]: 33, [charset[P]]: 32 };

const boardIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

// prettier-ignore
const [   /* ___L, ___M, ___R */
  /* Top_ */ TopL, TopM, TopR,
  /* Mid_ */ MidL, MidM, MidR,
  /* Bot_ */ BotL, BotM, BotR,
] = boardIndices;

const Rows = { Top: [TopL, TopM, TopR], Mid: [MidL, MidM, MidR], Bot: [BotL, BotM, BotR] };
const Cols = { L: [TopL, MidL, BotL], M: [TopM, MidM, BotM], R: [TopR, MidR, BotR] };
const Diag = { Pri: [TopL, MidM, BotR], Sec: [TopR, MidM, BotL] };

const board = [_, _, _, _, _, _, _, _, _];

let winner = null;
let hasError = false;

const main = () => {
  if (firstPlayer == 'cpu') {
    const cpuCell = computeNextMove();
    if (cpuCell != null) board[cpuCell] = C;
  }

  loop();
};

const random = (values) => values[(Math.random() * values.length) | 0];
const match = (positions, match) => {
  return positions
    .map((pos) => board[pos])
    .every((cell, i) => {
      if (match[i] == $) return cell != _;
      return match[i] == cell;
    });
};
const all = (v) => Array(9).fill(v);

const computeNextMove = () => {
  // If the CPU can win in this turn, win

  // Horizontal pair
  if (match(Rows.Top, [_, C, C])) return TopL;
  if (match(Rows.Mid, [_, C, C])) return MidL;
  if (match(Rows.Bot, [_, C, C])) return BotL;
  if (match(Rows.Top, [C, _, C])) return TopM;
  if (match(Rows.Mid, [C, _, C])) return MidM;
  if (match(Rows.Bot, [C, _, C])) return BotM;
  if (match(Rows.Top, [C, C, _])) return TopR;
  if (match(Rows.Mid, [C, C, _])) return MidR;
  if (match(Rows.Bot, [C, C, _])) return BotR;
  // Vertical pair
  if (match(Cols.L, [_, C, C])) return TopL;
  if (match(Cols.M, [_, C, C])) return TopM;
  if (match(Cols.R, [_, C, C])) return TopR;
  if (match(Cols.L, [C, _, C])) return BotL;
  if (match(Cols.M, [C, _, C])) return MidM;
  if (match(Cols.R, [C, _, C])) return MidR;
  if (match(Cols.L, [C, C, _])) return BotL;
  if (match(Cols.M, [C, C, _])) return BotM;
  if (match(Cols.R, [C, C, _])) return BotR;
  // Diagonal pair
  if (match(Diag.Pri, [_, C, C])) return TopL;
  if (match(Diag.Pri, [C, _, C])) return MidM;
  if (match(Diag.Pri, [C, C, _])) return BotR;
  if (match(Diag.Sec, [_, C, C])) return TopR;
  if (match(Diag.Sec, [C, _, C])) return MidM;
  if (match(Diag.Sec, [C, C, _])) return BotL;

  // If the player could win in the next turn, prevent it

  // Horizontal pair
  if (match(Rows.Top, [_, P, P])) return TopL;
  if (match(Rows.Mid, [_, P, P])) return MidL;
  if (match(Rows.Bot, [_, P, P])) return BotL;
  if (match(Rows.Top, [P, _, P])) return TopM;
  if (match(Rows.Mid, [P, _, P])) return MidM;
  if (match(Rows.Bot, [P, _, P])) return BotM;
  if (match(Rows.Top, [P, P, _])) return TopR;
  if (match(Rows.Mid, [P, P, _])) return MidR;
  if (match(Rows.Bot, [P, P, _])) return BotR;
  // Vertical pair
  if (match(Cols.L, [_, P, P])) return TopL;
  if (match(Cols.M, [_, P, P])) return TopM;
  if (match(Cols.R, [_, P, P])) return TopR;
  if (match(Cols.L, [P, _, P])) return BotL;
  if (match(Cols.M, [P, _, P])) return MidM;
  if (match(Cols.R, [P, _, P])) return MidR;
  if (match(Cols.L, [P, P, _])) return BotL;
  if (match(Cols.M, [P, P, _])) return BotM;
  if (match(Cols.R, [P, P, _])) return BotR;
  // Diagonal pair
  if (match(Diag.Pri, [_, P, P])) return TopL;
  if (match(Diag.Pri, [P, _, P])) return MidM;
  if (match(Diag.Pri, [P, P, _])) return BotR;
  if (match(Diag.Sec, [_, P, P])) return TopR;
  if (match(Diag.Sec, [P, _, P])) return MidM;
  if (match(Diag.Sec, [P, P, _])) return BotL;

  // Given that the CPU cannot win in this turn
  // and the player cannot win in the next,
  // prepare for reaching a win condition

  // If no corner is used, occupy one
  if (match([TopL, TopR, BotL, BotR], all(_))) return random([TopL, TopR, BotL, BotR]);

  // Occupy the corner opposite to one already owned by the CPU
  if (match([TopL, BotR], [_, C])) return TopL;
  if (match([TopR, BotL], [_, C])) return TopR;
  if (match([TopL, BotR], [C, _])) return BotR;
  if (match([TopR, BotL], [C, _])) return BotL;

  // Occupy the corner opposite to the player
  if (match([TopL, BotR], [_, P])) return TopL;
  if (match([TopR, BotL], [_, P])) return TopR;
  if (match([TopL, BotR], [P, _])) return BotR;
  if (match([TopR, BotL], [P, _])) return BotL;

  // Occupy the corner adjacent to one already owned by the CPU
  if (match([TopL, TopR], [_, C])) return TopL;
  if (match([TopL, TopR], [C, _])) return TopR;
  if (match([BotL, BotR], [_, C])) return BotL;
  if (match([BotL, BotR], [C, _])) return BotR;
  if (match([TopL, BotL], [_, C])) return TopL;
  if (match([TopL, BotL], [C, _])) return BotL;
  if (match([TopR, BotR], [C, _])) return BotR;
  if (match([TopR, BotR], [_, C])) return TopR;

  // If there are any spots left, the board is
  // probably symmetric so we can choose any spot
  const emptySpots = getEmptySpots();
  if (emptySpots.length > 0) return random(emptySpots);

  // No move found!
  hasError = true;
  return null;
};

const cpuWinSentences = [
  'Are you even trying?',
  'That was easy.',
  'Zzz...',
  'QED.',
  'As always.',
  'Yay!',
  'You stand no chance!',
  'Wanna try again? Are you sure?',
  "You're wasting time.",
  'In other news, water is wet.',
  'What a news!',
  'Is that surprising?',
  'Of course.',
  "You can't beat me.",
  'Stop trying.',
  'Why bother?',
];

const loop = async () => {
  header();
  drawBoard();

  if (hasError) {
    console.log(`Submit this to the developer: ${board.join('')}#${+firstPlayer == 'cpu'}_${+numberMode == 'reverse'}\n`);
    process.exit(1);
  }

  if (winner == C) console.log(`You lost! ${random(cpuWinSentences)}\n`);
  if (winner == P) console.log('No way! You won!\n');
  if (winner == $) console.log('Draw!\n');
  if (winner != null) process.exit(0);

  let playerCell = await queryInput();
  if (isValid(playerCell)) {
    playerCell = mapIndex(+playerCell);
    board[playerCell - 1] = P;
    if (!isBoardFilled()) {
      const cpuCell = computeNextMove();
      if (cpuCell != null) board[cpuCell] = C;
    }
  }

  if (win()) winner = C;
  else if (lose()) winner = P;
  else if (isBoardFilled()) winner = $;

  loop();
};

const header = () => {
  console.clear();
  console.log('\x1b[34m<\x1b[36m<\x1b[35m Unbeatable Tic-Tac-Toe AI \x1b[36m>\x1b[34m>\x1b[0m');
  console.log();
  console.log(`\x1b[${color[charset[P]]}m${charset[P]}\x1b[0m = Player, \x1b[${color[charset[C]]}m${charset[C]}\x1b[0m = CPU`);
  if (firstPlayer == 'cpu') console.log(`CPU goes first.`);
  else console.log(`Player goes first.`);
  console.log();
};

const mapIndex = (value) => {
  if (!numberMode == 'reverse') return value;
  if ([1, 2, 3].includes(value)) return value + 6;
  if ([7, 8, 9].includes(value)) return value - 6;
  return value;
};

const drawBoard = () => {
  const c = (i) => {
    const char = charset[board[i]];
    return `\x1b[${color[char]}m${char || mapIndex(i + 1)}\x1b[0m`;
  };
  console.log(` ${c(0)} │ ${c(1)} │ ${c(2)}`);
  console.log('───┼───┼───');
  console.log(` ${c(3)} │ ${c(4)} │ ${c(5)}  ${hasError ? '\x1b[31mUnable to find move!\x1b[0m' : ''}`);
  console.log('───┼───┼───');
  console.log(` ${c(6)} │ ${c(7)} │ ${c(8)}`);
  console.log();
};

const isValid = (value) => {
  value = mapIndex(+value);
  if (isNaN(value)) return false;
  if (value != Math.trunc(value)) return false;
  if (value < 1 || value > 9) return false;
  if (board[value - 1] != _) return false;
  return true;
};

const queryInput = () => new Promise((resolve) => rl.question('Choose your cell: ', (answer) => resolve(answer)));

const isBoardEmpty = () => match(boardIndices, all(_));

const isBoardFilled = () => match(boardIndices, all($));

const getEmptySpots = () => {
  return board
    .map((v, i) => [v, i])
    .filter(([v]) => v == _)
    .map(([_, i]) => i);
};

const win = () => {
  return (
    match(Rows.Top, all(C)) ||
    match(Rows.Mid, all(C)) ||
    match(Rows.Bot, all(C)) ||
    match(Rows.Top, all(C)) ||
    match(Rows.Mid, all(C)) ||
    match(Rows.Bot, all(C)) ||
    match(Rows.Top, all(C)) ||
    match(Rows.Mid, all(C)) ||
    match(Rows.Bot, all(C)) ||
    match(Cols.L, all(C)) ||
    match(Cols.M, all(C)) ||
    match(Cols.R, all(C)) ||
    match(Cols.L, all(C)) ||
    match(Cols.M, all(C)) ||
    match(Cols.R, all(C)) ||
    match(Cols.L, all(C)) ||
    match(Cols.M, all(C)) ||
    match(Cols.R, all(C)) ||
    match(Diag.Pri, all(C)) ||
    match(Diag.Pri, all(C)) ||
    match(Diag.Pri, all(C)) ||
    match(Diag.Sec, all(C)) ||
    match(Diag.Sec, all(C)) ||
    match(Diag.Sec, all(C))
  );
};

const lose = () => {
  return (
    match(Rows.Top, all(P)) ||
    match(Rows.Mid, all(P)) ||
    match(Rows.Bot, all(P)) ||
    match(Rows.Top, all(P)) ||
    match(Rows.Mid, all(P)) ||
    match(Rows.Bot, all(P)) ||
    match(Rows.Top, all(P)) ||
    match(Rows.Mid, all(P)) ||
    match(Rows.Bot, all(P)) ||
    match(Cols.L, all(P)) ||
    match(Cols.M, all(P)) ||
    match(Cols.R, all(P)) ||
    match(Cols.L, all(P)) ||
    match(Cols.M, all(P)) ||
    match(Cols.R, all(P)) ||
    match(Cols.L, all(P)) ||
    match(Cols.M, all(P)) ||
    match(Cols.R, all(P)) ||
    match(Diag.Pri, all(P)) ||
    match(Diag.Pri, all(P)) ||
    match(Diag.Pri, all(P)) ||
    match(Diag.Sec, all(P)) ||
    match(Diag.Sec, all(P)) ||
    match(Diag.Sec, all(P))
  );
};

main();
