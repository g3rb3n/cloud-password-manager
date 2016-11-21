var _settings = {}
var _page = {}

function message(str){
	chrome.runtime.sendMessage({message:str})
}

function findPrevious($el, sel){
	var $prev = null
	var el = $el[0]
	$(sel).some(function(candidate){
		$candidate = $(candidate)
		if (candidate == el)
			return true
		$prev = $candidate
	})
	return $prev
}

function pageStateChanged(update){
	for (key in update)	_page[key] = update[key]
	chrome.runtime.sendMessage({pageStateChanged:_page})
}

function createMenu(passwords){
	var $password = $('[type=password]')
	var $username = findPrevious($password,'input')

	pageStateChanged({
		passwordFields:$password.length,
		usernameFields:$username.length
	})

	if (!$password.length) return

	var $menu = $('<div>').addClass('ocpm-menu').prependTo($('body'))
	var $item = $('<div>').text('Use password for:').appendTo($menu)

	var passwordMap = {}
	passwords.forEach(function(el){
		var website = el.website
		var username = el.properties.loginname
		var password = el.pass
		var address = el.properties.address
		passwordMap[username] = password;
		var $item = $('<div>').addClass('ocpm-menu-item').attr('username', username).text(username).appendTo($menu)
		$item.click(function(){
			$password.val(passwordMap[$(this).attr('username')])
			if ($username) $username.val($(this).attr('username'))
			$menu.hide()
		});
	});
	$('[type=password]').on('focus', function(){
		var $target = $(this)
		var offset = $target.offset()
		var top = offset.top
			top += _settings.showBelow ? $target.outerHeight(): -$menu.outerHeight()
		var left = offset.left
		var width = $target.outerWidth()
		$menu.css('top',top)
		$menu.css('left',left)
		$menu.css('width',width)
		$menu.show()
	});
	$menu.hide()

	$('[type=password]').blur(function(){
		var isHoverOverMenu = $menu.is(":hover")
		if (!isHoverOverMenu) $menu.delay( 2000 ).hide()
	})
}

function getSettings(){
	chrome.runtime.sendMessage({getSettings:''}, function(response) {
		_settings = response
		chrome.runtime.sendMessage({getMatchingLogins:window.location.href}, function(response) {
			createMenu(response)
		})
	})
}

pageStateChanged({
	url:window.location.href
})

getSettings()
