$(function () {
    'use strict';
    console.log('app init');
    console.log(filelist);
    let files = $("#files")[0];
    for (let fileobj in filelist) {
        //subsequence for "non columns" attributes
            let isdir=filelist[fileobj]["_isdir"];

        for (let fkey in filelist[fileobj]) {
            if(fkey[0]=='_'){
                continue
            }

            let contentrow = document.createElement('div');
            contentrow.setAttribute('class', 'grid-item');
            if (fileobj == 'headers') {
                contentrow.appendChild(document.createTextNode(filelist[fileobj][fkey]));
            } else {
                if (fkey == 'fullname') {
                    let aelem = document.createElement('a');
                    aelem.setAttribute('href', filelist[fileobj][fkey]);
                    aelem.appendChild(document.createTextNode(fileobj));
                    contentrow.appendChild(aelem)
                    //coloring depending by dir or file
                    if(isdir){
                        aelem.setAttribute('class', 'isdir');
                    }
                    else{
                        aelem.setAttribute('class', 'isfile');
                    }

                } else {

                        contentrow.appendChild(document.createTextNode(filelist[fileobj][fkey]));

                }
            }
            files.appendChild(contentrow);


        }

    }
});