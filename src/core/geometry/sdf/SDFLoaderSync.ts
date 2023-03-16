import type {ManifoldStatic} from './SDFCommon';

let _manifold: ManifoldStatic | undefined;
export class SDFLoaderSync {
	static __setManifold(manifold: ManifoldStatic) {
		_manifold = manifold;
	}
	static manifold() {
		return _manifold!;
	}
}
