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
        // if(headers.emptyrow){
        //     return this
        // }

        //adding optional passed attrs
        this.filtered=opts.filtered;
        //computation and appending calculated attributes
        headers._isdir? this.icon="\\images\\directory.svg": this.icon="\\images\\file.svg";
        let splitted = this.fullname.split(/(?=\\)/g);
        this.fdname=splitted[splitted.length-1].replace('\\','');
        splitted.pop();
        if(splitted.length == 0){
            this.parenturl = "/"
        }
        else{
            this.parenturl = splitted.join("");
        }
        //formatting mdate
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
            entry.classList.add(header,`col${ind}`);
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
        function insertAfter(newNode, referenceNode) {
            referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
        }

        function rowappend(dirrecs) {
            dirrecs.forEach(function (record, ind) {
                let htmlrec=record.gethtml();
                htmlrec.setAttribute('id',`row${ind}`);
                htmlrec.classList.add('entry', 'row');
                files.appendChild(htmlrec);
            });
        }
        //let emptyrow= objgen({'emptyrow':{'fsize':'','fullname': '', 'mtime':''}});
        //rowgen(emptyrow);
        let dirrecs=objgen(filelist);
        rowappend(dirrecs);
        //inserting empty row with up url
        //up url preparation
        let lastelem= dirrecs[dirrecs.length-1].parenturl;
        let splitted= lastelem.split(/(?=\\)/g);
        let uplink='';
        if(splitted[0] == '\\'){
            uplink = '\\'
        }
        else if (splitted.length > 1){
            splitted.pop();
            uplink=splitted.join('');
        }
        else{
            uplink = '\\'
        }
        //row insertion point
        let headrow=$('#row0')[0];
        //generating html
        let container = document.createElement("tr");
        container.setAttribute('id', 'emptyrow');
        for(let headr in DirRecord.prototype.activeheaders){
            let cell = document.createElement('td');
            cell.classList.add(`col${headr}`);
            container.appendChild(cell)
        }
        let goup = document.createElement('a');
        goup.setAttribute('href',uplink)
        goup.setAttribute('id', 'goupurl');
        goup.appendChild(document.createTextNode('...'));
        container.firstChild.appendChild(goup);
        insertAfter(container,headrow)
    }

    //initial render
    render(filelist)
});