exports.includesAny = (text, textlist) => {
    let check = false
    textlist.map( e => {
        if (text.includes( e )) check=true
    })
    return check
}

exports.normalizeGroupName = ( groupName ) => {
  return groupName.toLocaleLowerCase().split(" ").join("-")
}

exports.sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}