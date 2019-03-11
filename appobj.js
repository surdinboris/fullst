$(function () {
    'use strict';
    console.log('app init');
    let files = $("#files")[0];

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
        if(splitted.length == 0){
            this.parenturl = "/"
        }
        else{
            this.parenturl = splitted.join("");
        }
        //formatting mdate
        console.log(this)
        if(this.mtime !="Modified"){
            let dt= new Date(this.mtime);
            this.mtime=`${dt.getDay()}/${dt.getMonth()}/${dt.getFullYear()} 
        ${dt.getHours()}:${(dt.getMinutes()<10?'0':'') + dt.getMinutes()}`;

        }

        //changing filesize untits
        this.sizeunit=opts.sizeunit;
        if(this.fsize >= 0&& opts.sizeunit == 'Kb'){

            this.fsize = `${(Number(this.fsize)/1024).toFixed(1)} Kb`
        }
    }

    //standard attributes interface definition for looping via data object
    DirRecord.prototype.gethtml= function(){
        let container = document.createElement("tr");
        this.activeheaders.forEach(function(header, ind){
            let entry = document.createElement('td');
            if(header == 'fullname' && this[header] != "Name"){
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
            entry.setAttribute('id', `col${ind}`);
            container.appendChild(entry);
    },this);
        return container
    };



    function objgen(data){
        let activeheaders=['fullname','fsize','mtime'];
        //let activeheaders=['fullname','fsize'];
        DirRecord.prototype.activeheaders = activeheaders;
        let dirpage=[];
        for(let df in data){
            let dirrec = new DirRecord(data[df],{'filtered':false, 'sizeunit':'Kb'});
            dirpage.push(dirrec);
        }
        return dirpage
    }


    function render(filelist) {
        files.innerHTML = '';
        let dirrecs=objgen(filelist);
        dirrecs.forEach(function (record, ind) {
            let htmlrec=record.gethtml();
            htmlrec.setAttribute('id',`row${ind}`);
            htmlrec.classList.add('entry', 'row');
            files.appendChild(htmlrec);
        });

        console.log(dirrecs);

    }

    //initial render
    render(filelist)
});