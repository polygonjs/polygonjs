import type {OpenCascadeInstance} from './CadCommon';
import {CadLoaderSync} from './CadLoaderSync';

// 1 - full opencascade build
// import initOpenCascade from 'opencascade.js';
//
// 2 - custom opencascade build
// @ts-ignore
// // import opencascadeCustomBuildWasm from './build/cadNodes.wasm';
interface InitOpenCascadeOption {
	mainJS: () => Promise<OpenCascadeInstance>;
	mainWasm: string;
	worker?: string;
	libs?: string[];
	module?: Object;
}
type InitCallback = (options: InitOpenCascadeOption) => Promise<OpenCascadeInstance>;
import opencascadeCustomBuild from './build/polygonjs-occt.js';
const initOpenCascade: InitCallback = (options) => {
	const module = options.module || {};
	return new Promise((resolve, reject) => {
		new (options.mainJS as any)({
			locateFile(path: string) {
				if (path.endsWith('.wasm')) {
					return options.mainWasm;
				}
				if (path.endsWith('.worker.js') && !!options.worker) {
					return options.worker;
				}
				return path;
			},
			...module,
		}).then(async (oc: OpenCascadeInstance) => {
			if (options.libs) {
				for (let lib of options.libs) {
					await (oc as any).loadDynamicLibrary(lib, {
						loadAsync: true,
						global: true,
						nodelete: true,
						allowUndefined: false,
					});
				}
			}
			resolve(oc);
		});
	});
};

// import initOpenCascade from 'opencascade.js';

//
import {Poly} from '../../../engine/Poly';
import {sanitizeUrl} from '../../UrlHelper';
import {BaseNodeType} from '../../../engine/nodes/_Base';
import {LIBRARY_INSTALL_HINT} from './../../loader/common';

let _resolves: Resolve[] = [];
// let _requestingNodes: BaseNodeType[] = [];
let _importStarted = false;
type Resolve = (value: OpenCascadeInstance | PromiseLike<OpenCascadeInstance>) => void;
let _oc: OpenCascadeInstance | undefined;
export class CadLoader {
	static async core(node: BaseNodeType): Promise<OpenCascadeInstance> {
		if (_oc) {
			return _oc;
		}
		return new Promise(async (resolve, reject) => {
			if (_importStarted) {
				_resolves.push(resolve);
				// _requestingNodes.push(node);
				return;
			}
			_importStarted = true;

			const onError = () => {
				// console.log(err);
				const message = `failed to load OpenCascade library. Make sure to install it to use CAD nodes (${LIBRARY_INSTALL_HINT})`;
				// console.log(message);
				// if (_requestingNodes.length > 0) {
				// 	for (let node of _requestingNodes) {
				// 		node.states.error.set(message);
				// 	}
				// }

				reject(new Error(message));
			};

			const root = Poly.libs.root();
			const OCCTPath = Poly.libs.OCCTPath();
			if (root || OCCTPath) {
				const version = Poly.version().replace(/\./g, '-');
				const wasmUrl = sanitizeUrl(`${root || ''}${OCCTPath || ''}/polygonjs-occt.wasm?v=${version}`);
				try {
					// prefetch wasm to get a proper error if wasm isn't found
					const response = await fetch(wasmUrl, {method: 'HEAD'});
					if (!response.ok) {
						onError();
						return;
					}

					// fetch wasm
					// const startTime = performance.now();
					// 1 - full opencascade build
					// const oc = (await initOpenCascade()) as any as OpenCascadeInstance;
					// 2 - custom opencascade build
					const oc = await initOpenCascade({
						mainJS: opencascadeCustomBuild,
						mainWasm: wasmUrl,
					});
					// .then((oc) => {
					//
					//
					// console.log('opencascade build loaded in:', performance.now() - startTime);
					_oc = oc;

					CadLoaderSync.__setOC(oc);

					resolve(oc);
					if (_resolves.length > 0) {
						for (let _resolve of _resolves) {
							_resolve(oc);
						}
						_resolves.length = 0;
					}
					// })
					// .catch((err) => {
					// 	onError();
					// });
				} catch (err) {
					onError();
				}
			}
		});
	}
}
