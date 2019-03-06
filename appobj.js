$(function () {
    'use strict';
    console.log('app init');
    let files = $("#files")[0];
    console.log(filelist);

    //building file object prototype
    //and fulfill it from json data with additional event binding
    //and computed parameters such parent object
    function DirRecord(params){
        //looping via data object and assigning standard attributes
        this.populheaders.forEach(function (header) {
            this[header]=params[header]
        },this);
        //computation and appending calculated attributes
        this.fdname=params.fdname;
        this._isdir=params._isdir;
        this.parenturl = params.parenturl;
        this.filtered=params.filter;

        if(params.fdtype == 'dir'){
            this.icon="/images/directory.svg"
        }
        if(params.fdtype == 'file'){
            this.icon="/images/file.svg"
        }
    }
    //standard attributes interface definition for looping via data object
    DirRecord.prototype.populheaders = ['fullname','fsize','mtime', 'fsize','_isdir'];


    //test
    //     let newfile = new File({fdname:'test.txt', filter:true, parenturl:'http://nextra42/'});
    //
    //     console.log(newfile.getfullurl());

    (function objgen(data){
        let dirpage=[];
        for(let df in data){
            console.log(df)
            let dirrec = new DirRecord(df);
            console.log(dirrec)

        }

    })(filelist);

    function render(filelist) {
        files.innerHTML = '';
    }

    //initial render
    render(filelist)
});