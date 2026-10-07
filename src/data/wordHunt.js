const wordBank = `ABOUT ABOVE ACTOR ACORN ADULT AFTER AGAIN AGENT AGREE AISLE ALARM ALBUM ALERT ALIKE ALIVE ALLOW ALONE ALONG ALTER AMONG ANGEL ANGER ANGLE APPLE APRIL ARENA ARGUE ARISE ARMOR ARROW ASIDE ASSET AUDIO AVOID AWAKE AWARD AWARE BADGE BAKER BASIC BEACH BEGIN BEING BELOW BENCH BIRTH BLACK BLAME BLANK BLAST BLAZE BLEND BLIND BLOCK BLOOM BOARD BOOST BRAIN BRAND BRAVE BREAD BREAK BRICK BRIDE BRIEF BRING BROAD BROKE BROWN BRUSH BUILD BUNCH BURST CABLE CANDY CARRY CATCH CAUSE CHAIN CHAIR CHALK CHARM CHART CHASE CHEAP CHECK CHEER CHEST CHIEF CHILD CHINA CHOICE CHOOSE CHUNK CIDER CIRCLE CLAIM CLASS CLEAN CLEAR CLERK CLICK CLIMB CLOCK CLOSE CLOUD COACH COAST COLOR COMET COMIC COUNT COURT COVER CRAFT CRANE CRASH CREAM CREEK CRIME CROSS CROWD CROWN CURVE CYCLE DAILY DANCE DEALT DEBUT DELAY DEPTH DIARY DIGIT DIRTY DOUBT DOZEN DRAFT DRAMA DREAM DRESS DRINK DRIVE EARLY EARTH EIGHT ELDER ELECT ELEMENT EMPTY ENEMY ENJOY ENTER ENTRY EQUAL ERROR EVENT EVERY EXACT EXIST EXTRA FAITH FALSE FANCY FAULT FAVOR FEAST FENCE FEVER FIELD FIFTH FIFTY FIGHT FINAL FIRST FLAME FLASH FLEET FLESH FLIGHT FLOOR FOCUS FORCE FRAME FRESH FRONT FRUIT FUNNY GIANT GIVEN GLASS GLOBE GLOOM GLOVE GRACE GRADE GRAIN GRAND GRANT GRAPE GRASS GREAT GREEN GUEST GUIDE HABIT HAPPY HEART HEAVY HONEY HORSE HOTEL HOUSE HUMAN HURRY IDEAL IMAGE INDEX INNER INPUT ISSUE JELLY JOINT JUDGE JUICE KNIFE KNOCK LABEL LARGE LASER LATER LAUGH LAYER LEARN LEAST LEAVE LEMON LEVEL LIGHT LIMIT LOCAL LOGIC LOOSE LUCKY LUNCH MAGIC MAJOR MAKER MARCH MATCH MAYBE MAYOR MEDIA MELON MERCY MERIT METAL METER MIGHT MINOR MINUS MODEL MONEY MONTH MORAL MOTOR MOUNT MOUSE MOUTH MOVIE MUSIC NAKED NERVE NEVER NIGHT NOBLE NOISE NORTH NOVEL NURSE OCCUR OCEAN OFFER OFTEN OLDER ORDER OTHER OUGHT OWNER PAINT PANEL PANIC PAPER PARTY PEACE PHASE PHONE PHOTO PIECE PILOT PITCH PLACE PLAIN PLANE PLANT PLATE POINT POUND POWER PRESS PRICE PRIDE PRIME PRINT PRIOR PRIZE PROOF PROUD QUEEN QUICK QUIET QUITE RADIO RAISE RANGE RAPID RATIO REACH REACT READY REALM REBEL REFER RELAX REPLY RIGHT RIVER ROBOT ROUND ROUTE ROYAL RURAL SCALE SCARE SCENE SCOPE SCORE SENSE SERVE SEVEN SHADE SHAKE SHALL SHAPE SHARE SHARP SHEEP SHELF SHELL SHIFT SHINE SHIRT SHOCK SHOOT SHORT SHOWN SIGHT SKILL SKIRT SLICE SLEEP SLIDE SLOPE SMALL SMART SMILE SMOKE SOLID SOLVE SOUND SOUTH SPACE SPARE SPEAK SPEED SPEND SPICE SPITE SPLIT SPOKE SPORT SPRAY SQUAD STAGE STAIR STAKE STAND START STATE STEAM STEEL STEEP STEER STICK STILL STOCK STONE STOOD STORE STORM STORY STRIP STUDY STYLE SUGAR SUITE SUPER SWEET TABLE TAKEN TASTE TEACH THANK THEME THERE THICK THING THINK THIRD THOSE THREE THROW TIGHT TITLE TODAY TOOTH TOTAL TOUCH TOUGH TOWER TRACK TRADE TRAIN TREAT TREND TRIAL TRIBE TRICK TROOP TRUCK TRULY TRUST TRUTH TWICE UNDER UNION UNITY UNTIL UPPER UPSET URBAN USAGE USUAL VALID VALUE VIDEO VISIT VITAL VOICE WASTE WATCH WATER WEIGH WHEEL WHERE WHICH WHILE WHITE WHOLE WHOSE WOMAN WORLD WORRY WORTH WOULD WRITE WRONG YOUTH`.toLowerCase().split(' ');

export const wordGridSize = 8;
export const wordsPerRound = 8;

const directions = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1], [0, 1],
  [1, -1], [1, 0], [1, 1]
];

const shuffle = (items) => {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]];
  }
  return shuffled;
};

const makePlacements = (word) => {
  const placements = [];
  for (let row = 0; row < wordGridSize; row += 1) {
    for (let column = 0; column < wordGridSize; column += 1) {
      for (const [rowStep, columnStep] of directions) {
        const endRow = row + rowStep * (word.length - 1);
        const endColumn = column + columnStep * (word.length - 1);
        if (endRow < 0 || endRow >= wordGridSize || endColumn < 0 || endColumn >= wordGridSize) continue;
        placements.push(Array.from({ length: word.length }, (_, index) => (
          [row + rowStep * index, column + columnStep * index]
        )));
      }
    }
  }
  return shuffle(placements);
};

export const createWordHuntRound = (candidateWords = wordBank) => {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    const targets = shuffle(candidateWords.filter((word) => word.length >= 4 && word.length <= wordGridSize))
      .slice(0, wordsPerRound)
      .sort((left, right) => right.length - left.length);
    if (targets.length < wordsPerRound) break;
    const cells = Array.from({ length: wordGridSize }, () => Array(wordGridSize).fill(''));

    const placeWord = (wordIndex) => {
      if (wordIndex === targets.length) return true;
      const word = targets[wordIndex];
      for (const placement of makePlacements(word)) {
        const fits = placement.every(([row, column], index) => (
          !cells[row][column] || cells[row][column] === word[index]
        ));
        if (!fits) continue;
        const previousLetters = placement.map(([row, column]) => cells[row][column]);
        placement.forEach(([row, column], index) => { cells[row][column] = word[index]; });
        if (placeWord(wordIndex + 1)) return true;
        placement.forEach(([row, column], index) => { cells[row][column] = previousLetters[index]; });
      }
      return false;
    };

    if (!placeWord(0)) continue;
    const letters = 'aaaaaeeeeeeiiiiiiooooonnnrrrsssstttllldddggbbccffhhmmpp';
    const grid = cells.map((row) => row.map((letter) => (
      (letter || letters[Math.floor(Math.random() * letters.length)]).toUpperCase()
    )));
    return { grid, targets };
  }

  throw new Error('Could not generate a playable Word Hunt board.');
};
