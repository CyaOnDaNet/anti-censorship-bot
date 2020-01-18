module.exports = {
	name: 'give',
	description: 'The server owner gives points to a discord user',
	usage: '@PersonToGive #ofPoints',
	adminCommand: true,
	async execute(message, args, prefix, guildSettings, client, Discord, Music, fetch) {
    // Limited to guild owner - adjust to your own preference!
    if(message.author.id != message.guild.ownerID) return message.reply("Only the server owner can give points!");

    const user = message.mentions.users.first() || client.users.get(args[0]);
    if(!user) return message.reply("You must mention someone or give their ID!");

    const pointsToAdd = parseInt(args[1], 10);
    if(!pointsToAdd) return message.reply("You didn't tell me how many points to give...")

    // Get their current points.
    let userscore = client.getScore.get(user.id, message.guild.id);
    // It's possible to give points to a user we haven't seen, so we need to initiate defaults here too!
    if (!userscore) {
      userscore = { id: `${message.guild.id}-${user.id}`, user: user.id, guild: message.guild.id, points: 0, level: 1 }
    }
    userscore.points += pointsToAdd;

    // We also want to update their level (but we won't notify them if it changes)
    let userLevel = Math.floor(0.1 * Math.sqrt(score.points));
    userscore.level = userLevel;

    // And we save it!
    client.setScore.run(userscore);
    if (pointsToAdd <= 0) {
      message.channel.send(`https://tenor.com/view/confused-gif-10041147`);
    }
    return message.channel.send(`${user.tag} has received ${pointsToAdd} points and now stands at ${userscore.points} points.`);
  },
};
