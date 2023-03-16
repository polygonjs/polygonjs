import {SDFLoaderSync} from './SDFLoaderSync';
import {Poly} from '../../../engine/Poly';
import {sanitizeUrl} from '../../UrlHelper';
import {LIBRARY_INSTALL_HINT} from './../../loader/common';
import type {ManifoldStatic} from './SDFCommon';
import {Module} from './SDFCommon';

let _resolves: Resolve[] = [];
let _importStarted = false;
type Resolve = (value: ManifoldStatic | PromiseLike<ManifoldStatic>) => void;
let _manifold: ManifoldStatic | undefined;
export class SDFLoader {
	static async core(): Promise<ManifoldStatic> {
		if (_manifold) {
			return _manifold;
		}
		return new Promise(async (resolve, reject) => {
			if (_importStarted) {
				_resolves.push(resolve);
				return;
			}
			_importStarted = true;

			const onError = () => {
				const message = `failed to load Manifold library. Make sure to install it to use SDF nodes (${LIBRARY_INSTALL_HINT})`;

				reject(new Error(message));
			};

			const root = Poly.libs.root();
			const ManifoldPath = Poly.libs.ManifoldPath();
			if (root || ManifoldPath) {
				const version = Poly.version().replace(/\./g, '-');
				const wasmUrl = sanitizeUrl(`${root || ''}${ManifoldPath || ''}/manifold.wasm?v=${version}`);
				try {
					const response = await fetch(wasmUrl, {method: 'HEAD'});
					if (!response.ok) {
						onError();
						return;
					}

					const manifold: ManifoldStatic = await (Module as any)({
						locateFile: () => wasmUrl,
					});
					manifold.setup();
					_manifold = manifold;

					SDFLoaderSync.__setManifold(manifold);

					resolve(manifold);
					if (_resolves.length > 0) {
						for (let _resolve of _resolves) {
							_resolve(manifold);
						}
						_resolves.length = 0;
					}
				} catch (err) {
					onError();
				}
			}
		});
	}
}
