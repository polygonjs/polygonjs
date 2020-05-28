import {DynamicModuleName} from './_BaseRegister';

import {BasisTextureLoader} from '../../../../../modules/three/examples/jsm/loaders/BasisTextureLoader';
import {DRACOLoader} from '../../../../../modules/three/examples/jsm/loaders/DRACOLoader';
import {EXRLoader} from '../../../../../modules/three/examples/jsm/loaders/EXRLoader';
import {FBXLoader} from '../../../../../modules/three/examples/jsm/loaders/FBXLoader';
import {GLTFLoader} from '../../../../../modules/three/examples/jsm/loaders/GLTFLoader';
import {OBJLoader2} from '../../../../../modules/three/examples/jsm/loaders/OBJLoader2';
import {RGBELoader} from '../../../../../modules/three/examples/jsm/loaders/RGBELoader';
import {TTFLoader} from '../../../../../modules/three/examples/jsm/loaders/TTFLoader';
import {SVGLoader} from '../../../../../modules/three/examples/jsm/loaders/SVGLoader';

export interface DynamicModulesMap extends Dictionary<any> {
	[DynamicModuleName.BasisTextureLoader]: {BasisTextureLoader: typeof BasisTextureLoader};
	[DynamicModuleName.DRACOLoader]: {DRACOLoader: typeof DRACOLoader};
	[DynamicModuleName.EXRLoader]: {EXRLoader: typeof EXRLoader};
	[DynamicModuleName.FBXLoader]: {FBXLoader: typeof FBXLoader};
	[DynamicModuleName.GLTFLoader]: {GLTFLoader: typeof GLTFLoader};
	[DynamicModuleName.OBJLoader2]: {OBJLoader2: typeof OBJLoader2};
	[DynamicModuleName.RGBELoader]: {RGBELoader: typeof RGBELoader};
	[DynamicModuleName.TTFLoader]: {TTFLoader: typeof TTFLoader};
	[DynamicModuleName.SVGLoader]: {SVGLoader: typeof SVGLoader};
}

import {Poly} from '../../../Poly';
export class AllDynamicModulesRegister {
	// paths are not dynamic for esbuild
	static run(poly: Poly) {
		poly.dynamic_modules_register.register_module(
			DynamicModuleName.BasisTextureLoader,
			import('../../../../../modules/three/examples/jsm/loaders/BasisTextureLoader')
		);
		poly.dynamic_modules_register.register_module(
			DynamicModuleName.DRACOLoader,
			import('../../../../../modules/three/examples/jsm/loaders/DRACOLoader')
		);
		poly.dynamic_modules_register.register_module(
			DynamicModuleName.EXRLoader,
			import('../../../../../modules/three/examples/jsm/loaders/EXRLoader')
		);
		poly.dynamic_modules_register.register_module(
			DynamicModuleName.FBXLoader,
			import('../../../../../modules/three/examples/jsm/loaders/FBXLoader')
		);
		poly.dynamic_modules_register.register_module(
			DynamicModuleName.GLTFLoader,
			import('../../../../../modules/three/examples/jsm/loaders/GLTFLoader')
		);
		poly.dynamic_modules_register.register_module(
			DynamicModuleName.OBJLoader2,
			import('../../../../../modules/three/examples/jsm/loaders/OBJLoader2')
		);
		poly.dynamic_modules_register.register_module(
			DynamicModuleName.RGBELoader,
			import('../../../../../modules/three/examples/jsm/loaders/RGBELoader')
		);
		poly.dynamic_modules_register.register_module(
			DynamicModuleName.TTFLoader,
			import('../../../../../modules/core/loaders/TTFLoader')
		);
		poly.dynamic_modules_register.register_module(
			DynamicModuleName.SVGLoader,
			import('../../../../../modules/three/examples/jsm/loaders/SVGLoader')
		);
	}
}
