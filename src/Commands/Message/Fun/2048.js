const { TwoZeroFourEight } = require('discord-gamecord');

module.exports = {
	name: "2048",
	description: "Play a 2048 game inside discord.",
	cooldown: 10,
	
	execute(message, args) {
		const Game = new TwoZeroFourEight({
            message: message,
            isSlashGame: false,
            embed: {
              title: '2048・Glyphin',
              color: '#F8C822'
            },
            emojis: {
              up: '⬆️',
              down: '⬇️',
              left: '⬅️',
              right: '➡️',
            },
            timeoutTime: 60000,
            buttonStyle: 'PRIMARY',
            playerOnlyMessage: 'Only {player} can use these buttons!'
        });
          
        Game.startGame();
	},
};