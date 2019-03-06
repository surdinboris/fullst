$(function () {
    'use strict';
    console.log('app init');
    let files = $("#files")[0];
    //console.log(filelist);

    //building file object prototype
    //and fulfill it from json data with additional event binding
    //and computed parameters such parent object
    function DirRecord(headers,opts){
        //looping via data object and assigning standard attributes
        this.populheaders.forEach(function (header) {
            this[header]=headers[header]
        },this);
        //computation and appending calculated attributes
        this.fdname=opts.fdname;
        this.parenturl = opts.parenturl;
        this.filtered=opts.filter;
        if(headers._isdir == true){
            this.icon="/images/directory.svg"
        }
        if(headers.fdtype == false){
            this.icon="/images/file.svg"
        }
    }
    //standard attributes interface definition for looping via data object
    DirRecord.prototype.populheaders = ['fullname','fsize','mtime', 'fsize','_isdir'];

    function objgen(data){
        let dirpage=[];
        let headers=data.headers;
        delete data.headers;
        for(let df in data){
            let dirrec = new DirRecord(data[df],{filtered:false});
            dirpage.push(dirrec);
        }
        return dirpage
    }

    let dirpage=objgen(filelist);
    console.log(dirpage);

    function render(filelist) {
        files.innerHTML = '';
    }

    //initial render
    render(filelist)
});