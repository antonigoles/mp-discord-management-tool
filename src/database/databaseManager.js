const fs = require('fs')
const mongojs = require('mongojs')
const { env } = require("../config.js")
const db = mongojs(
    `mongodb+srv://${env.DB_USER}:${env.DB_PASS}@cluster0.uolsy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`,
    ["guildsData", "groups"])

// TODO: Move everything somewhere else

const _addGuildToDB = async ( guildId ) => {
    await db.guildsData.insert({
        guildId: guildId,
        settedUp: false,
    })
}

const isGuildInDB = async ( guildId ) => {
    return new Promise((resolve) => {
        db.guildsData.findOne({ guildId: guildId }, (err, doc) => {
            resolve(!!doc)
        })
    })
}

const setGuildSetupStatus = async ( guildId, status ) => {
    let a  = await isGuildInDB( guildId )
    if ( !await isGuildInDB( guildId ) ) {
        await _addGuildToDB( guildId )
    }
    await db.guildsData.findAndModify( {
        query: { guildId: guildId },
        update: {$set: { settedUp: status }},
        new: true,
    }, (err) => {
        if ( err ) {
            throw err;
        }
    })
}   

const isGuildSettedUp = async ( guildId ) => {
    let check=false;
    if ( !(await isGuildInDB( guildId )) ) {
        return false;
    }
    return new Promise((resolve) => {
        db.guildsData.findOne({ guildId: guildId }, {}, (err, doc) => {
            if ( err ) {
                return false
            }
            resolve(doc.settedUp)
        })
    })
}

const _addGroupToDB = async ( guildId, name, channelIds ) => {
    await db.groups.insert({
        ownerGuildId: guildId,
        name: name,
        teachers: [],
        students: [],
        channels: [ ...channelIds ],
    })
}

const isGroupInDb = async ( guildId, name ) => {
    return new Promise((resolve) => {
        db.groups.findOne({ ownerGuildId: guildId, name: name }, (err, doc) => {
            resolve(!!doc)
        })
    })
}

const createGroup = async ( guildId, name, channelIds ) => {
    if ( await isGroupInDb( guildId, name ) ) {
        throw new Error("Group already exists in this guild!")
    }
    await _addGroupToDB( guildId, name, channelIds )
}


// NOTE: this functions assumes that the channel has not been added to the group yet
const addChannelsToGroup = async ( guildId, name, channelIds ) => {
    if ( !(await isGroupInDb( guildId, name) ) ) {
        throw new Error("Group does not exist")
    }
    await db.groups.findAndModify( {
        query: { ownerGuildId: guildId, name: name },
        update: {$push: { channels: { $each: channelIds }}},
        new: true,
    }, (err) => {
        if ( err ) {
            throw err;
        }
    })
}

const deleteGroup = async ( guildId, name ) => {
    if ( !(await isGroupInDb( guildId, name )) ) {
        throw new Error("Group doesn't exist")
        return;
    }
    await db.groups.remove({ ownerGuildId: guildId, name: name }, { justOne: true })
}

const addTeacherToGroup = async ( name, guildId, discordId ) => {
    if ( !(await isGroupInDb( guildId, name )) ) {
        throw new Error("Group doesn't exist")
        return;
    }
    await db.groups.findAndModify({
        query: { ownerGuildId: guildId, name: name },
        update: {$push: { teachers: discordId } },
        new: true
    }, (err) => {
        if ( err ) {
            throw err;
        }
    })
}

const addStudentToGroup = async ( name, guildId, discordId ) => {
    if ( !(await isGroupInDb( guildId, name )) ) {
        throw new Error("Group doesn't exist")
        return;
    }
    await db.groups.findAndModify({
        query: { ownerGuildId: guildId, name: name },
        update: {$push: { students: discordId } },
        new: true
    }, (err) => {
        if ( err ) {
            throw err;
        }
    })
}

const removeStudentFromGroup = async ( name, guildId, discordId ) => {
    if ( !(await isGroupInDb( guildId, name )) ) {
        throw new Error("Group doesn't exist")
        return;
    }
    await db.groups.findAndModify({
        query: { ownerGuildId: guildId, name: name },
        update: {$pull: { students: discordId } },
        new: true
    }, (err) => {
        if ( err ) {
            throw err;
        }
    })
}

const removeTeacherFromGroup = async ( name, guildId, discordId ) => {
    if ( !(await isGroupInDb( guildId, name )) ) {
        throw new Error("Group doesn't exist")
        return;
    }
    await db.groups.findAndModify({
        query: { ownerGuildId: guildId, name: name },
        update: {$pull: { teachers: discordId } },
        new: true
    }, (err) => {
        if ( err ) {
            throw err;
        }
    })
}

const isStudentInGroup = async ( guildId, name, discordId ) => {
    return new Promise( resolve => {
        db.groups.findOne({ownerGuildId: guildId, name: name }, (err, doc) => {
            if (err) {
                throw err
            }
            resolve( doc.students.includes( discordId ) )
        })
    })
}

const isTeacherInGroup = async ( guildId, name, discordId ) => {
    return new Promise( resolve => {
        db.groups.findOne({ ownerGuildId: guildId, name: name }, (err, doc) => {
            if (err) {
                throw err
            }
            resolve( doc.teachers.includes( discordId ) )
        })
    })
}

const getAllGroupsFromGuild = async ( guildId ) => {
    return new Promise((resolve) => {
        db.groups.find({ ownerGuildId: guildId,  }, (err, docs) => {
            resolve(docs)
        })
    })
}

const getGroupByName = async ( guildId, name ) => {
    return new Promise((resolve) => {
        db.groups.findOne({ ownerGuildId: guildId, name: name }, (err, doc) => {
            resolve(doc)
        })
    })
}

exports.databaseManager = {
    setGuildSetupStatus, isGuildSettedUp, createGroup, deleteGroup, addTeacherToGroup, addStudentToGroup,
    addChannelsToGroup, isGroupInDb, getAllGroupsFromGuild, getGroupByName, removeStudentFromGroup, isStudentInGroup,
    isTeacherInGroup, removeTeacherFromGroup
}