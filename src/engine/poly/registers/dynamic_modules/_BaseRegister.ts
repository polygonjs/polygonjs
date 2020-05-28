const THREE_LOADERS_ROOT = 'three/examples/jsm/loaders';

export class BaseDynamicModulesRegister {
	private _modules_path_by_name: Map<string, string> = new Map();
	private _loaded_module_by_name: Map<string, any> = new Map();

	register_module_path(path: string, name: string) {
		this._modules_path_by_name.set(name, path);
	}
	register_three_loader(path: string, name: string) {
		this._modules_path_by_name.set(name, `${THREE_LOADERS_ROOT}/${path}`);
	}
	get_module_path(name: string) {
		return this._modules_path_by_name.get(name);
	}

	async load(name: string) {
		const loaded_module = this._loaded_module_by_name.get(name);
		if (loaded_module) {
			return loaded_module;
		} else {
			const module_path = this.get_module_path(name);
			if (module_path) {
				const new_loaded_module = await import(`../../../../../modules/${module_path}`);
				if (new_loaded_module) {
					this._loaded_module_by_name.set(name, new_loaded_module);
					return new_loaded_module;
				}
			}
		}
	}
}
