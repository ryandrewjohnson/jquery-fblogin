    (function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {
    $.extend({
        fblogin: function (options) {
            
            /**
             * Private Props
             * @property {object}  __               - add private module functions here.
             * @property {object}  publicAPI        - add public functions here.
             * @property {object}  initialized      - a flag to ensure we only init module once.
             */
            var __,                 
                isFbInitiated,
                $dfd;

            options = options || {};
            isFbInitiated = false;
            $dfd = $.Deferred();

            // PRIVATE FUNCTIONS
            __ = {  
                init: function () {
    
                    if (!options.fbId) {
                            throw new Error('fblogin missing required option fbId!')
                    }

                    options.permissions = options.permissions || '';
                    options.fields = options.fields || '';
                    options.success = options.success || function(){};
                    options.error = options.error || function(){};

                    __.listenForFbAsync();
                },
                listenForFbAsync: function () {
                    console.log('init');

                    if (isFbInitiated || window.FB) {
                        __.initFB();
                        isFbInitiated = true;
                        return;
                    }

    
                    window.fbAsyncInit = function() {
                        __.initFB();
                        isFbInitiated = true;
                    };
                },
                initFB: function (dfd) {
                    window.FB.init({
                        appId      : options.fbId,
                        cookie     : true,
                        xfbml      : true,
                        version    : 'v2.0'
                    });

                    console.log('initFB');
                    
                    $dfd.notify({status: 'init.fblogin'});
                },
                loginToFB: function (dfd) {

                    console.log('loginToFB');
                    
                    window.FB.login(function(response) {
                        if (response.authResponse) {

                            $dfd.notify({
                                status: 'authenticate.fblogin',
                                data: response
                            });

                        } else {
                            console.log('User cancelled login or did not fully authorize.');
                            $dfd.reject();
                        }
                    }, {
                        scope: options.permissions, 
                        return_scopes: true
                    });
                },
                getFbFields: function (accessToken) {

                    FB.api('/me', {fields: self.fields}, function(response) {
                        if (response && !response.error) {
                            $dfd.resolve(response);
                        } 
                        else {
                            console.log('Error gettting user data.', response);
                            $dfd.reject();
                        }
                    });
                }
            };

            $dfd.progress(function (response) {

                switch(response.status) {
                    case 'init.fblogin':
                        __.loginToFB();
                    break;

                    case 'authenticate.fblogin':
                        __.getFbFields(response.data.authResponse.accessToken);
                    break;

                    default: 
                        dfd.reject();
                    break;
                }
            });

            $dfd.done(options.success);
            $dfd.reject(options.error);

            __.init();

            return $dfd;
        }
    });
}));