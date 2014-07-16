(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jQuery'], factory);
    } else {
        // Browser globals
        root.FbLogin = factory(root.jQuery);
    }
}(this, function ($) {
    return function (options) {

        // ** maybe make this look more like $.ajax call
        // 
        /**
         * Private Props
         * @property {object}  __               - add private module functions here.
         * @property {object}  publicAPI        - add public functions here.
         * @property {object}  initialized      - a flag to ensure we only init module once.
         * 
         * @property {object}  optionsDefault   - add default option properties here.
         * @property {object}  optionsRequired  - add required option properties here.
         */
        var __,                 
            publicAPI,
            initialized

            self,
            isFbInitiated = false;

        // PRIVATE FUNCTIONS
        __ = {  
            /**
             * Will initialize the module. 
             * This is automatically called when instantiating the module.
             * @return {undefined}
             */
            init: function(instance) {
                if (initialized === true) { return; }
                initialized = true;

                self = instance;
                self.settings = $.extend({}, options);
                self.permissions = self.settings.permissions || {};
                self.fields = self.settings.fields || {};
            },
            listenForFbAsync: function (dfd) {
                if (isFbInitiated || window.FB) {
                    __.initFB(dfd);
                    isFbInitiated = true;
                    return;
                }

                window.fbAsyncInit = function() {
                    __.initFB(dfd);
                    isFbInitiated = true;
                };
            },
            initFB: function (dfd) {
                window.FB.init({
                    appId      : self.settings.fbId,
                    cookie     : true, // enable cookies to allow the server to access 
                    xfbml      : true,
                    version    : 'v2.0'
                });

                dfd.notify({
                    request: 'fbLoaded'
                });     
            },
            loginToFB: function (dfd) {
                window.FB.login(function(response) {
                    if (response.authResponse) {
                        dfd.notify({
                            request: 'fbAuth',
                            data: response
                        });  
                    } else {
                        console.log('User cancelled login or did not fully authorize.');
                        dfd.reject();
                    }
                }, {
                    scope: self.permissions, 
                    return_scopes: true
                });
            },
            getFbUserInfo: function (dfd, accessToken) {

                FB.api('/me', {fields: self.fields}, function(response) {
                    if (response && !response.error) {
                        dfd.resolve(response);
                    } 
                    else {
                        console.log('Error gettting user data.', response);
                        dfd.reject();
                    }
                });
            }
        };

        // PUBLIC FUNCTIONS
        publicAPI = {
            login: function () {
                var dfd = $.Deferred(),
                    self = this; 

                dfd.progress(function (args) {
                    var request = args.request,
                        data = args.data;

                    switch(request) {
                        case 'fbLoaded':
                            $(self).trigger('load.FbLogin');
                            __.loginToFB(dfd);
                        break;

                        case 'fbAuth':
                            $(self).trigger('authenticate.FbLogin', [data]);
                            __.getFbUserInfo(dfd, data.authResponse.accessToken);
                        break;

                        default: 
                            dfd.reject();
                        break;
                    }
                });

                __.listenForFbAsync(dfd);

                return dfd;
            }
        };

        __.init(this);

        return publicAPI;
    };
}));
