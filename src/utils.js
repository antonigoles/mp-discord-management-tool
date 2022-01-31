exports.includesAny = (text, textlist) => {
    let check = false
    textlist.map( e => {
        if (text.includes( e )) check=true
    })
    return check
}

exports.removeItemOnce = (arr, value) => {
  var index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

exports.normalizeGroupName = ( groupName ) => {
  return groupName.toLocaleLowerCase().split(" ").join("-")
}

exports.sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}