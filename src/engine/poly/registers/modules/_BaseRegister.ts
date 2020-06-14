export enum ModuleName {
	BasisTextureLoader = 'BasisTextureLoader',
	DRACOLoader = 'DRACOLoader',
	EXRLoader = 'EXRLoader',
	FBXLoader = 'FBXLoader',
	GLTFLoader = 'GLTFLoader',
	OBJLoader2 = 'OBJLoader2',
	PDBLoader = 'PDBLoader',
	PLYLoader = 'PLYLoader',
	RGBELoader = 'RGBELoader',
	TTFLoader = 'TTFLoader',
	SVGLoader = 'SVGLoader',
}

export class BaseModulesRegister {
	private _loaded_module_by_name: Map<ModuleName, any> = new Map();
	private _promise_by_name: Map<ModuleName, Promise<object>> = new Map();

	register_module(name: ModuleName, promise: Promise<object>) {
		this._promise_by_name.set(name, promise);
	}

	async module(name: ModuleName) {
		const loaded_module = this._loaded_module_by_name.get(name);
		if (loaded_module) {
			return loaded_module;
		} else {
			const promise = this._promise_by_name.get(name);
			if (promise) {
				const new_loaded_module = await promise;
				if (new_loaded_module) {
					this._loaded_module_by_name.set(name, new_loaded_module);
					return new_loaded_module;
				}
			} else {
				console.warn(`module ${name} not registered`);
			}
		}
	}
}
