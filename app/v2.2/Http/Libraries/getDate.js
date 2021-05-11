const pad = (v) => {
	return (v < 10) ? '0' + v : v
}

exports.getDate= (d) => {
	let year = d.getFullYear()
	let month = pad(d.getMonth() + 1)
	let day = pad(d.getDate())
	let hour = pad(d.getHours())
	let min = pad(d.getMinutes())
	let sec = pad(d.getSeconds())
	//YYYYMMDDhhmmss
	return Number(year + month + day + hour + min + sec)
}

