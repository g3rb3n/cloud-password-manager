
function message(msg){
	$('#status').text(msg)
}

function error(msg){
	$('#status').text(msg)
	$('#status').addClass('error')
}


function handleSettings(settings){
	if (settings){
		$("#username").val(settings.username)
		$("#password").val(settings.password)
		$("#base_url").val(settings.base_url)
		$("#showBelow").prop('checked', settings.showBelow)
		$("#showDebug").prop('checked', settings.showDebug)
		message('Logged in at ' + settings.base_url + ' as ' + settings.username)
	} else {
		message('Not configured')
	}
}

chrome.runtime.onMessage.addListener(function(msg){
	if ('settingsChanged' in msg) handleSettings(msg.settingsChanged)
	if ('retreivedPasswords' in msg) message('Retreived ' + msg.retreivedPasswords.length + ' passwords')
	if ('message' in msg) message(msg.message)
	if ('error' in msg) error(msg.message)
})

function init() {
	chrome.runtime.sendMessage({getSettings:''}, function(response) {
		handleSettings(response)
	});

	$("#getPasswords").on('click',function() {
		message('Retrieving passwords')
		chrome.runtime.sendMessage({retreivePasswords:''})
	});

	$("#save").on('click',function() {
		var settings = {
			username:  $("#username").val(),
			password: $("#password").val(),
			base_url: $("#base_url").val(),
			showBelow: document.getElementById('showBelow').checked,
			showDebug: document.getElementById('showDebug').checked
		}
		message('Saving settings')
		chrome.runtime.sendMessage({saveSettings:settings})
	});
}

$(function() {
	init()
})
