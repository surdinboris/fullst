
var app = app || {};

$(function () {
    'use strict';
    console.log('app init');
    console.log(filelist);
    let files=$("#files")[0];
    console.log(files)
    for(let i=0; i<filelist.length; i++) {
        let newlink = document.createElement('a');
        console.log(newlink);
        newlink.setAttribute('class', 'filename');
        newlink.appendChild(document.createTextNode(filelist[i]));
        newlink.setAttribute('href', filelist[i]);
        files.appendChild(newlink)
        files.appendChild(document.createElement('br'))
    }
    console.log(files.childNodes)
    // let tmpl = _.template($('#item-template').html())
    // tmpl({completed:true})
    // this.$el.append(_.template('I am <%= amount %> dumb')({amount:200}))
    // kick things off by creating the `App`
 // new app.AppView();
});