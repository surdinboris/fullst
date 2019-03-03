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
        let headers=filelist["headers"];
        headers[Symbol.iterator]= function * () {
            for (let key in this) {
                yield [key, this[key]] // yield [key, value] pair
            }
        };
        //in case of headers obj
        for (let fheader in filelist['headers']) {
            let contentrow = document.createElement('div');
            contentrow.setAttribute('class', 'grid-item');

            let afterheader = false;

            for (let fileobj in sortfiles(filelist)) {
                if (fileobj == 'headers') {
                    contentrow.appendChild(document.createTextNode(filelist[fileobj][fheader]));
                    contentrow.classList.add('header');
                }
                files.appendChild(contentrow);
            }
        }

        //adding empty row
        for(let header of headers) {
            let contentrow = document.createElement('div');
            contentrow.setAttribute('class', 'grid-item');
            files.appendChild(contentrow)
        }

        filelist = sortfiles(filelist);

        for (let fileobj in filelist) {
            let contentrow = document.createElement('div');
            contentrow.setAttribute('class', 'grid-item');




            if (fileobj != 'headers') {
                let isdir = filelist[fileobj]["_isdir"];
                //iterating over headers and extracting data based on headers column data
                let aelem = document.createElement('a');
                aelem.setAttribute('class', 'filename');
                if (isdir) {
                    let diricon = document.createElement("img");
                    diricon.setAttribute("src", "/images/directory.svg");
                    diricon.setAttribute("class", "imgdir");
                    aelem.classList.add('isdir');
                    aelem.appendChild(diricon)
                }
                else {
                    let fileicon = document.createElement("img");
                    fileicon.setAttribute("src", "/images/file.svg");
                    fileicon.setAttribute('class', 'imgfile');
                    aelem.appendChild(fileicon)
                    aelem.classList.add('isfile');
                }
                aelem.setAttribute('href', filelist[fileobj]['fullname']);
                aelem.appendChild(document.createTextNode(fileobj));
                contentrow.appendChild(aelem);
                contentrow.classList.add('datacell');
                files.appendChild(contentrow);



                for(let header of headers) {
                    let contentrow = document.createElement('div');
                    contentrow.setAttribute('class', 'grid-item');
                if (header[0] != 'fullname') {
                contentrow.appendChild(document.createTextNode(filelist[fileobj][header[0]]));
                contentrow.classList.add('datacell');
                    files.appendChild(contentrow)
                }
            }
            }
        }
        //add after headers
        //let gouprow = document.createElement('div');
        let anchors = $(".filename");
        anchors.each(function (index) {
            $(this).on("click", async function (e) {
                if(!e.target.classList.contains('isfile')){
                e.preventDefault();
                let url = e.target.getAttribute('href');
                let data = await getrestdata(url);
                console.log(data)
                console.log(JSON.parse(data));
                render(JSON.parse(data))
                }
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