/**
 * jquery.jsonrpc.js
 * @version     $Id: test.php v 1.4.1 2010-11-10 16:54:05 hfcorriez $
 * @changelog
 * v.1.4.1  修改并完善了jsonp的支持，增加了complete的支持
 * 
 */
(function($) {
    $.extend({
        jsonRPC: {
            version: '2.0',
            endPoint: null,
            namespace: null,
            dateType: 'jsonp',
            jsonp: 'callback',

            setup: function(params) {
                this._validateConfigParams(params);
                this.endPoint = params.endPoint;
                this.namespace = params.namespace;

                return this;
            },

            withOptions: function(params, callback) {
                this._validateConfigParams(params);
                // No point in running if there isn't a callback received to run
                if(typeof(callback) === 'undefined') throw("No callback specified");

                origParams = {
                    endPoint: this.endPoint,
                    namespace: this.namespace
                };
                this.setup(params);
                callback.call(this);
                this.setup(origParams);
            },

            request: function(method, params, callbacks, url) {
                this._validateRequestMethod(method);
                this._validateRequestParams(params);
                this._validateRequestCallbacks(callbacks);
                this._doRequest(this._requestDataObj(method, params, 1),
                    callbacks,
                    url);
                return true;
            },

            _validateConfigParams: function(params) {
                if(typeof(params) === 'undefined') {
                    throw("No params specified");
                }
                else {
                    if(params.endPoint && typeof(params.endPoint) !== 'string'){
                        throw("endPoint must be a string");
                    }
                    if(params.namespace && typeof(params.namespace) !== 'string'){
                        throw("namespace must be a string");
                    }
                }
            },
      
            _validateRequestMethod: function(method) {
                if(typeof(method) !== 'string') throw("Invalid method supplied for jsonRPC request")
                return true;
            },

            _validateRequestParams: function(params) {
                if(!(params === null ||
                    typeof(params) === 'undefined' ||
                    typeof(params) === 'object' ||
                    $.isArray(params))) {
                    throw("Invalid params supplied for jsonRPC request. It must be empty, an object or an array.");
                }
                return true;
            },

            _validateRequestCallbacks: function(callbacks) {
                if(typeof(callbacks) !== 'undefined') {
                    if(typeof(callbacks.error) !== 'undefined' &&
                        typeof(callbacks.error) !== 'function') throw("Invalid error callback supplied for jsonRPC request");
                    if(typeof(callbacks.success) !== 'undefined' &&
                        typeof(callbacks.success) !== 'function') throw("Invalid success callback supplied for jsonRPC request");
                }
                return true;
            },

            _doRequest: function(data, callbacks, url) {
                var _that = this;
                $.ajax({
                    type: 'POST',
                    dataType: this.dateType,
                    contentType: 'application/json',
                    url: this._requestUrl(url),
                    data: _that._sortData(data),
                    cache: false,
                    jsonp: this.jsonp,
                    processData: false,
                    error: function(json) {
                        _that._requestError.call(_that, callbacks, json);
                    },
                    success: function(json) {
                        _that._requestSuccess.call(_that, callbacks, json);
                    },
                    complete: function(json){
                        _that._requestComplete.call(_that, callbacks, json);
                    }
                })
            },

            _sortData: function(data){
                return JSON.stringify(data);
            },

            _requestUrl: function(url) {
                url = url || this.endPoint;
                return url + '?tm=' + new Date().getTime()
            },

            _requestDataObj: function(method, params, id) {
                return {
                    jsonrpc: this.version,
                    method: this.namespace ? this.namespace +'.'+ method : method,
                    params: params,
                    id: id
                }
            },

            _requestComplete: function(callbacks, json) {
                if (typeof(callbacks) !== 'undefined' && typeof(callbacks.complete) === 'function') {
                    callbacks.complete(this._response());
                }
            },

            _requestError: function(callbacks, json) {
                if (typeof(callbacks) !== 'undefined' && typeof(callbacks.error) === 'function') {
                    callbacks.error(this._response());
                }
            },

            _requestSuccess: function(callbacks, json) {
                var response = this._response(json);
                if(response.error && typeof(callbacks) !=='undefined' && typeof(callbacks.error) !== 'undefined') {
                    callbacks.error(response);
                    return;
                }

                if(typeof(callbacks) !== 'undefined' && typeof(callbacks.success) !== 'undefined') {
                    callbacks.success ? callbacks.success(response) : null;
                }
            },

            _response: function(json) {
                if (typeof(json) === 'undefined') {
                    return {
                        error: 'Internal server error',
                        version: '2.0'
                    };
                }
                else {
                    try {
                        if(typeof(json) === 'string') {
                            json = eval ( '(' + json + ')' );
                        }

                        if (($.isArray(json) && json.length > 0 && json[0].jsonrpc !== '2.0') ||
                            (!$.isArray(json) && json.jsonrpc !== '2.0')) {
                            throw 'Version error';
                        }

                        return json;
                    }
                    catch (e) {
                        return {
                            error: 'Internal server error: ' + e,
                            version: '2.0'
                        }
                    }
                }
            }

        }
    });
})(jQuery);
