import type {ManifoldToplevel} from './SDFCommon';

let _manifold: ManifoldToplevel | undefined;
export class SDFLoaderSync {
	static __setManifold(manifold: ManifoldToplevel) {
		_manifold = manifold;
	}
	static manifold() {
		return _manifold!;
	}
}
