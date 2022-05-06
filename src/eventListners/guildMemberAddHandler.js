exports.listen = (client) => {
    client.on("guildMemberAdd", async (member) => {
        Utils.logDebug("New user joined")
        if ( await databaseManager.isGuildSettedUp( member.guild.id ) ) {
            Utils.logDebug("Asigning Guest role")
            await member.guild.roles.fetch().then( roles => {
                roles.map( role => {
                    if ( role.name === "Gosc" ) member.roles.add(role);
                })
            })
        }


    });
}