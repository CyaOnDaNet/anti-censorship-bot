module.exports = {
	name: 'crosspost',
  aliases: ['cp'],
	description: 'Crossposts a person\'s message to another channel',
	usage: '#Channel(s) [Content or image or `id:message-id`]',
	adminCommand: false,
	async execute(message, args, prefix, guildSettings, client, Discord, Music, fetch) {
		/*
		To Do:
		Check if user exists in send channels
		*/
    var messageAfterCommand = message.content.slice(message.content.indexOf(" ") + 1);
    if (message.content.indexOf(" ") === -1) {
      return message.channel.send("You didn't state what to crosspost!");
    }

    let mentionedChannel = message.mentions.channels.first();
    if(!mentionedChannel) return message.channel.send("You did not specify a valid channel to crosspost too!");

    var analyzeIfText = false;
    var channelCheck = "";
    var y;
    var extractedMessage = "";

    for(var i = 0; i < messageAfterCommand.length; i++) {
      if (messageAfterCommand[i] === "<") {
        for(y = i; y < messageAfterCommand.length; y++) {
          if (messageAfterCommand[y] === ">") {
            channelCheck += messageAfterCommand[y];
            break;
          } else {
            channelCheck += messageAfterCommand[y];
          }
        }
        if (client.channels.resolve(channelCheck.slice(2, channelCheck.length - 1)) === undefined) {
          // Stop here and preserve the message because it wasn't a valid channel mention, therefore we must assume its just text using the character '<'
        } else {
          // This was a valid channel mention so lets continue processing
          channelCheck = "";
        }
      }
      if (channelCheck != "") {
        extractedMessage = messageAfterCommand.slice(y - channelCheck.length, messageAfterCommand.length);
        channelCheck = "";
        break;
      }
      if (messageAfterCommand[i] === ">") {
        analyzeIfText = true;
      }
      else if (analyzeIfText && messageAfterCommand[i] === " ") {
        // If it's a space, we just ignore it, there may or may not still be consecutive mentions.
      }
      else if (analyzeIfText && messageAfterCommand[i] === "<") {
        analyzeIfText = false;
      }
      else if (analyzeIfText) {
        // Completed analyzing text and removed all consecutive channel mentions, so we can conserve channel mentions in the body text.
        extractedMessage = messageAfterCommand.slice(i, messageAfterCommand.length);
        break;
      }
    }

    for(var i = 0; i < messageAfterCommand.length; i++) {
      if (messageAfterCommand[i] === "<") {
        for(y = i; y < messageAfterCommand.length; y++) {
          if (messageAfterCommand[y] === ">") {
            channelCheck += messageAfterCommand[y];
            break;
          } else {
            channelCheck += messageAfterCommand[y];
          }
        }
        if (client.channels.resolve(channelCheck.slice(2, channelCheck.length - 1)) === undefined) {
          // Stop here and preserve the message because it wasn't a valid channel mention, therefore we must assume its just text using the character '<'
        } else {
          // This was a valid channel mention so lets send the extractedMessage
          extractedMessage = extractedMessage.trim();

          channelCheck = channelCheck.slice(2, channelCheck.length - 1);
          if (client.channels.resolve(channelCheck).guild.member(message.author).permissionsIn(channelCheck).has('SEND_MESSAGES')) {
            var embed;
						var urlList = "";
            if (extractedMessage != "") {
              // Has Content
              if (extractedMessage.trim().toLowerCase().startsWith("id:")) {
                var messageID = extractedMessage.trim().slice(extractedMessage.toLowerCase().indexOf("id:") + 3, extractedMessage.trim().length);
                //var send = true;+
                await message.channel.messages.fetch(messageID)
                  .then(async messageToCP => {
										//Find URL
										var extractedMessage = messageToCP.content;
										var urlList = "";
										if (extractedMessage.trim().toLowerCase().includes("http://") || extractedMessage.trim().toLowerCase().includes("https://")) {
											extractedMessage = extractedMessage.trim();
											var extractedMessageChecker = extractedMessage;
											var extractedUrlListCheck = "";
											var urlCount = 1;
			                while (extractedMessage.trim().toLowerCase().includes("http://") || extractedMessage.trim().toLowerCase().includes("https://")) {
												var workingMessage = extractedMessage.trim().toLowerCase();
												var http = "http://";
												if (workingMessage.includes("https://")) {
													http = "https://";
												}
												var startIndex = workingMessage.indexOf(http);
												var endIndex = workingMessage.length;
												var extractedURL = workingMessage.trim().substring(startIndex, endIndex);

												if (extractedURL.includes(" ")) {
													endIndex = extractedURL.indexOf(" ") + startIndex;
												}
												extractedURL = extractedMessage.trim().substring(startIndex, endIndex);

												urlList = urlList + extractedURL + "\n";
												extractedUrlListCheck = extractedUrlListCheck + `**URL ${urlCount}:** ` + extractedURL + "\n";

												extractedMessage = extractedMessage.replace(extractedURL,'');
												extractedMessageChecker = extractedMessageChecker.replace(extractedURL,`[URL ${urlCount}](${extractedURL})`);

												urlCount++;
											}
											if (extractedMessage.trim() != "") {
												extractedMessage = extractedMessageChecker.trim();
												urlList = extractedUrlListCheck;
											}
										}
										messageToCP.content = extractedMessage;

                    if (messageToCP.author.id === message.author.id) {
											if ( (!messageToCP.content || messageToCP.content.trim() == "") && urlList != "") {
												embed = new Discord.MessageEmbed()
	                        .setThumbnail(messageToCP.author.displayAvatarURL({ format: `png`, dynamic: true }))
	                        .setDescription(`<@${messageToCP.author.id}> posted the links below!`)
	                        .setFooter("Posted")
	                        .setTimestamp(messageToCP.createdAt)
	                        .setColor(0x00AE86);
											}
											else if (urlList != "") {
												embed = new Discord.MessageEmbed()
	                        .setThumbnail(messageToCP.author.displayAvatarURL({ format: `png`, dynamic: true }))
	                        .setDescription(`<@${messageToCP.author.id}> Posted Links and Said:\n\n>>> ${messageToCP.content}`)
	                        .setFooter("Posted")
	                        .setTimestamp(messageToCP.createdAt)
	                        .setColor(0x00AE86);
											}
											else {
												embed = new Discord.MessageEmbed()
	                        .setThumbnail(messageToCP.author.displayAvatarURL({ format: `png`, dynamic: true }))
	                        .setDescription(`<@${messageToCP.author.id}> Said:\n\n>>> ${messageToCP.content}`)
	                        .setFooter("Posted")
	                        .setTimestamp(messageToCP.createdAt)
	                        .setColor(0x00AE86);
											}

                      if (!messageToCP.content) {
                        embed = new Discord.MessageEmbed()
                          .setThumbnail(messageToCP.author.displayAvatarURL({ format: `png`, dynamic: true }))
                          .setDescription(`<@${messageToCP.author.id}> Posted an Attachment.`)
                          .setFooter("Posted")
                          .setTimestamp(messageToCP.createdAt)
                          .setColor(0x00AE86);
                      }
											var attachmentFiles = [];
											var Attachment = (messageToCP.attachments).array();
											Attachment.forEach(function(attachment) {
                        attachmentFiles.push(attachment.url);
                      });
                      if (attachmentFiles.length === 0) {
                        embed.addField('\u200b', "[Click Here for Message Origin](" + messageToCP.url + ")");
                        await client.channels.resolve(channelCheck).send({embed: embed});
                      }
                      else if (attachmentFiles.length === 1) {
												if (attachmentFiles[0].toLowerCase().endsWith(".jpg") || attachmentFiles[0].toLowerCase().endsWith(".jpeg") || attachmentFiles[0].toLowerCase().endsWith(".gif") || attachmentFiles[0].toLowerCase().endsWith(".png")) {
													embed.setImage(attachmentFiles[0]);
													embed.addField('\u200b', "[Click Here for Message Origin](" + messageToCP.url + ")");
	                        await client.channels.resolve(channelCheck).send({embed: embed});
												}
												else {
													embed.addField('\u200b', "[Click Here for Message Origin](" + messageToCP.url + ")");
													await client.channels.resolve(channelCheck).send({embed: embed});
                          await client.channels.resolve(channelCheck).send({files: attachmentFiles});
												}
                      }
                      else {
                        if (!messageToCP.content) {
													if (urlList != "") {
														embed.setDescription(`<@${messageToCP.author.id}> Posted the Links and the Attachments Below`);
													}
													else {
														embed.setDescription(`<@${messageToCP.author.id}> Posted the Attachments Below`);
													}
                          embed.addField('\u200b', "[Click Here for Message Origin](" + messageToCP.url + ")");
                        }
                        else {
													embed.addField('\u200b', `[Click Here for Message Origin](${messageToCP.url})\n<@${messageToCP.author.id}'s Attachments Listed Below`);
                        }
												var attachmentArray = [];
												for (var i = 0; i <= attachmentFiles.length; i++) {
													var tempAttachment = new Discord.Attachment(`${attachmentFiles[i]}`);
													attachmentArray.push(tempAttachment);
												}
												await client.channels.resolve(channelCheck).send({embed: embed});
                        await client.channels.resolve(channelCheck).send({files: attachmentArray});
                      }

											if (urlList != "") {
												await client.channels.resolve(channelCheck).send(urlList);
											}

                    } else {
											if (!messageToCP.content && urlList != "") {
												embed = new Discord.MessageEmbed()
	                        .setThumbnail(messageToCP.author.displayAvatarURL({ format: `png`, dynamic: true }))
	                        .setDescription(`<@${messageToCP.author.id}> posted the links below!`)
	                        .setFooter("Posted")
	                        .setTimestamp(messageToCP.createdAt)
	                        .setColor(0x00AE86);
											}
											else if (!messageToCP.content){
												embed = new Discord.MessageEmbed()
                          .setThumbnail(messageToCP.author.displayAvatarURL({ format: `png`, dynamic: true }))
                          .setDescription(`<@${messageToCP.author.id}> Posted an Attachment.`)
                          .setFooter("Posted")
                          .setTimestamp(messageToCP.createdAt)
                          .setColor(0x00AE86);
											}
											else if (urlList != "") {
												embed = new Discord.MessageEmbed()
	                        .setThumbnail(messageToCP.author.displayAvatarURL({ format: `png`, dynamic: true }))
	                        .setDescription(`<@${messageToCP.author.id}> Posted Links and Said:\n\n>>> ${messageToCP.content}`)
	                        .setFooter("Posted")
	                        .setTimestamp(messageToCP.createdAt)
	                        .setColor(0x00AE86);
											}
											else {
												embed = new Discord.MessageEmbed()
	                        .setThumbnail(messageToCP.author.displayAvatarURL({ format: `png`, dynamic: true }))
	                        .setDescription(`<@${messageToCP.author.id}> Said:\n\n>>> ${messageToCP.content}`)
	                        .setFooter("Posted")
	                        .setTimestamp(messageToCP.createdAt)
	                        .setColor(0x00AE86);
											}

											var attachmentFiles = [];
											var Attachment = (messageToCP.attachments).array();
											Attachment.forEach(function(attachment) {
                        attachmentFiles.push(attachment.url);
                      });
                      if (attachmentFiles.length === 0) {
                        embed.addField('\u200b', "[Click Here for Message Origin](" + messageToCP.url + ")");
                        await client.channels.resolve(channelCheck).send({embed: embed});
                      }
                      else if (attachmentFiles.length === 1) {
												if (attachmentFiles[0].toLowerCase().endsWith(".jpg") || attachmentFiles[0].toLowerCase().endsWith(".jpeg") || attachmentFiles[0].toLowerCase().endsWith(".gif") || attachmentFiles[0].toLowerCase().endsWith(".png")) {
													embed.setImage(attachmentFiles[0]);
													embed.addField('\u200b', `[Click Here for Message Origin](${messageToCP.url})\nCrossposted By: <@${message.author.id}>`);
	                        await client.channels.resolve(channelCheck).send({embed: embed});
												}
												else {
													const attachment = new Discord.Attachment(`${attachmentFiles[0]}`);
													embed.addField('\u200b', `[Click Here for Message Origin](${messageToCP.url})\nCrossposted By: <@${message.author.id}>`);
													await client.channels.resolve(channelCheck).send({embed: embed});
                          await client.channels.resolve(channelCheck).send({files: [attachment]});
												}
                      }
                      else {
                        if (!messageToCP.content) {
													if (urlList != "") {
														embed.setDescription(`<@${messageToCP.author.id}> Posted Links and the Attachments Below`);
													}
													else {
														embed.setDescription(`<@${messageToCP.author.id}> Posted the Attachments Below`);
													}
													embed.addField('\u200b', `[Click Here for Message Origin](${messageToCP.url})\nCrossposted By: <@${message.author.id}>`);
                        }
                        else {
													embed.addField('\u200b', `[Click Here for Message Origin](${messageToCP.url})\nCrossposted By: <@${message.author.id}>\nAttachments Listed Below`);
                        }
												var attachmentArray = [];
												for (var i = 0; i <= attachmentFiles.length; i++) {
													var tempAttachment = new Discord.Attachment(`${attachmentFiles[i]}`);
													attachmentArray.push(tempAttachment);
												}
												await client.channels.resolve(channelCheck).send({embed: embed});
                        await client.channels.resolve(channelCheck).send({files: attachmentArray});
                      }

											if (urlList != "") {
												await client.channels.resolve(channelCheck).send(urlList);
											}
                    }
                  })
                  .catch(error => {
                    console.log(error);
                    send = false;
                    i = messageAfterCommand.length + 1;   // ensure we don't come back here if multiple channels were mentioned
                    return message.channel.send("That was not a valid message ID in this channel! Nothing crossposted.");
                  });
              }
							else {
								//Find URL
								if (extractedMessage.trim().toLowerCase().includes("http://") || extractedMessage.trim().toLowerCase().includes("https://")) {
									extractedMessage = extractedMessage.trim();
									var extractedMessageChecker = extractedMessage;
									var extractedUrlListCheck = "";
									var urlCount = 1;
	                while (extractedMessage.trim().toLowerCase().includes("http://") || extractedMessage.trim().toLowerCase().includes("https://")) {
										var workingMessage = extractedMessage.trim().toLowerCase();
										var http = "http://";
										if (workingMessage.includes("https://")) {
											http = "https://";
										}
										var startIndex = workingMessage.indexOf(http);
										var endIndex = workingMessage.length;
										var extractedURL = workingMessage.trim().substring(startIndex, endIndex);

										if (extractedURL.includes(" ")) {
											endIndex = extractedURL.indexOf(" ") + startIndex;
										}
										extractedURL = extractedMessage.trim().substring(startIndex, endIndex);

										urlList = urlList + extractedURL + "\n";
										extractedUrlListCheck = extractedUrlListCheck + `**URL ${urlCount}:** ` + extractedURL + "\n";

										extractedMessage = extractedMessage.replace(extractedURL,'');
										extractedMessageChecker = extractedMessageChecker.replace(extractedURL,`[URL ${urlCount}](${extractedURL})`);

										urlCount++;
									}
									if (extractedMessage.trim() != "") {
										extractedMessage = extractedMessageChecker.trim();
										urlList = extractedUrlListCheck;
									}
								}
								if (extractedMessage.trim() == "" && urlList != "") {
									embed = new Discord.MessageEmbed()
	                  .setThumbnail(message.author.displayAvatarURL({ format: `png`, dynamic: true }))
	                  .setDescription(`<@${message.author.id}> posted the links below!`)
	                  .setFooter("Posted")
	                  .setTimestamp(new Date())
	                  .setColor(0x00AE86);
								}
								else if (urlList != "") {
									embed = new Discord.MessageEmbed()
	                  .setThumbnail(message.author.displayAvatarURL({ format: `png`, dynamic: true }))
	                  .setDescription(`<@${message.author.id}> Posted Links and Said:\n\n>>> ${extractedMessage}`)
	                  .setFooter("Posted")
	                  .setTimestamp(new Date())
	                  .setColor(0x00AE86);
								}
								else {
									embed = new Discord.MessageEmbed()
	                  .setThumbnail(message.author.displayAvatarURL({ format: `png`, dynamic: true }))
	                  .setDescription(`<@${message.author.id}> Said:\n\n>>> ${extractedMessage}`)
	                  .setFooter("Posted")
	                  .setTimestamp(new Date())
	                  .setColor(0x00AE86);
								}
								var attachmentFiles = [];
								var Attachment = (message.attachments).array();
								Attachment.forEach(function(attachment) {
									attachmentFiles.push(attachment.url);
								});
                if (attachmentFiles.length === 0) {
                  embed.addField('\u200b', "[Click Here for Message Origin](" + message.url + ")");
                  await client.channels.resolve(channelCheck).send({embed: embed});
                }
                else if (attachmentFiles.length === 1) {
									if (attachmentFiles[0].toLowerCase().endsWith(".jpg") || attachmentFiles[0].toLowerCase().endsWith(".jpeg") || attachmentFiles[0].toLowerCase().endsWith(".gif") || attachmentFiles[0].toLowerCase().endsWith(".png")) {
										embed.setImage(attachmentFiles[0]);
										embed.addField('\u200b', "[Click Here for Message Origin](" + message.url + ")");
										await client.channels.resolve(channelCheck).send({embed: embed});
									}
									else {
										const attachment = new Discord.Attachment(`${attachmentFiles[0]}`);
										embed.addField('\u200b', "[Click Here for Message Origin](" + message.url + ")");
										await client.channels.resolve(channelCheck).send({embed: embed});
                    await client.channels.resolve(channelCheck).send({files: [attachment]});
									}
                }
                else {
                  if (attachmentFiles.length > 1) embed.addField('\u200b', `[Click Here for Message Origin](${message.url})\n<@${message.author.id}>'s Attachments Listed Below`);
									var attachmentArray = [];
									for (var i = 0; i <= attachmentFiles.length; i++) {
										var tempAttachment = new Discord.Attachment(`${attachmentFiles[i]}`);
										attachmentArray.push(tempAttachment);
									}
									await client.channels.resolve(channelCheck).send({embed: embed});
                  await client.channels.resolve(channelCheck).send({files: attachmentArray});
                }
								if (urlList != "") {
									await client.channels.resolve(channelCheck).send(urlList);
								}
              }
            } else {
              // No content, just attachment
              embed = new Discord.MessageEmbed()
                .setThumbnail(message.author.displayAvatarURL({ format: `png`, dynamic: true }))
                .setDescription(`<@${message.author.id}> Posted an Attachment.`)
                .addField('\u200b', "[Click Here for Message Origin](" + message.url + ")")
                .setFooter("Posted")
                .setTimestamp(new Date())
                .setColor(0x00AE86);

							var attachmentFiles = [];
							var Attachment = (message.attachments).array();
							Attachment.forEach(function(attachment) {
								attachmentFiles.push(attachment.url);
							});
              if (attachmentFiles.length === 1) {
								if (attachmentFiles[0].toLowerCase().endsWith(".jpg") || attachmentFiles[0].toLowerCase().endsWith(".jpeg") || attachmentFiles[0].toLowerCase().endsWith(".gif") || attachmentFiles[0].toLowerCase().endsWith(".png")) {
									embed.setImage(attachmentFiles[0]);
									await client.channels.resolve(channelCheck).send({embed: embed});
								}
								else {
									const attachment = new Discord.Attachment(`${attachmentFiles[0]}`);
									await client.channels.resolve(channelCheck).send({embed: embed});
                  await client.channels.resolve(channelCheck).send({files: [attachment]});
								}
              }
              else {
								var attachmentArray = [];
								for (var i = 0; i <= attachmentFiles.length; i++) {
									var tempAttachment = new Discord.Attachment(`${attachmentFiles[i]}`);
									attachmentArray.push(tempAttachment);
								}
								embed.setDescription(`<@${message.author.id}> Posted the Attachments Below`);
								await client.channels.resolve(channelCheck).send({embed: embed});
                await client.channels.resolve(channelCheck).send({files: attachmentArray});
              }
            }
          } else {
            message.channel.send('You do not have permission to send messages in <#' + channelCheck + '>, message not crossposted there!');
          }
          channelCheck = "";
        }
      }
      if (channelCheck != "") {
        // No more vailid consecutive channels to send to, stop processing.
        channelCheck = "";
        break;
      }
      if (messageAfterCommand[i] === ">") {
        analyzeIfText = true;
      }
      else if (analyzeIfText && messageAfterCommand[i] === " ") {
        // If it's a space, we just ignore it, there may or may not still be consecutive mentions.
      }
      else if (analyzeIfText && messageAfterCommand[i] === "<") {
        analyzeIfText = false;
      }
      else if (analyzeIfText) {
        // No more vailid consecutive channels to send to, stop processing.
        break;
      }
    }
  },
};
