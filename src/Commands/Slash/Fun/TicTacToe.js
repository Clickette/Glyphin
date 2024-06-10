const { SlashCommandBuilder } = require('discord.js');
const { TicTacToe } = require('discord-gamecord');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('tictactoe')
  .setDescription('Play tic tac toe inside discord.')
  .addUserOption(options => options.setName("opponent").setDescription("The user you want to play this game against.").setRequired(true)),
	
	execute(interaction) {
		const Game = new TicTacToe({
            message: interaction,
            isSlashGame: true,
            opponent: interaction.options.getUser('opponent'),
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