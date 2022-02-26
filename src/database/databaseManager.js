const Utils = require("../utils.js");
const fs = require("fs");
const mongojs = require("mongojs");
const { env } = require("../config.js");
const db = mongojs(env.DB_CONNECTION_STRING, ["guildsData", "groups"]);

// TODO: Move everything somewhere else

const _addGuildToDB = async (guildId) => {
  await db.guildsData.insert({
    guildId: guildId,
    settedUp: false,
  });
};

const isGuildInDB = async (guildId) => {
  return new Promise((resolve) => {
    db.guildsData.findOne({ guildId: guildId }, (err, doc) => {
      resolve(!!doc);
    });
  });
};

const setGuildSetupStatus = async (guildId, status) => {
  let a = await isGuildInDB(guildId);
  if (!(await isGuildInDB(guildId))) {
    await _addGuildToDB(guildId);
  }
  await db.guildsData.findAndModify(
    {
      query: { guildId: guildId },
      update: { $set: { settedUp: status } },
      new: true,
    },
    (err) => {
      if (err) {
        throw err;
      }
    }
  );
};

const isGuildSettedUp = async (guildId) => {
  let check = false;
  if (!(await isGuildInDB(guildId))) {
    return false;
  }
  return new Promise((resolve) => {
    db.guildsData.findOne({ guildId: guildId }, {}, (err, doc) => {
      if (err) {
        return false;
      }
      resolve(doc.settedUp);
    });
  });
};

const _addGroupToDB = async (guildId, name, channelIds) => {
  await db.groups.insert({
    ownerGuildId: guildId,
    name: name,
    teachers: [],
    students: [],
    channels: [...channelIds],
  });
};

const isGroupInDb = async (guildId, name) => {
  return new Promise((resolve) => {
    db.groups.findOne({ ownerGuildId: guildId, name: name }, (err, doc) => {
      resolve(!!doc);
    });
  });
};

const createGroup = async (guildId, name, channelIds) => {
  if (await isGroupInDb(guildId, name)) {
    throw new Error("Group already exists in this guild!");
  }
  await _addGroupToDB(guildId, name, channelIds);
};

// NOTE: this functions assumes that the channel has not been added to the group yet
const addChannelsToGroup = async (guildId, name, channelIds) => {
  if (!(await isGroupInDb(guildId, name))) {
    throw new Error("Group does not exist");
  }
  await db.groups.findAndModify(
    {
      query: { ownerGuildId: guildId, name: name },
      update: { $push: { channels: { $each: channelIds } } },
      new: true,
    },
    (err) => {
      if (err) {
        throw err;
      }
    }
  );
};

const deleteGroup = async (guildId, name) => {
  if (!(await isGroupInDb(guildId, name))) {
    throw new Error("Group doesn't exist");
    return;
  }
  await db.groups.remove(
    { ownerGuildId: guildId, name: name },
    { justOne: true }
  );
};

const addTeacherToGroup = async (name, guildId, discordId) => {
  if (!(await isGroupInDb(guildId, name))) {
    throw new Error("Group doesn't exist");
    return;
  }
  await db.groups.findAndModify(
    {
      query: { ownerGuildId: guildId, name: name },
      update: { $push: { teachers: discordId } },
      new: true,
    },
    (err) => {
      if (err) {
        throw err;
      }
    }
  );
};

const addStudentToGroup = async (name, guildId, discordId) => {
  if (!(await isGroupInDb(guildId, name))) {
    throw new Error("Group doesn't exist");
    return;
  }
  await db.groups.findAndModify(
    {
      query: { ownerGuildId: guildId, name: name },
      update: { $push: { students: discordId } },
      new: true,
    },
    (err) => {
      if (err) {
        throw err;
      }
    }
  );
};

const removeStudentFromGroup = async (name, guildId, discordId) => {
  if (!(await isGroupInDb(guildId, name))) {
    throw new Error("Group doesn't exist");
    return;
  }
  await db.groups.findAndModify(
    {
      query: { ownerGuildId: guildId, name: name },
      update: { $pull: { students: discordId } },
      new: true,
    },
    (err) => {
      if (err) {
        throw err;
      }
    }
  );
};

const removeTeacherFromGroup = async (name, guildId, discordId) => {
  if (!(await isGroupInDb(guildId, name))) {
    throw new Error("Group doesn't exist");
    return;
  }
  await db.groups.findAndModify(
    {
      query: { ownerGuildId: guildId, name: name },
      update: { $pull: { teachers: discordId } },
      new: true,
    },
    (err) => {
      if (err) {
        throw err;
      }
    }
  );
};

const isStudentInGroup = async (guildId, name, discordId) => {
  return new Promise((resolve) => {
    db.groups.findOne({ ownerGuildId: guildId, name: name }, (err, doc) => {
      if (err) {
        throw err;
      }
      resolve(doc.students.includes(discordId));
    });
  });
};

const isTeacherInGroup = async (guildId, name, discordId) => {
  return new Promise((resolve) => {
    db.groups.findOne({ ownerGuildId: guildId, name: name }, (err, doc) => {
      if (err) {
        throw err;
      }
      resolve(doc.teachers.includes(discordId));
    });
  });
};

const getAllGroupsFromGuild = async (guildId) => {
  return new Promise((resolve) => {
    db.groups.find({ ownerGuildId: guildId }, (err, docs) => {
      resolve(docs);
    });
  });
};

const getGroupByName = async (guildId, name) => {
  return new Promise((resolve) => {
    db.groups.findOne({ ownerGuildId: guildId, name: name }, (err, doc) => {
      resolve(doc);
    });
  });
};

const addTaskTrackerToDb = async (taskCount, studentsIds, trackerId) => {
  return new Promise(async (resolve) => {
    const progress = {};
    studentsIds.map((studentId) => {
      progress[studentId] = {};
      for (let i = 0; i < taskCount; i++) progress[studentId][i] = false;
    });
    await db.tasktrackers.insert({
      trackerId: trackerId,
      taskCount: taskCount,
      progress: progress,
    });
  });
};

const getTaskTracker = async (trackerId) => {
  return new Promise((resolve, reject) => {
    db.tasktrackers.findOne({ trackerId: trackerId }, (err, doc) => {
      if (err) {
        reject(err);
      }
      resolve(doc);
    });
  });
};

const updateAndReturnTaskTracker = async (trackerId, studentId, taskId) => {
  const oldDoc = await getTaskTracker(trackerId).catch((err) => {
    throw err;
  });
  return new Promise((resolve, reject) => {
    if (oldDoc == undefined) reject(Errors.ELEMENT_DOES_NOT_EXIST);
    if (oldDoc.progress[studentId] == undefined)
      reject(Errors.NO_SUCH_USER_IN_COLLECTION);
    oldDoc.progress[studentId][taskId] = !oldDoc.progress[studentId][taskId];
    const newValue = oldDoc.progress[studentId][taskId];
    const update = { $set: {} };
    const taskPath = `progress.${studentId}.${taskId}`;
    update["$set"][taskPath] = newValue;
    db.tasktrackers.update({ trackerId: trackerId }, update, {}, (err, doc) => {
      if (err) reject(err);
      resolve(oldDoc);
    });
  });
};

const Errors = {
  NO_SUCH_USER_IN_COLLECTION: new Error("User is not part of this collection"),
  ELEMENT_DOES_NOT_EXIST: new Error("Element is not present in the collection"),
};

exports.Errors = Errors;

exports.databaseManager = {
  setGuildSetupStatus,
  isGuildSettedUp,
  createGroup,
  deleteGroup,
  addTeacherToGroup,
  addStudentToGroup,
  addChannelsToGroup,
  isGroupInDb,
  getAllGroupsFromGuild,
  getGroupByName,
  removeStudentFromGroup,
  isStudentInGroup,
  isTeacherInGroup,
  removeTeacherFromGroup,
  addTaskTrackerToDb,
  updateAndReturnTaskTracker,
};
