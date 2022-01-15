exports.includesAny = (text, textlist) => {
    let check = false
    textlist.map( e => {
        if (text.includes( e )) check=true
    })
    return check
}