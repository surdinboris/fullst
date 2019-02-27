$(function () {
    'use strict';
    console.log('app init');
    console.log(filelist);
    let files = $("#files")[0];
    for (let fileobj in filelist) {
        //subsequence for "non columns" attributes
            let isdir=filelist[fileobj]["_isdir"];

        for (let fheader in filelist['headers']) {

            let contentrow = document.createElement('div');
            contentrow.setAttribute('class', 'grid-item');
            if (fileobj == 'headers') {
                contentrow.appendChild(document.createTextNode(filelist[fileobj][fheader]));
            } else {
                if (fheader == 'fullname') {
                    let aelem = document.createElement('a');
                    aelem.setAttribute('href', filelist[fileobj][fheader]);
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

                        contentrow.appendChild(document.createTextNode(filelist[fileobj][fheader]));

                }
            }
            files.appendChild(contentrow);


        }

    }
});