
var _settings;
var _passwords = [];
var _message = '';
var _error = null;
var _page = null;

function message(str){
	_message = str;
}

function error(error){
	_error = error;
}

function handleRequestError(jqXHR, textStatus, e){
	error(textStatus + '\n' + e)
}

function make_base_auth(user, password) {
	var tok = user + ':' + password;
	var hash = btoa(tok);
	return 'Basic ' + hash;
}

function retreivePasswords(){
	var settings = _settings;
	var username = settings.username;
	var password = settings.password;
	var base_url = settings.base_url;
	message('Retrieving passwords')
	$.ajax({
		type: 'GET',
		url: base_url + '/index.php/apps/passwords/api/0.1/passwords',
		dataType: 'json',
		beforeSend: function (xhr) {
			xhr.setRequestHeader('Authorization', make_base_auth(username, password));
		},
		success: handlePasswordsReceived,
		error: handleRequestError
	});
}

function handlePasswordsReceived(data){
	data = data.filter(function(el){return el.properties})
	data.forEach(function(el){
		message('{' + el.properties + '}')
		if (el.properties)
			el.properties = JSON.parse('{' + el.properties + '}')
	});
	_passwords = data
	chrome.runtime.sendMessage({retreivedPasswords:data})
}

function loadSettings(){
	chrome.storage.local.get('settings', function(data) {
		try{
			_settings = data.settings;
			chrome.runtime.sendMessage({settingsChanged:data.settings})
			message('Settings loaded')
			retreivePasswords()
		}catch(e){
			message('Could not load settings ' + e)
		}
	});
}

function saveSettings(settings){
	_settings = settings;
	chrome.storage.local.set({'settings':settings}, function(){
		message('Settings saved')
		chrome.runtime.sendMessage({settingsChanged:settings})
	})
}

function getMatchingLogins(url){
	var matching = [];
	_passwords.forEach(function(el){
		var website = el.website;
		var username = el.properties.loginname;
		var password = el.pass;
		var address = el.properties.address;
		if (url.match(address)){
			matching.push(el);
		}
	});
	return matching;
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
	if ('getStatus' in request){
		sendResponse({
			username: _settings ? _settings.username : null,
			base_url: _settings ? _settings.base_url : null,
			passwords: _passwords.length,
			page: _page,
			error: _error,
			message: _message
		});
	}
	if ('getSettings' in request){
		sendResponse(_settings)
	}
	if ('getPasswords' in request){
		sendResponse(_passwords)
	}
	if ('getMatchingLogins' in request){
		message('getMatchingLogins')
		sendResponse(getMatchingLogins(request.getMatchingLogins))
	}
	if ('saveSettings' in request){
		saveSettings(request.saveSettings)
	}
	if ('retreivePasswords' in request){
		retreivePasswords();
	}
	if ('pageStateChanged' in request){
		_page = request.pageStateChanged;
	}
	if ('error' in request){
		_error = request.error;
	}
	if ('message' in request){
		_message = request.message;
	}
})

function init() {
	loadSettings();
	message('Background Initialized')
}

$(function() {
	init();
});
