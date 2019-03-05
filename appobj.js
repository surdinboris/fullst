$(function () {
    'use strict';
    console.log('app init');
    let files = $("#files")[0];
    console.log(filelist);

    //building file object prototype
    //and fulfill it from json data with additional event binding
    //and computed parameters such parent object
    let File={};

    File.filtered = function () {
        return this.filtered
    };
    console.log(Object.getPrototypeOf(File));

    (function objgen(data){
        Object.keys(filelist).map(function (fl) {
            console.log(fl)
        })
    })();

    function render(filelist) {
        files.innerHTML = '';
}

    //initial render
    render(filelist)
});