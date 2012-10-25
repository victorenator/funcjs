(function(u) {
/**
 * Returns a function that uses the getter function to get the data for a given key,
 * and if data does not exist, uses the creator function for creating data.
 * Prevents the simultaneous execution of a function for the given key.
 * Other callers waiting for the result.
 * @param {function} getter function(key, function(error, data))
 * @param {function} creator function(key, function(error))
 * @returns {function}
 */    
u.getOrCreate = function(getter, creator) {
    var _queue = {};

    function _w(successFunc, errorFunc) {
        return function(error) {
            if (error) { errorFunc(error); }
            else successFunc();
        };
    }

    return function(key, cb) {
        if (key in _queue) {
            _queue[key].push(_w(getter.bind(this, key, cb), cb));

        } else {
            getter(key, function(error, data) {
                if (error) {
                    if (key in _queue) {
                        _queue[key].push(_w(getter.bind(this, key, cb), cb));

                    } else {
                        _queue[key] = [_w(getter.bind(this, key, cb), cb)];
                        creator(key, function(error) {
                            var funcs = _queue[key];
                            delete _queue[key];
                            funcs.forEach(function(f) { f(error); });
                        });
                    }
                    
                } else {
                    cb.apply(this, arguments);
                }
            });
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
