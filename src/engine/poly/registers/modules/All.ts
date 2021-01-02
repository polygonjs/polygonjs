import {ModuleName} from './_BaseRegister';

import {BasisTextureLoader} from '../../../../modules/three/examples/jsm/loaders/BasisTextureLoader';
import {DRACOLoader} from '../../../../modules/three/examples/jsm/loaders/DRACOLoader';
import {EXRLoader} from '../../../../modules/three/examples/jsm/loaders/EXRLoader';
import {FBXLoader} from '../../../../modules/three/examples/jsm/loaders/FBXLoader';
import {GLTFLoader} from '../../../../modules/three/examples/jsm/loaders/GLTFLoader';
import {OBJLoader2} from '../../../../modules/three/examples/jsm/loaders/OBJLoader2';
import {PDBLoader} from '../../../../modules/three/examples/jsm/loaders/PDBLoader';
import {PLYLoader} from '../../../../modules/three/examples/jsm/loaders/PLYLoader';
import {RGBELoader} from '../../../../modules/three/examples/jsm/loaders/RGBELoader';
import {TTFLoader} from '../../../../modules/core/loaders/TTFLoader';
import {SVGLoader} from '../../../../modules/three/examples/jsm/loaders/SVGLoader';

export interface ModulesMap extends PolyDictionary<any> {
	[ModuleName.BasisTextureLoader]: {BasisTextureLoader: typeof BasisTextureLoader};
	[ModuleName.DRACOLoader]: {DRACOLoader: typeof DRACOLoader};
	[ModuleName.EXRLoader]: {EXRLoader: typeof EXRLoader};
	[ModuleName.FBXLoader]: {FBXLoader: typeof FBXLoader};
	[ModuleName.GLTFLoader]: {GLTFLoader: typeof GLTFLoader};
	[ModuleName.OBJLoader2]: {OBJLoader2: typeof OBJLoader2};
	[ModuleName.PDBLoader]: {PDBLoader: typeof PDBLoader};
	[ModuleName.PLYLoader]: {PLYLoader: typeof PLYLoader};
	[ModuleName.RGBELoader]: {RGBELoader: typeof RGBELoader};
	[ModuleName.TTFLoader]: {TTFLoader: typeof TTFLoader};
	[ModuleName.SVGLoader]: {SVGLoader: typeof SVGLoader};
}

import {Poly} from '../../../Poly';
import {PolyDictionary} from '../../../../types/GlobalTypes';
export class AllModulesRegister {
	// paths are not dynamic for esbuild
	static run(poly: Poly) {
		poly.modulesRegister.register(
			ModuleName.BasisTextureLoader,
			import('../../../../modules/three/examples/jsm/loaders/BasisTextureLoader')
		);
		poly.modulesRegister.register(
			ModuleName.DRACOLoader,
			import('../../../../modules/three/examples/jsm/loaders/DRACOLoader')
		);
		poly.modulesRegister.register(
			ModuleName.EXRLoader,
			import('../../../../modules/three/examples/jsm/loaders/EXRLoader')
		);
		poly.modulesRegister.register(
			ModuleName.FBXLoader,
			import('../../../../modules/three/examples/jsm/loaders/FBXLoader')
		);
		poly.modulesRegister.register(
			ModuleName.GLTFLoader,
			import('../../../../modules/three/examples/jsm/loaders/GLTFLoader')
		);
		poly.modulesRegister.register(
			ModuleName.OBJLoader2,
			import('../../../../modules/three/examples/jsm/loaders/OBJLoader2')
		);
		poly.modulesRegister.register(
			ModuleName.PDBLoader,
			import('../../../../modules/three/examples/jsm/loaders/PDBLoader')
		);
		poly.modulesRegister.register(
			ModuleName.PLYLoader,
			import('../../../../modules/three/examples/jsm/loaders/PLYLoader')
		);
		poly.modulesRegister.register(
			ModuleName.RGBELoader,
			import('../../../../modules/three/examples/jsm/loaders/RGBELoader')
		);
		poly.modulesRegister.register(ModuleName.TTFLoader, import('../../../../modules/core/loaders/TTFLoader'));
		poly.modulesRegister.register(
			ModuleName.SVGLoader,
			import('../../../../modules/three/examples/jsm/loaders/SVGLoader')
		);
	}
}
