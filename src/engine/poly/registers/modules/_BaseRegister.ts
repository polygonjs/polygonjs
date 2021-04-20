import {BasisTextureLoader} from '../../../../modules/three/examples/jsm/loaders/BasisTextureLoader';
import {DRACOLoader} from '../../../../modules/three/examples/jsm/loaders/DRACOLoader';
import {EXRLoader} from '../../../../modules/three/examples/jsm/loaders/EXRLoader';
import {FBXLoader} from '../../../../modules/three/examples/jsm/loaders/FBXLoader';
import {GLTFLoader} from '../../../../modules/three/examples/jsm/loaders/GLTFLoader';
import {OBJLoader} from '../../../../modules/three/examples/jsm/loaders/OBJLoader';
import {PDBLoader} from '../../../../modules/three/examples/jsm/loaders/PDBLoader';
import {PLYLoader} from '../../../../modules/three/examples/jsm/loaders/PLYLoader';
import {RGBELoader} from '../../../../modules/three/examples/jsm/loaders/RGBELoader';
import {SVGLoader} from '../../../../modules/three/examples/jsm/loaders/SVGLoader';
import {STLLoader} from '../../../../modules/three/examples/jsm/loaders/STLLoader';
import {TTFLoader} from '../../../../modules/three/examples/jsm/loaders/TTFLoader';
import {ModuleName} from './Common';

export interface ModulesMap {
	[ModuleName.BasisTextureLoader]: typeof BasisTextureLoader;
	[ModuleName.DRACOLoader]: typeof DRACOLoader;
	[ModuleName.EXRLoader]: typeof EXRLoader;
	[ModuleName.FBXLoader]: typeof FBXLoader;
	[ModuleName.GLTFLoader]: typeof GLTFLoader;
	[ModuleName.OBJLoader]: typeof OBJLoader;
	[ModuleName.PDBLoader]: typeof PDBLoader;
	[ModuleName.PLYLoader]: typeof PLYLoader;
	[ModuleName.RGBELoader]: typeof RGBELoader;
	[ModuleName.SVGLoader]: typeof SVGLoader;
	[ModuleName.STLLoader]: typeof STLLoader;
	[ModuleName.TTFLoader]: typeof TTFLoader;
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
		// if (module) {
		// 	return {[moduleName]: module};
		// }
		// const loaded_module = this._module_by_name.get(name);
		// if (loaded_module) {
		// 	return loaded_module;
		// } else {
		// 	const promise = this._promise_by_name.get(name);
		// 	if (promise) {
		// 		const new_loaded_module = await promise;
		// 		if (new_loaded_module) {
		// 			this._loaded_module_by_name.set(name, new_loaded_module);
		// 			return new_loaded_module;
		// 		}
		// 	} else {
		// 		console.warn(`module ${name} not registered`);
		// 	}
		// }
	}
}
