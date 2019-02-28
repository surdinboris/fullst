$(function () {
    'use strict';
    console.log('app init');

    let files = $("#files")[0];

    function sortfiles(objct) {
        let sorted=[];
        for(let f in objct){
            if(f == 'headers') continue;
            sorted.push([f,objct[f]])
    }
        let result = sorted.sort(function (a,b){
        return  (a[1]['_isdir'] === b[1]['_isdir'])? 0 : a[1]['_isdir']? -1 : 1;
    });
        //constructing back object
        let sortedobj={};
        sortedobj.headers=objct.headers;
        for(let r of result){
            sortedobj[r[0]]=r[1]
        }

        return sortedobj

    }


    for (let fileobj in sortfiles(filelist)) {
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