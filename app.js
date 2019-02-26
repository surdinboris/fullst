
$(function () {
    'use strict';
    console.log('app init');
    console.log(filelist);
    let files=$("#files")[0];
    for(let key in filelist) {
        let newlink = document.createElement('p');
        newlink.setAttribute('class', 'filerow');
        // newlink.appendChild(document.createTextNode(key));
        for(let fkey in filelist[key]){
            let att = document.createElement('b');
            if(fkey=='fullname') {
                att.setAttribute('href', filelist[key][fkey]);
                att = document.createElement('a');
            }
            att.setAttribute('class', fkey);
            att.appendChild(document.createTextNode(filelist[key][fkey]));
            if(fkey=='fullname') {
                att.setAttribute('href', filelist[key][fkey]);
            }
            newlink.appendChild(att)
        }

        files.appendChild(newlink);
        files.appendChild(document.createElement('br'))
    }
});