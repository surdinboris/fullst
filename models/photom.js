// js/models/photom.js
var app = app || {};
console.log('photom.js', "Photom started" )

// ----------

app.Photom = Backbone.Model.extend({
    defaults: {
        title: '',
        completed: false
    },
// Toggle the `completed` state of this item.
    toggle: function() {
        this.save({
            completed: !this.get('completed')
        });
    }
});