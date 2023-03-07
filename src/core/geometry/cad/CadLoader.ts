import type {OpenCascadeInstance} from './CadCommon';
import {CadLoaderSync} from './CadLoaderSync';

// 1 - full opencascade build
// import initOpenCascade from 'opencascade.js';
//
// 2 - custom opencascade build
// @ts-ignore
import opencascadeCustomBuildWasm from './build/cadNodes.wasm';
import opencascadeCustomBuild from './build/cadNodes.js';
import initOpenCascade from 'opencascade.js';
//

let _resolves: Resolve[] = [];
let _importStarted = false;
type Resolve = (value: OpenCascadeInstance | PromiseLike<OpenCascadeInstance>) => void;
let _oc: OpenCascadeInstance | undefined;
export class CadLoader {
	static async core(): Promise<OpenCascadeInstance> {
		if (_oc) {
			return _oc;
		}
		return new Promise(async (resolve) => {
			if (_importStarted) {
				_resolves.push(resolve);
				return;
			}
			_importStarted = true;

			// const startTime = performance.now();
			// 1 - full opencascade build
			// const oc = (await initOpenCascade()) as any as OpenCascadeInstance;
			// 2 - custom opencascade build
			const oc = (await initOpenCascade({
				mainJS: opencascadeCustomBuild,
				mainWasm: opencascadeCustomBuildWasm,
			})) as unknown as OpenCascadeInstance;
			//
			//
			// console.log('opencascade build loaded in:', performance.now() - startTime);
			_oc = oc;

			CadLoaderSync.__setOC(oc);
			// this.TopLoc_Location = new oc.TopLoc_Location_1()

			resolve(oc);
			if (_resolves.length > 0) {
				for (let _resolve of _resolves) {
					_resolve(oc);
				}
			}
		});
	}
}
