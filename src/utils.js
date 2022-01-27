exports.includesAny = (text, textlist) => {
    let check = false
    textlist.map( e => {
        if (text.includes( e )) check=true
    })
    return check
}

exports.sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}