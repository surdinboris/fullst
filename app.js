
$(function () {
    'use strict';
    console.log('app init');
    console.log(filelist);
    let files=$("#files")[0];
    console.log(files);
    for(let i=0; i<filelist.length; i++) {
        let newlink = document.createElement('a');
        console.log(newlink);
        newlink.setAttribute('class', 'filename');
        let linkname=filelist[i].split("\\");
        console.log('ppp',linkname);
        newlink.appendChild(document.createTextNode(linkname[linkname.length-1]));
        newlink.setAttribute('href', filelist[i]);
        files.appendChild(newlink);
        files.appendChild(document.createElement('br'))
    }
});