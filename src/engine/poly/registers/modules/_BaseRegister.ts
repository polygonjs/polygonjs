import {EXRLoader} from '../../../../modules/three/examples/jsm/loaders/EXRLoader';
import {KTX2Loader} from '../../../../modules/three/examples/jsm/loaders/KTX2Loader';
import {RGBELoader} from '../../../../modules/three/examples/jsm/loaders/RGBELoader';
import {ModuleName} from './Common';

export interface ModulesMap {
	[ModuleName.EXRLoader]: typeof EXRLoader;
	[ModuleName.KTX2Loader]: typeof KTX2Loader;
	[ModuleName.RGBELoader]: typeof RGBELoader;
}

export class BaseModulesRegister {
	// private _loaded_module_by_name: Map<ModuleName, any> = new Map();
	private _module_by_name: Map<ModuleName, any> = new Map();

	register<K extends keyof ModulesMap>(name: K, module: ModulesMap[K]) {
		this._module_by_name.set(name, module);
	}

	moduleNames() {
		const list: ModuleName[] = [];
		this._module_by_name.forEach((module, moduleName) => {
			list.push(moduleName);
		});
		return list;
	}

	module<K extends keyof ModulesMap>(moduleName: K): undefined | ModulesMap[K] {
		return this._module_by_name.get(moduleName);
	}
}
