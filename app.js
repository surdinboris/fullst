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
            if (fileobj == 'headers'){
                contentrow.appendChild(document.createTextNode(filelist[fileobj][fheader]));
                contentrow.classList.add('header');
            } else {
                if (fheader == 'fullname') {

                    let aelem = document.createElement('a');
                    aelem.setAttribute('class','filename');
                    if(isdir){
                        let diricon=document.createElement("img");
                        diricon.setAttribute("src","/images/directory.svg");
                        diricon.setAttribute("class","isdir");
                        // aelem.setAttribute('class', 'isdir');
                        aelem.appendChild(diricon)
                    }
                    else{
                        let fileicon= document.createElement("img");
                        fileicon.setAttribute("src","/images/file.svg");
                        fileicon.setAttribute('class', 'isfile');
                        aelem.appendChild(fileicon)
                    }
                    aelem.setAttribute('href', filelist[fileobj][fheader]);
                    aelem.appendChild(document.createTextNode(fileobj));
                    contentrow.appendChild(aelem);
                } else {

                        contentrow.appendChild(document.createTextNode(filelist[fileobj][fheader]));

                }
            }
            files.appendChild(contentrow);


        }

    }
});