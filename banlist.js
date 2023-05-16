
// Ban list command
    client.on("message", async message => {
      if (message.content.startsWith("!banlist") || message.content.startsWith("!bl")) {
        if(!message.member.permissions.has("ADMINISTRATOR")) return message.reply(`❌`)
        const bans = await message.guild.bans.fetch();
        const bannedUsers = bans.map(ban => ban.user);
        const usersPerPage = 5;
        const generateEmbed = (pageNumber, bannedUsers) => {
          const start = pageNumber * usersPerPage;
          const currentBans = bannedUsers.slice(start, start + usersPerPage);
    
          const embed = new MessageEmbed()
            .setTitle("Ban List")
            .setColor("RED")
            .setFooter(`Page ${pageNumber + 1}/${Math.ceil(bannedUsers.length / usersPerPage)}`);
    
          currentBans.forEach(user => {
            embed.addField(`${user.username}#${user.discriminator}`, `ID: ${user.id}`);
          });
    
          return embed;
        };

        let currentPage = 0;
        const banListMessage = await message.channel.send({ embeds: [generateEmbed(currentPage, bannedUsers)] });
          await banListMessage.react("⬅️");
          await banListMessage.react("➡️");
          const filter = (reaction, user) => {
          return ["⬅️", "➡️"].includes(reaction.emoji.name) && user.id === message.author.id;
        };
    
        const collector = banListMessage.createReactionCollector({ filter, time: 60000 });
    
        collector.on("collect", async (reaction, user) => {
          if (reaction.emoji.name === "⬅️" && currentPage > 0) {
            currentPage--;
          } else if (reaction.emoji.name === "➡️" && currentPage < Math.ceil(bannedUsers.length / usersPerPage) - 1) {
            currentPage++;
          } else {
            return reaction.users.remove(user.id)
          }
    
          await reaction.users.remove(user.id);
          await banListMessage.edit({ embeds: [generateEmbed(currentPage, bannedUsers)] });
        });
    
        collector.on("end", () => {
          banListMessage.reactions.removeAll();
        });
      }
    });
