
$(function () {
    'use strict';
    console.log('app init');
    console.log(filelist);
    let files=$("#files")[0];

    for(let fileobj in filelist){
        for(let fkey in filelist[fileobj]){
            let contentrow = document.createElement('div');
            contentrow.setAttribute('class', 'grid-item');

            if(fileobj == 'headers'){}

            else{
                if(fkey=='fullname') {
                    let aelem = document.createElement('a');


                    aelem.setAttribute('href', filelist[fileobj][fkey]);

                    aelem.appendChild(document.createTextNode(fileobj));
                    contentrow.appendChild(aelem)
                }
                else {
                    contentrow.appendChild(document.createTextNode(filelist[fileobj][fkey]));
                }}

            files.appendChild(contentrow)
        }
    }
});