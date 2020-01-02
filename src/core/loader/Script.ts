import 'src/engine/Poly'

interface BooleanByString {
	[propName: string]: boolean
}
interface AnyByString {
	[propName: string]: any
}
type LoadCallback = () => void
interface LoadCallbackArrayByString {
	[propName: string]: LoadCallback[]
}

export class CoreScriptLoader {
	private static _loaded_state_by_url: BooleanByString = {}
	private static _load_callbacks_by_url: LoadCallbackArrayByString = {}

	// private static _imported_three_modules: AnyByString = {}
	private static _imported_modules: AnyByString = {}

	// static monaco_editor_base():string{
	// 	return '/javascripts/monaco-editor/0.17.1/package/min/vs'
	// }
	// static load_monaco_editor(path:string):Promise<void>{
	// 	const base_folder = this.monaco_editor_base()
	// 	return this.load(`${base_folder}/${path}`)
	// }

	static load(url: string) {
		return new Promise((resolve, reject) => {
			// add .js ext if not present
			const elements = url.split('.')
			const ext = elements[elements.length - 1]
			if (ext != 'js') {
				url = `${url}.js`
			}

			if (POLY.in_worker_thread()) {
				self.importScripts(url)
				resolve()
			} else {
				const id = url.replace(/[\W_]+/g, '_')
				// let script = document.querySelector(`script[src="${url}"]`)
				let script: HTMLScriptElement = document.getElementById(
					id
				) as HTMLScriptElement

				if (script) {
					if (this._loaded_state_by_url[url]) {
						resolve()
					} else {
						this._load_callbacks_by_url[url] =
							this._load_callbacks_by_url[url] || []
						this._load_callbacks_by_url[url].push(resolve)
					}
				} else {
					script = document.createElement('script')
					script.type = 'text/javascript'
					script.async = true
					script.crossOrigin = 'Anonymous'
					script.onload = function() {
						// console.log("loaded", url)
						CoreScriptLoader._loaded_state_by_url[url] = true
						resolve()

						if (CoreScriptLoader._load_callbacks_by_url[url]) {
							for (let callback of CoreScriptLoader
								._load_callbacks_by_url[url]) {
								callback()
							}
							delete CoreScriptLoader._load_callbacks_by_url[url]
						}
					}
					script.src = `${url}?${performance.now()}`
					script.id = id
					document.getElementsByTagName('head')[0].appendChild(script)
				}
			}
		})
	}

	static async module(path: string) {
		const imported_module = this._imported_modules[path]
		if (imported_module) {
			return imported_module
		} else {
			return (this._imported_modules[path] = await this.load_module(path))
		}
	}
	static set_module(path: string, imported_module: object) {
		this._imported_modules[path] = imported_module
	}
	static async three_module(path: string) {
		return this.module(`three/examples/jsm/${path}`)
	}
	// static async module_three(path:string){
	// 	const imported_module = this._imported_three_modules[path]
	// 	if(imported_module){
	// 		return imported_module
	// 	} else {
	// 		return this._imported_three_modules[path] = await this.load_module_three(path)
	// 	}
	// }
	// static set_module_three(path:string, imported_module){
	// 	this._imported_three_modules[path] = imported_module
	// }

	static load_module(path: string) {
		// COMMENT NEXT LINE WHEN EXPORTING FOR ACTIVEDESIGN
		return import(`modules/${path}`)
	}
	static load_module_three(path: string) {
		return this.load_module(`three/examples/jsm/${path}`)
	}
	static load_module_three_loader(path: string) {
		return this.load_module_three(`loaders/${path}`)
	}
	static load_module_three_light(path: string) {
		return this.load_module_three(`lights/${path}`)
	}
	static load_module_three_shader(path: string) {
		return this.load_module_three(`shaders/${path}`)
	}
	static load_module_three_postprocessing(path: string) {
		return this.load_module_three(`postprocessing/${path}`)
	}
}
