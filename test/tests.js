(function($) {
    
    module('plugin options');
    test('required FB id option not included', function () {
        throws(function () {
            $.fblogin();
        },
        'Should throw an error');
    });

}(jQuery));