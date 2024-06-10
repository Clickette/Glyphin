const { SlashCommandBuilder } = require('discord.js');
const { TwoZeroFourEight } = require('discord-gamecord');

module.exports = {
  data: new SlashCommandBuilder()
      .setName('2048')
      .setDescription('Play a 2048 game inside discord.'),

  execute(interaction) {
      const Game = new TwoZeroFourEight({
          message: interaction,
          isSlashGame: true,
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