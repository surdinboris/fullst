$(function () {
    'use strict';
    console.log('app init');
    let files = $("#files")[0];
    console.log(filelist);

    //building file object prototype
    //and fulfill it from json data with additional event binding
    //and computed parameters such parent object
    function DirRecord(params){
        this.fsize = params.fsize;
        this.fullname = params.fullname;
        this.fdname=params.fdname;
        this.mtime = params.mtime;

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

    DirRecord.prototype.populheaders = ['mtime','fsize','fullname''_isdir','filter'];


    //test
    //     let newfile = new File({fdname:'test.txt', filter:true, parenturl:'http://nextra42/'});
    //
    //     console.log(newfile.getfullurl());

    (function objgen(data){
        let dirpage=[];

        let dirrec = new DirRecord(dataentr)

    })(filelist);

    function render(filelist) {
        files.innerHTML = '';
    }

    //initial render
    render(filelist)
});