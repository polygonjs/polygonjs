import {GLTFLoader} from '../../../../../modules/three/examples/jsm/loaders/GLTFLoader';
import {OBJLoader2} from '../../../../../modules/three/examples/jsm/loaders/OBJLoader2';

export interface DynamicModulesMap extends Dictionary<any> {
	gltf_loader: typeof GLTFLoader;
	obj_loader2: {OBJLoader2: typeof OBJLoader2};
}

import {Poly} from '../../../Poly';
export class AllDynamicModulesRegister {
	static run(poly: Poly) {
		poly.dynamic_modules_register.register_three_loader('GLTFLoader', 'gltf_loader');
		poly.dynamic_modules_register.register_three_loader('OBJLoader2', 'obj_loader2');
	}
}
