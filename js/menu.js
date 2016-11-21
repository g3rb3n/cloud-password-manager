var _settings = {}

function init() {
	document.querySelector('#options').addEventListener('click', function() {
		if (chrome.runtime.openOptionsPage) chrome.runtime.openOptionsPage()
		else window.open(chrome.runtime.getURL('options.html'))
	})
}

function getState(){
	chrome.runtime.sendMessage({getStatus:''}, function(response) {
		var state =
			'Logged in as ' + response.username +
			'\nOn ' + response.base_url +
			'\nCached ' + response.passwords + ' passwords'
		if (_settings.showDebug && response.page)
			state +=
				'\nPage has ' + response.page.passwordFields + ' password fields' +
				'\nPage has ' + response.page.usernameFields + ' username fields' +
				'\nUrl ' + response.page.url
		$('#state').text(state)
	})
}

function getSettings(){
	chrome.runtime.sendMessage({getSettings:''}, function(response) {
		_settings = response
		getState()
	})
}

$(function() {
	init()
})

window.onload = function() {
	getSettings()
}
