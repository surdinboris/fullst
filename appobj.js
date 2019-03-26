$(function () {
    'use strict';
    console.log('app init');
    let files = $("#files")[0];

    let currurl='/'+window.location.href.replace(/^(?:\/\/|[^\/]+)*\//, "");
    // let upload = $("#upload")[0];

    let req = new XMLHttpRequest();

    function drawpopup() {
        let popup = $("#uploaddialog")[0];
        popup.classList.toggle("show");
    }
    //building file object prototype
    function DirRecord(entries,opts){
        if(opts.filtered == true) return;
        //looping via data object and assigning standard attributes
        this.activeheaders.forEach(function (header) {
            this[header]=entries[header]
        },this);
        //adding optional passed attrs
        this.filtered=opts.filtered;
        this._isdir = entries._isdir;
        this._meta = entries._meta;
        //computation and appending calculated attributes
        entries._isdir? this.icon="/": this.icon="/images/file.svg";
        let splitted = this.fullname.split(/(?=\/)/g);
        this.fdname=splitted[splitted.length-1].replace('/','');
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

    function getrestdata(url){
        return fetch('/restapi'+url).then((resp) => {return resp.text()
        })

    }
    //standard attributes interface definition for looping via data object
    DirRecord.prototype.gethtml= function(){
        let container = document.createElement("tr");
        this.activeheaders.forEach(function(header, ind){
            let entry = document.createElement('td');
            if(header == 'fullname' && this[header] != "Name"){
                let anchor = document.createElement("a");
                anchor.setAttribute('href', this[header]);
                if(this._meta == 'regular_record'){
                    anchor.appendChild(document.createTextNode(this.fdname));
                    anchor.classList.add('filename');
                }
                if(this._meta == 'uplink'){
                    anchor.appendChild(document.createTextNode('...'));
                    anchor.classList.add('uplink');
                }
                if(this._isdir == true ){
                    anchor.addEventListener("click", async function (e) {
                            e.preventDefault();
                            let url = e.target.getAttribute('href');
                            let data = await getrestdata(url);
                        window.history.pushState("object or string", "Title", url);
                        currurl=url;
                            render(JSON.parse(data), url)
                    });
                }
                entry.appendChild(anchor)
            }
            else if(this._meta != 'uplink') {
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
        let uploaddialbutt = $("#uploaddialbutt")[0];
        let uploadcont = $("#uploadcont")[0];

        let uploadcontClone=uploadcont.cloneNode(true);
        //cleaning filetable content
        files.innerHTML = '';
            //boilerplate cloning for cleaning upload elements from previous listeners
            uploadcont.parentNode.replaceChild(uploadcontClone, uploadcont);

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

        let clsupload = $("#clseupload")[0];
        clsupload.addEventListener("click", function(e){
            drawpopup();
        });

        uploaddialbutt.addEventListener("click", function (e) {
            drawpopup();
            //!implement popup closing (X button or click aside)

        });
        let uploadinput=$("#uploadinput")[0];
        let uplbutt=$("#uploadbutt")[0];
        uplbutt.addEventListener('click', function (e) {
            //rest sending
            e.preventDefault();
            let fd = new FormData();
            let files=uploadinput.files;
            if (files.length) {
                let flkeys = Object.keys(uploadinput.files);
                flkeys.forEach((file) => {
                    console.log(files[file]);
                    fd.append('intake file', files[file], file.name)
                });
                let xhr= new XMLHttpRequest();
                xhr.onload = function () {
                    if (xhr.status >= 200 && xhr.status < 300) {
                       alert(xhr.status)
                    }
                };

                xhr.open('PUT', currurl, true);
                xhr.send(fd);

                drawpopup();
            }
            else alert("Please choose files to upload")
            // let resp= fetch('/upload');
            // resp.then(r=>console.log(r))
        });
    }

    //initial render
    $(window).on('popstate', async function(e) {
        // alert('Back button was pressed.');
        let splitted = currurl.split(/(?=\/)/g);
        let fdname=splitted[splitted.length-1].replace('/','');
        let parenturl='';
        splitted.pop();
        if(splitted.length == 0){
            parenturl = "/"
        }
        else{
            parenturl = splitted.join("");
        }
        window.history.pushState("object or string", "Title", parenturl);
        let data = await getrestdata(parenturl);
        console.log('>>>',parenturl, data);
        currurl=parenturl;
        render(JSON.parse(data));

    });


    render(filelist)

});