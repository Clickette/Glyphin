const { TicTacToe } = require('discord-gamecord');

module.exports = {
	name: "tictactoe",
	description: "Play tic tac toe inside discord.",
	cooldown: 10,
	
	execute(message, args) {
		const Game = new TicTacToe({
            message: message,
            isSlashGame: false,
            opponent: message.mentions.users.first(),
            embed: {
              title: 'TTT・Glyphin',
              color: '#F8C822',
              statusTitle: 'Status',
              overTitle: 'Game Over!'
            },
            emojis: {
              xButton: '❌',
              oButton: '🔵',
              blankButton: '➖'
            },
            mentionUser: true,
            timeoutTime: 60000,
            xButtonStyle: 'DANGER',
            oButtonStyle: 'PRIMARY',
            turnMessage: '{emoji} | It\'s the turn of player **{player}**!',
            winMessage: '{emoji} | **{player}** won the game!',
            tieMessage: 'The result was a tie. No one won the game!',
            timeoutMessage: 'The game wasn\'t finished. No one won the game!',
            playerOnlyMessage: 'Only {player} and {opponent} can use these buttons!'
        });
          
        Game.startGame();
	},
};