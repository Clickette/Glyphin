const { SlashCommandBuilder } = require('discord.js');
const { Snake } = require('discord-gamecord');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('snake')
  .setDescription('Play a snake game inside discord.'),
	
	execute(interaction) {
		const Game = new Snake({
            message: interaction,
            isSlashGame: true,
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