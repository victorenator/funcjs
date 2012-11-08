(function(u) {
/**
 * Returns a function that uses the getter function to get the data for a given key,
 * and if data does not exist, uses the creator function for creating data.
 * Prevents the simultaneous execution of a function for the given key.
 * Other callers waiting for the result.
 * @param {function} getter function(key, function(error, data))
 * @param {function} creator function(key, function(error))
 * @param {function} hash function(key, function(error))
 * @returns {function}
 */    
u.getOrCreate = function(getter, creator, hash) {
    var _queue = {};

    function _w(thiz, successFunc, errorFunc, args) {
        return function(error) {
            if (error) errorFunc.call(thiz, error);
            else successFunc.apply(thiz, args);
        };
    }

    return function(key) {
        var self = this;
        if (hash) key = hash.apply(this, Array.prototype.slice.call(arguments, 0, arguments - 1));
        var args = Array.prototype.slice.call(arguments);
        var cb = arguments[arguments.length - 1];
        
        if (key in _queue) {
            _queue[key].push(_w(self, getter, cb, args));

        } else {
            var args2 = args.slice(0, arguments.length - 1);
            getter.apply(self, args2.concat([function(error) {
                if (error) {
                    if (key in _queue) {
                        _queue[key].push(_w(self, getter, cb, args));

                    } else {
                        _queue[key] = [_w(self, getter, cb, args)];
                        creator.apply(self, args2.concat([function(error) {
                            var funcs = _queue[key];
                            delete _queue[key];
                            funcs.forEach(function(f) { f(error); });
                        }]));
                    }
                    
                } else {
                    cb.apply(this, arguments);
                }
            }]));
        }
    };
};

/**
 * Create cached version of the given func.
 * @param {Function} func
 * @returns {Function} cached func
 */
u.cache = function(func) {
    var _c = {};
    return u.getOrCreate(function(key, cb) {
        cb(null, _c[key]);
    }, function(key, cb) {
        func(key, function(error, data) {
            if (error) {
                cb(error);

            } else {
                _c[key] = data;
                cb();
            }
        });
    });
};
})(exports);
