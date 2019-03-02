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

    function render(filelist) {
        files.innerHTML = '';
        //in case of headers obj
        let headers = [];
        for (let fheader in filelist['headers']) {
            let contentrow = document.createElement('div');
            contentrow.setAttribute('class', 'grid-item');

            let afterheader = false;

            for (let fileobj in sortfiles(filelist)) {
                if (fileobj == 'headers') {
                    headers.push(filelist[fileobj][fheader]);
                    contentrow.appendChild(document.createTextNode(filelist[fileobj][fheader]));
                    contentrow.classList.add('header');
                }
                files.appendChild(contentrow);
            }
        }
        //subsequence for "non display" attributes
        filelist = sortfiles(filelist);
        for (let fileobj in filelist) {
            let contentrow = document.createElement('div');
            contentrow.setAttribute('class', 'grid-item');


            //ad data rows

            if (fileobj != 'headers') {
                let isdir = filelist[fileobj]["_isdir"];


                //iterating over headers and extracting data based on headers column data
                for (let header in headers) {
                    console.log('>', filelist[fileobj] );
                    if (filelist[fileobj] == 'fullname') {
                        let aelem = document.createElement('a');
                        aelem.setAttribute('class', 'filename');
                        if (isdir) {
                            let diricon = document.createElement("img");
                            diricon.setAttribute("src", "/images/directory.svg");
                            diricon.setAttribute("class", "isdir");
                            // aelem.setAttribute('class', 'isdir');
                            aelem.appendChild(diricon)
                        } else {
                            let fileicon = document.createElement("img");
                            fileicon.setAttribute("src", "/images/file.svg");
                            fileicon.setAttribute('class', 'isfile');
                            aelem.appendChild(fileicon)
                        }
                        aelem.setAttribute('href', filelist[fileobj][fheader]);
                        aelem.appendChild(document.createTextNode(fileobj));
                        contentrow.appendChild(aelem);
                        contentrow.classList.add('datacell');
                    } else {
                        contentrow.appendChild(document.createTextNode(filelist[fileobj]));
                        contentrow.classList.add('datacell');
                    }
                    files.appendChild(contentrow);
                }
            }
        }
        //add after headers
        let gouprow = document.createElement('div');

        let anchors = $(".filename");
        anchors.each(function (index) {
            $(this).on("click", async function (e) {

                e.preventDefault();
                let url = e.target.getAttribute('href');
                let data = await getrestdata(url);
                console.log(JSON.parse(data))
                render(JSON.parse(data))
            });
        });
    }

    function getrestdata(url){
        return fetch('/restapi'+url).then((resp) => {return resp.text()
        })

    }

    //initial render
        render(filelist)
});