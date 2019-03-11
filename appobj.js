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
        this.fdname=splitted[splitted.length-1].replace('\\','');
        splitted.pop();
        if(splitted.length == 0 ){
            this.parenturl = "/"
        }
        else{
            this.parenturl = splitted.join("");
        }
        //aligning mdate
        let parsed= Date.parse(this.mtime)
        //changing filesize untits
        if(opts.fsize && opts.sizeunit == 'Kb'){
            this.fsize = (Number(this.fsize)/1024).toFixed(1)
        }
    }
    //standard attributes interface definition for looping via data object
    DirRecord.prototype.gethtml= function(){
        let container = document.createElement("div");
        this.activeheaders.forEach(function(header){
            let entry = document.createElement('div');
            if(header == 'fullname'){
                let anchor = document.createElement("a");
                anchor.setAttribute('href', this[header]);
                anchor.appendChild(document.createTextNode(this.fdname));
                anchor.classList.add('filename');
                entry.appendChild(anchor)
            }
            else {

                entry.appendChild(document.createTextNode(this[header]));
            }
            entry.classList.add(header);
            container.appendChild(entry)

    },this);
        return container
    };



    function objgen(data){
        let activeheaders=['fullname','fsize','mtime'];
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
        dirrecs.forEach(function (record) {
            files.appendChild(record.gethtml())

        });
        console.log(dirrecs);

    }

    //initial render
    render(filelist)
});