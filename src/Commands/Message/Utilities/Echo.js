const { prefix } = require('../../../Config/config.json');

module.exports = {
    name: "echo",

    execute(message, args) {
        message.channel.send({ content: (message.content).replace(`${prefix}echo `, '') });
    },
};