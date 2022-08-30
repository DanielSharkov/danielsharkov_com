const thisBaseURL = (
	window.location.protocol +'//'+ window.location.host + window.location.pathname
)

function queryObjToString(queryObj: {[key: string]: string}): string {
	if (Object.keys(queryObj).length < 1) {
		return ''
	}
	let str = '?'
	let itr = 0
	for (const key of Object.keys(queryObj)) {
		str += key +'='+ queryObj[key]
		if (itr + 1 < Object.keys(queryObj).length) {
			str += '&'
		}
		itr++
	}
	return str
}

export function removeQuery(queryName: string): void {
	const query = {}
	if (window.location?.search) {
		for (
			const qrs of window.location.search
				.substring(1, window.location.search.length)
				.split('&')
		) {
			let [key, val] = qrs.split('=')
			if (key != queryName) {query[key] = val}
		}
	}
	if (window.history?.pushState) {
		window.history.pushState(null, '', (
			thisBaseURL + queryObjToString(query) + window.location.hash
		))
	}
}

export function getFullQuery(): {[key: string]: string} {
	const query = {}
	if (window.location?.search) {
		for (
			const qrs of window.location.search
				.substring(1, window.location.search.length)
				.split('&')
		) {
			let [key, val] = qrs.split('=')
			query[key] = val
		}
	}
	return query
}

export function getQuery(queryName: string): string|undefined {
	if (window.location?.search) {
		for (
			const qrs of window.location.search
				.substring(1, window.location.search.length)
				.split('&')
		) {
			let [key, val] = qrs.split('=')
			if (key == queryName) {return val}
		}
	}
	return undefined
}

export function setQuery(
	queryName: string, value: string, state? : any,
	title?: string|null, replaceState?: boolean,
): void {
	const queryObj = getFullQuery()
	queryObj[queryName] = value
	if (replaceState && window.history?.replaceState) {
		window.history.replaceState(
			state, title,
			thisBaseURL + queryObjToString(queryObj) + window.location.hash,
		)
	}
	else if (window.history?.pushState) {
		window.history.pushState(
			state, title,
			thisBaseURL + queryObjToString(queryObj) + window.location.hash,
		)
	}
}
