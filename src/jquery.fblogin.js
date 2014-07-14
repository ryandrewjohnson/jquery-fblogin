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
                        // dfd.resolve(response.authResponse.accessToken);
                        dfd.notify({
                            request: 'fbAuth',
                            data: response.authResponse.accessToken
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
                var fields = { fields: 'first_name,last_name,locale,email,birthday' };

                FB.api('/me', fields, function(response) {
                    if (response && !response.error) {
                        // add access token to reuturned data
                        response.accessToken = accessToken;
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
                var dfd = $.Deferred(); 

                dfd.progress(function (args) {

                    switch(args.request) {
                        case 'fbLoaded':
                            console.log('fbLoaded');

                            __.loginToFB(dfd);
                        break;

                        case 'fbAuth':
                            console.log('fb auth');
                        break;

                        case 'fbUserInfo':
                        break;
                    }
                });

                __.listenForFbAsync(dfd);

                /*
                __.listenForFbAsync().done(function () {
                    dfd.notify({
                        type: 'facebook loaded'
                    });

                    __.loginToFB()
                        .fail(function () {

                        })
                        .done(function () {
                            dfd.notify({
                                type: 'facebook login success'
                            });
                        });
                });
                */

                return dfd;
            }
        };

        __.init(this);

        return publicAPI;
    };
}));
