
var app = app || {};
console.log('app initialized');
let tmpl = _.template($('#item-template').html())
tmpl({completed:true})

$(function () {
    'use strict';
    console.log('app init')
    let tmpl = _.template($('#item-template').html())
    // tmpl({completed:true})
    // this.$el.append(_.template('I am <%= amount %> dumb')({amount:200}))
    // kick things off by creating the `App`
 // new app.AppView();
});