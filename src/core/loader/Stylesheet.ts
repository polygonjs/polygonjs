// interface BooleanByString {
// 	[propName: string]: boolean
// }

export class CoreStylesheetLoader {
	// private static _loaded_state_by_url: BooleanByString = {}

	static load(url: string) {
		// return new Promise((resolve, reject)=>{

		// add .js ext if not present
		const elements = url.split('.')
		const ext = elements[elements.length - 1]
		if (ext != 'css') {
			url = `${url}.css`
		}

		if (POLY.in_worker_thread()) {
			// resolve()
		} else {
			const id = url.replace(/[\W_]+/g, '_')
			// let script = document.querySelector(`script[src="${url}"]`)
			let stylesheet: HTMLLinkElement = document.getElementById(
				id
			) as HTMLLinkElement

			if (stylesheet) {
				// if (this._loaded_state_by_url[url]){
				// 	// resolve()
				// } else {
				// 	// this._load_callbacks_by_url[url] = this._load_callbacks_by_url[url] || []
				// 	// this._load_callbacks_by_url[url].push(resolve)
				// }
			} else {
				stylesheet = document.createElement('link')
				stylesheet.type = 'text/css'
				stylesheet.rel = 'stylesheet'

				stylesheet.href = `${url}?${performance.now()}`
				stylesheet.id = id
				document.getElementsByTagName('head')[0].appendChild(stylesheet)
			}
		}

		// })
	}
}
