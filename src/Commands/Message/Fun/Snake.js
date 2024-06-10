const { Snake } = require('discord-gamecord');

module.exports = {
	name: "snake",
	description: "Play a snake game inside discord.",
	cooldown: 10,
	
	execute(message, args) {
		const Game = new Snake({
            message: message,
            isSlashGame: false,
            embed: {
              title: 'Snek・Glyphin',
              overTitle: 'Snek・Game Over!',
              color: '#F8C822'
            },
            emojis: {
              board: '⬛',
              food: '🍎',
              up: '⬆️', 
              down: '⬇️',
              left: '⬅️',
              right: '➡️',
            },
            stopButton: 'Stop',
            timeoutTime: 60000,
            snake: { head: '🟢', body: '🟩', tail: '🟢', over: '💀' },
            foods: ['🍎', '🍇', '🍊', '🫐', '🥕', '🥝', '🌽'],
            playerOnlyMessage: 'Only {player} can use these buttons!'
        });
          
        Game.startGame();
	},
};