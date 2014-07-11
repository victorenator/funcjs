var async = require('async');
var assert = require('assert');
var vows = require('vows');

var funcjs = require('../funcjs');

var func = funcjs.getOrCreate(function(key, cb) {
    if (key in this) cb(null, this[key]);
    else cb({error: true});
}, function(key, cb) {
    var self = this;
    setTimeout(function() {
        self[key] = new Date();
        return cb(null);
    }, 1000);
});

var func2 = funcjs.getOrCreate(function(key, options, cb) {
    if (key in this) cb(null, this[key]);
    else cb({error: true});
}, function(key, options, cb) {
    var self = this;
    setTimeout(function() {
        self[key] = new Date();
        return cb(null);
    }, 1000);
});

var res = {};

vows.describe('FuncJS')
.addBatch({
    'When executes series': {
        topic: function() {
            async.series([
                func.bind(res, '1'),
                func.bind(res, '1')
            ], this.callback);
        },
        'result is the same': function(res) {
            assert.equal(res[0], res[1]);
        }
    },
    'When executes parallel': {
        topic: function() {
            async.parallel([
                func.bind(res, '2'),
                func.bind(res, '2')
            ], this.callback);
        },
        'result is the same': function(res) {
            assert.equal(res[0], res[1]);
        }
    }
})
.addBatch({
    'When executes series multiargs': {
        topic: function() {
            async.series([
                func2.bind(res, '3', {}),
                func2.bind(res, '3', {})
            ], this.callback);
        },
        'result is the same': function(res) {
            assert.equal(res[0], res[1]);
        }
    },
    'When executes parallel multiargs': {
        topic: function() {
            async.parallel([
                func2.bind(res, '4', {}),
                func2.bind(res, '4', {})
            ], this.callback);
        },
        'result is the same': function(res) {
            assert.equal(res[0], res[1]);
        }
    }
})
['export'](module);;
