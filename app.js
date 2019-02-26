
$(function () {
    'use strict';
    console.log('app init');
    console.log(filelist);
    let files=$("#files")[0];

    for(let key in filelist) {
        for(let fkey in filelist[key]){
            let controw = document.createElement('div');
            controw.setAttribute('class', 'grid-item');
            if(fkey=='fullname') {
                let aelem = document.createElement('a');
                aelem.setAttribute('href', filelist[key][fkey]);
                aelem.appendChild(document.createTextNode(filelist[key][fkey]))
                controw.appendChild(aelem)
            }
            else {
                controw.appendChild(document.createTextNode(filelist[key][fkey]));
                }
            files.appendChild(controw)
        }
    }
});