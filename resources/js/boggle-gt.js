var boggleGT = {
  gameConfig : {
    size : 5,
    minWordLength : 3,
    roundTime : 120
  },
  
  gameId : 123,
  
  board : new Array(),
  dice : new Array("yqyswf", "sztllp", "xolrql", "hcthjt", "jkhhwf", "ioeoau", "qbrlpr", "ggnetn", "aaeouo", "eiaeao", "scywsj", "ioeuee", "aioeea", "cmhkzn", "hgbmgn", "ouoaei", "sysyfd", "mlgmcp", "uieeoo", "dbxvdy", "fnrddw", "oaaeeu", "vmrgzr", "dkxmpk", "bvtnts"),
  solutions : new Array(),
  solutionStats : {
    wordCount : {}
  },
  
  generateTable : function() {
    boggleGT.randomize();
    $('#board').empty();
    for (var i = 0; i < boggleGT.gameConfig.size; i++) {
      var row = $('<tr/>');
      for (var j = 0; j < boggleGT.gameConfig.size; j++) {
        var letter = boggleGT.board[i * boggleGT.gameConfig.size + j].toUpperCase();
        if (letter == 'Q') {
          letter = 'Qu';
        }
        $('<td/>').text(letter).appendTo(row);
      }
      row.appendTo($('#board'));
    }
    
    boggleGT.generateSolutions();
  },
  
  randomize : function() {
    //Math.seedrandom("seedstr");
    var i, j, k;
    var remaining = new Array();
    for ( i = 0; i < boggleGT.gameConfig.size * boggleGT.gameConfig.size; i++) {
      j = Math.floor(Math.random() * boggleGT.dice.length);
      var die = boggleGT.dice[j];
      j = Math.floor(Math.random() * 6);
      var c = die.charAt(j);
      boggleGT.board[i] = c;
    }
  },
  
  convertQs : function(word) {
    var w = word.toUpperCase();
    return w.replace(/Q/g, 'Qu');
  },
  
  findWord : function(word) {
    if (word.length == 0)
      return 0;
    var i, j;
    for ( i = 0; i < boggleGT.gameConfig.size; i++) {
      for ( j = 0; j < boggleGT.gameConfig.size; j++) {
        if (boggleGT.board[i + j * boggleGT.gameConfig.size] == word.charAt(0)) {
          if (boggleGT.findSequence(word, i, j))
            return 1;
        }
      }
    }
    return 0;
  },

  safeBoard : function(i, j) {
    if ((i < 0) || (j < 0) || (i >= boggleGT.gameConfig.size) || (j >= boggleGT.gameConfig.size))
      return '*';
    return boggleGT.board[i + j * boggleGT.gameConfig.size];
  },

  findSequence : function(seq, i, j) {
    if (seq.length <= 1)
      return 1;
    var s;
    s = boggleGT.board[i + j * boggleGT.gameConfig.size];
    boggleGT.board[i + j * boggleGT.gameConfig.size] = ' ';
    for (var u = -1; u <= 1; u = u + 1) {
      for (var v = -1; v <= 1; v = v + 1) {
        if (boggleGT.safeBoard(i + u, j + v) == seq.charAt(1)) {
          if (boggleGT.findSequence(seq.substr(1), i + u, j + v)) {
            boggleGT.board[i + j * boggleGT.gameConfig.size] = s;
            return 1;
          }
        }
      }
    }
    boggleGT.board[i + j * boggleGT.gameConfig.size] = s;
    return 0;
  },
  
  generateSolutions : function() {
    // Generate the dictionary for the board
    boggleGT.solutions = new Array();
    boggleGT.solutionStats.wordCount['3'] = 0;
    boggleGT.solutionStats.wordCount['4'] = 0;
    boggleGT.solutionStats.wordCount['5'] = 0;
    boggleGT.solutionStats.wordCount['6 or more'] = 0;
    for (var i = 0; i < words.length; i++) {
      if (words[i].length >= boggleGT.gameConfig.minWordLength) {
        if (boggleGT.findWord(words[i])) {
          boggleGT.solutions.push(words[i]);
          if (words[i].length >= 6) {
            boggleGT.solutionStats.wordCount['6 or more']++;
          } else {
            boggleGT.solutionStats.wordCount[words[i].length.toString()]++;
          }
        }
      }
    }
    
    boggleGT.updateBoardStats();
    boggleGT.bootstrapFirebaseGame();
  },
  
  updateBoardStats : function() {
    $('#totalWords').children('span').text(boggleGT.solutions.length);
    $('#threeLetterWords').children('span').text(boggleGT.solutionStats.wordCount['3']);
    $('#fourLetterWords').children('span').text(boggleGT.solutionStats.wordCount['4']);
    $('#fiveLetterWords').children('span').text(boggleGT.solutionStats.wordCount['5']);
    $('#largeWords').children('span').text(boggleGT.solutionStats.wordCount['6 or more']);
    $('#boardStats').show();
  },

  getGameRef : function() {        
    var rootRef = new Firebase('https://bdangor.firebaseIO.com/');
    var gameRef = rootRef.child('games/' + boggleGT.gameId);
    return gameRef;
  },
  
  bootstrapFirebaseGame : function() {
    // Initiate remaining time to round time
    boggleGT.getGameRef().set({timeRemaining : boggleGT.gameConfig.roundTime});
    
    // Delete the word list and repopulate
    //boggleGT.getGameRef().child('wordList').remove();
    var wordListRef = boggleGT.getGameRef().child('wordList');
    for (i = 0; i < boggleGT.solutions.length; i++) {
      wordListRef.child(boggleGT.solutions[i]).set(1);
    }
  }
};
