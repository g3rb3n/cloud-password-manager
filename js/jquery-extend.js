$.fn.some = function(fn, thisArg) {
	var result

	for (var i=0, iLen = this.length; i<iLen; i++) {
		if (this.hasOwnProperty(i)) {
			if (typeof thisArg == 'undefined') {
				result = fn(this[i], i, this)
			} else {
				result = fn.call(thisArg, this[i], i, this)
			}
			if (result) return true
		}
	}
	return false
}
