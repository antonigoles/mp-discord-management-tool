const { databaseManager } = require("../database/databaseManager.js")
const Utils = require("../utils.js")

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

            Utils.logDebug("Checking if user is returning...")
            // if already asigned as teacher or student
            const allGuildGroups = await databaseManager.getAllGroupsFromGuild( member.guild.id )
            const guildRoles = await member.guild.roles.fetch();
            allGuildGroups.forEach( group => {
                // is student?

                if ( Utils.includesAny(member.id, group.students) ) {
                    // add the role and the universal role
                    const studentRole = guildRoles.filter( 
                        r => r.name == `Uczen: ${group.name}` || r.name == `Uczen`
                    )
                    // studentRole should never be null here but just in case it is
                    if ( studentRole ) member.roles.add(studentRole)
                    else Utils.logDebug("studentRole is null (???)")
                }

                // is teacher?

                if ( Utils.includesAny(member.id, group.teachers) ) {
                    // add the role and the universal role
                    const teacherRole = guildRoles.filter( 
                        r => r.name == `Nauczyciel: ${group.name}` || r.name == `Nauczyciel`
                    )
                    // teacherRank should never be null here but just in case it is
                    if ( teacherRole ) member.roles.add(teacherRole)
                    else Utils.logDebug("teacherRole is null (???)")
                }


            })
        }


    });
}