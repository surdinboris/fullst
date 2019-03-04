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

    function render(filelist, url) {
        files.innerHTML = '';

        //bindclicks function - events appending
        function bindclicks(anchors) {
            anchors.each(function (index) {
                $(this).on("click", async function (e) {
                    if (!e.target.classList.contains('isfile')) {
                        e.preventDefault();
                        let url = e.target.getAttribute('href');
                        let data = await getrestdata(url);
                        render(JSON.parse(data), url)
                    }
                });
            });
        }
    }



    function getrestdata(url){

        return fetch('/restapi'+url).then((resp) => {return resp.text()
        })

    }

    //initial render
    render(filelist)
});