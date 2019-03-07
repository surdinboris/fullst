$(function () {
    'use strict';
    console.log('app init');
    let files = $("#files")[0];
    //console.log(filelist);
    //building file object prototype
    function DirRecord(headers,opts){
        //looping via data object and assigning standard attributes
        this.populheaders.forEach(function (header) {
            this[header]=headers[header]
        },this);

        //adding optional passed attrs
        this.filtered=opts.filtered;

        //computation and appending calculated attributes
        if(headers._isdir == true){
            this.icon="/images/directory.svg"
        }
        if(headers.fdtype == false){
            this.icon="/images/file.svg"
        }
        let splitted = this.fullname.split(/(?=\\)/g);
        console.log(splitted);
        this.fdname=splitted[splitted.length-1];
        splitted.pop();
        this.parenturl = splitted.join("")
        //changing filesize untits
        if(opts.sizeunit == 'Kb'){
            this.fsize = Number(this.fsize)/1024
        }
    }
    //standard attributes interface definition for looping via data object
    DirRecord.prototype.populheaders = ['fullname','fsize','mtime','_isdir'];

    function objgen(data){
        let dirpage=[];
        let headers=data.headers;
        delete data.headers;
        for(let df in data){
            let dirrec = new DirRecord(data[df],{filtered:false, sizeunit:'Kb});
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