jquery.fblogin
==============

Empower your users to easily login via Facebook with this simple jQuery plugin.

>Note: Check out the [AngularJS version of fblogin](https://github.com/ryandrewjohnson/angular-fblogin). Same functionality without the jQuery.

Logging in with Facebook usually requires the following steps:
* window.fbAsyncInit
* FB.init
* FB.login
* FB.api(/me)

With the plugin just use `$.fblogin();`.

## Installation

Include script *after* the jQuery library:

```html
<script src="/path/to/jquery.fblogin.js"></script>
```

**The plugin can also be loaded as an AMD or CommonJS module**

You will need a valid Facebook App Id and the Facebook JS SDK loaded to use the plugin.
* [Setting up Facebook App](http://bit.ly/1kcBV6s)
* [Add Facebook SDK](http://bit.ly/1kcFDNy)

## Demo

For a working demo you can check out [A jQuery Plugin For Adding Facebook Login To Your Web App](http://blog.shakainteractive.com/fblogin/)

## Usage

If you have used the jQuery.ajax() method before, then using fblogin should seem familiar. Simply call $.fblogin(options) where options is an object with the desired settings.

>Note: $.fblogin() will need to be called from a user generated event e.g (click). This is because the FB.login() method that is called internally will not trigger from a non-user generated event.

**Minimal login (no permissions):**

```javascript
// This will login a user with Facebook and return user's public data
$.fblogin({
	fbId: '{FB app id}',
	success: function (data) {
		console.log('Basic public user data returned by Facebook', data);
	},
	error: function (error) {
		console.log('An error occurred.', error);
	}
});
```

**Login requesting Facebook permissions:**

```javascript
// the permissions option is a comma separated list of extended FB permissions
$.fblogin({
	fbId: '{FB app id}',
	permissions: 'email,user_birthday',
	success: function (data) {
		console.log('User birthday' + data.birthday + 'and email ' + data.email);
	}
});
```

**Return only the requested fields:**

```javascript
// the fields option is a comma separated list of valid FB fields
$.fblogin({
	fbId: '{FB app id}',
	permissions: 'email,user_birthday',
	fields: 'email,first_name',
	success: function (data) {
		// data will only contain the requested fields plus the user FB id
		// which is always included by default
		console.log(data.first_name, data.birthday);
	}
});
```

**Login using deffereds instead of callbacks:**

```javascript
var $dfd = $.fblogin({fbId: '{FB app id}'});

$dfd.done(function (data) {
	console.log('User first name' + data.first_name);
});

$dfd.fail(function (error) {
	console.log('An error occurred.', error);
});
```

**Listen for progress callbacks:**

```javascript
// There are two progress events that happen during login
// 1. When the FB SDK is initialized
// 2. When the user has successfully authenticated with FB
var $dfd = $.fblogin({fbId: '{FB app id}'});

$dfd.progress(function (response) {
	// reponse object has two properties 'status' and 'data'
	switch (response.status) {
		case 'init.fblogin':
        	console.log('facebook sdk initialized.');  
        break;

        case 'authenticate.fblogin':
        	console.log('user authenticated with facebook.', response.data);
        break;
	}
}
});

$dfd.done(function (data) {
	console.log('User first name' + data.first_name);
});
```

## Fblogin Options

When calling $.fblogin() you will be required to pass in a valid options object. Item(s) marked with * are required.

### *fbId

```javascript
fbId: '156114864459351'
```
A valid Facebook App Id that must be configured to work on the domain that you are using the plugin on.

### permissions

```javascript
permissions: 'email,user_birthday'
```
A comma seperated list of [extended Facebook permissions](http://bit.ly/1kcx9WP) that you wish to request from the users. By default Facebook grants permissions to a user's [public profile](http://bit.ly/1kcwV1M). If you only need access to access to the public permissions then you can omit the permissions option. 

### fields

```javascript
fields: 'email,birthday'
```
A comma seperated list of Facebook fields that will limit which data is returned upon success. Make sure you have requested the appropriate permissions to access the fields provided. e.g. If you want the *birthday* field make sure you have requested the *user_birthday* permission.

### success

```javascript
success: function (data) {}
```
A callback funtion that will be called upon success. The function will receive a *data* object containing the data returned from Facebook.

### error

```javascript
error: function (error) {}
```
A callback funtion that will be called upon error. The function will receive an *error* object containing info related to the error thrown. 

## Notes
* `$.fblogin()` returns a [Deferred Object](http://api.jquery.com/category/deferred-object/) which means you can chain deferred methods like always, fail, done etc..
* Facebook is fickle and tends to change their API with little notice, which could potentially break this plugin. I will try my best to keep up with any changes on the FB side, but there are only so many hours in the day.



## Author

[Ryan Johnson](https://github.com/ryandrewjohnson)
