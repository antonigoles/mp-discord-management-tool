const TerminalColors = {
  Reset: "\x1b[0m",
  Bright: "\x1b[1m",
  Dim: "\x1b[2m",
  Underscore: "\x1b[4m",
  Blink: "\x1b[5m",
  Reverse: "\x1b[7m",
  Hidden: "\x1b[8m",

  FgBlack: "\x1b[30m",
  FgRed: "\x1b[31m",
  FgGreen: "\x1b[32m",
  FgYellow: "\x1b[33m",
  FgBlue: "\x1b[34m",
  FgMagenta: "\x1b[35m",
  FgCyan: "\x1b[36m",
  FgWhite: "\x1b[37m",

  BgBlack: "\x1b[40m",
  BgRed: "\x1b[41m",
  BgGreen: "\x1b[42m",
  BgYellow: "\x1b[43m",
  BgBlue: "\x1b[44m",
  BgMagenta: "\x1b[45m",
  BgCyan: "\x1b[46m",
  BgWhite: "\x1b[47m",
};

exports.includesAny = (text, textlist) => {
  let check = false;
  textlist.map((e) => {
    if (text.includes(e)) check = true;
  });
  return check;
};

exports.getUID = () => {
  return Number(Date.now()).toString(16).toUpperCase();
};

exports.logDebug = (message) => {
  function _getCallerFile() {
    var originalFunc = Error.prepareStackTrace;
    var callerfile;
    try {
      var err = new Error();
      var currentfile;
      Error.prepareStackTrace = function (err, stack) {
        return stack;
      };
      currentfile = err.stack.shift().getFileName();
      while (err.stack.length) {
        callerfile = err.stack.shift().getFileName();
        if (currentfile !== callerfile) break;
      }
    } catch (e) {}
    Error.prepareStackTrace = originalFunc;
    return callerfile.split("src")[1];
  }
  const d = new Date();
  const parsedTime = `${TerminalColors.Dim}[${d.toLocaleTimeString()}]${
    TerminalColors.Reset
  }`;
  const callerFile = `${TerminalColors.FgYellow}[${_getCallerFile()}]${
    TerminalColors.Reset
  }`;
  console.log(`${parsedTime}${callerFile}`, message);
};

exports.removeItemOnce = (arr, value) => {
  var index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
};

exports.normalizeGroupName = (groupName) => {
  return groupName.toLocaleLowerCase().split(" ").join("-");
};

exports.setLengthString = (str, limit) => {
  if (str.length == limit) return str + "...";
  if (str.length > limit) {
    return str.slice(0, limit) + "...";
  }
  let nStr = "";
  for (let i = 0; i < limit - str.length + 3; i++) {
    nStr += " ";
  }
  return str + nStr;
};

exports.sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

exports.getGroupName = async (interaction) => {
  return await Utils.normalizeGroupName(
    (await interaction.options.getRole("group_name")).name.slice(7)
  );
};

exports.isAdmin = async (member) => {
  return await member.permissions.has("ADMINISTRATOR", true);
};

exports.isTeacher = (member) => {
  return member.roles.cache.some((role) => role.name === "Nauczyciel");
};

exports.isGroupsTeacher = (member, groupName) => {
  groupName = this.normalizeGroupName(groupName);
  return member.roles.cache.some(
    (role) => role.name === groupName + " - Nauczyciel"
  );
};
