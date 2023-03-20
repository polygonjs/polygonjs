// import {CADModule} from '../../../../core/geometry/cad/CadModule';
// import {EXRLoader} from 'three/examples/jsm/loaders/EXRLoader';
// import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader';
// import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
// import {KTX2Loader} from 'three/examples/jsm/loaders/KTX2Loader';
// import {LDrawLoader} from 'three/examples/jsm/loaders/LDrawLoader';
// import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader';
// import {PDBLoader} from 'three/examples/jsm/loaders/PDBLoader';
// import {PLYLoader} from 'three/examples/jsm/loaders/PLYLoader';
// import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader';
// import {SVGLoader} from 'three/examples/jsm/loaders/SVGLoader';
// import {STLLoader} from 'three/examples/jsm/loaders/STLLoader';
// import {TTFLoader} from 'three/examples/jsm/loaders/TTFLoader';
import {ModuleName} from './Common';
import {BaseModule} from './_BaseModule';

// export interface ModulesMap {
// 	[ModuleName.CAD]:  CADModule;
// 	// [ModuleName.EXRLoader]: typeof EXRLoader;
// 	// [ModuleName.FBXLoader]: typeof FBXLoader;
// 	// [ModuleName.GLTFLoader]: typeof GLTFLoader;
// 	// [ModuleName.KTX2Loader]: typeof KTX2Loader;
// 	// [ModuleName.LDrawLoader]: typeof LDrawLoader;
// 	// [ModuleName.OBJLoader]: typeof OBJLoader;
// 	// [ModuleName.PDBLoader]: typeof PDBLoader;
// 	// [ModuleName.PLYLoader]: typeof PLYLoader;
// 	// [ModuleName.RGBELoader]: typeof RGBELoader;
// 	// [ModuleName.SVGLoader]: typeof SVGLoader;
// 	// [ModuleName.STLLoader]: typeof STLLoader;
// 	// [ModuleName.TTFLoader]: typeof TTFLoader;
// }

export class BaseModulesRegister {
	// private _loaded_module_by_name: Map<ModuleName, any> = new Map();
	private _moduleByName: Map<ModuleName, any> = new Map();

	register<K extends ModuleName>(moduleName: K, module: BaseModule<K>) {
		if (this._moduleByName.has(moduleName)) {
			console.warn('module already registered', moduleName);
			return;
		}
		this._moduleByName.set(moduleName, module);
		module.onRegister();
	}

	moduleNames() {
		const list: ModuleName[] = [];
		this._moduleByName.forEach((module, moduleName) => {
			list.push(moduleName);
		});
		return list;
	}

	// module<K extends keyof ModulesMap>(moduleName: K): undefined | ModulesMap[K] {
	// 	return this._module_by_name.get(moduleName);
	// 	// if (module) {
	// 	// 	return {[moduleName]: module};
	// 	// }
	// 	// const loaded_module = this._module_by_name.get(name);
	// 	// if (loaded_module) {
	// 	// 	return loaded_module;
	// 	// } else {
	// 	// 	const promise = this._promise_by_name.get(name);
	// 	// 	if (promise) {
	// 	// 		const new_loaded_module = await promise;
	// 	// 		if (new_loaded_module) {
	// 	// 			this._loaded_module_by_name.set(name, new_loaded_module);
	// 	// 			return new_loaded_module;
	// 	// 		}
	// 	// 	} else {
	// 	// 		console.warn(`module ${name} not registered`);
	// 	// 	}
	// 	// }
	// }
}
