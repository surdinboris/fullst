$(function () {
    'use strict';
    console.log('app init');
    let files = $("#files")[0];


    //console.log(filelist);
    //building file object prototype
    function DirRecord(headers,opts){
        if(opts.filtered == true) return;

        //looping via data object and assigning standard attributes
        this.activeheaders.forEach(function (header) {
            this[header]=headers[header]
        },this);

        //adding optional passed attrs
        this.filtered=opts.filtered;

        //computation and appending calculated attributes
        headers._isdir? this.icon="/images/directory.svg": this.icon="/images/file.svg";

        let splitted = this.fullname.split(/(?=\/)/g);
        this.fdname=splitted[splitted.length-1];
        splitted.pop();
        if(splitted.length == 0 ){
            this.parenturl = "/"
        }
        else{
            this.parenturl = splitted.join("");
        }
        //aligning mdate
        let parsed= Date.parse(this.mtime)
        console.log(parsed.toDateString())
        //changing filesize untits
        if(opts.size && opts.sizeunit == 'Kb'){
            this.fsize = (Number(this.fsize)/1024).toFixed(1)
        }
    }
    //standard attributes interface definition for looping via data object


    function objgen(data){
        let activeheaders=['fullname','fsize','mtime','_isdir'];
        //let activeheaders=['fullname','fsize'];
        DirRecord.prototype.activeheaders = activeheaders;
        let allheaders=data.headers;
        delete data.headers;
        let dirpage=[];

        for(let df in data){
            let dirrec = new DirRecord(data[df],{filtered:false, sizeunit:'Kb'});
            dirpage.push(dirrec);
        }
        return dirpage
    }


    function render(filelist) {
        files.innerHTML = '';
        let dirrecs=objgen(filelist);
        console.log(dirrecs);

    }

    //initial render
    render(filelist)
});