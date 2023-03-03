import type {
	OpenCascadeInstance,
	gp_Pnt2d,
	gp_Vec2d,
	gp_Quaternion,
	gp_Vec,
	gp_Trsf,
	gp_Pnt,
	gp_Ax1,
	gp_Ax2,
	gp_Dir,
	gp_XYZ,
	gp_Pln,
} from './CadCommon';

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
	static oc() {
		return _oc!;
	}
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
			// const oc = await initOpenCascade();
			// 2 - custom opencascade build
			const oc = await initOpenCascade({
				mainJS: opencascadeCustomBuild,
				mainWasm: opencascadeCustomBuildWasm,
			});
			//
			//
			// console.log('opencascade build loaded in:', performance.now() - startTime);
			_oc = oc;

			// set globals
			this.gp_Ax1 = new oc.gp_Ax1_1();
			this.gp_Ax2 = new oc.gp_Ax2_1();
			this.gp_Dir = new oc.gp_Dir_1();
			this.gp_Pnt2d = new oc.gp_Pnt2d_1();
			this.gp_Vec2d = new oc.gp_Vec2d_1();
			this.gp_Pln = new oc.gp_Pln_1();
			this.gp_Pnt = new oc.gp_Pnt_1();
			this.gp_Quaternion = new oc.gp_Quaternion_1();
			this.gp_Trsf = new oc.gp_Trsf_1();
			this.gp_TrsfT = new oc.gp_Trsf_1();
			this.gp_TrsfR = new oc.gp_Trsf_1();
			this.gp_TrsfS = new oc.gp_Trsf_1();
			this.gp_Vec = new oc.gp_Vec_1();
			this.gp_XYZ = new oc.gp_XYZ_1();
			// this.TopLoc_Location = new oc.TopLoc_Location_1()

			resolve(oc);
			if (_resolves.length > 0) {
				for (let _resolve of _resolves) {
					_resolve(oc);
				}
			}
		});
	}

	static gp_Ax1: gp_Ax1;
	static gp_Ax2: gp_Ax2;
	static gp_Dir: gp_Dir;
	static gp_Pln: gp_Pln;
	static gp_Pnt2d: gp_Pnt2d;
	static gp_Pnt: gp_Pnt;
	static gp_Vec2d: gp_Vec2d;
	static gp_Quaternion: gp_Quaternion;
	static gp_Trsf: gp_Trsf;
	static gp_TrsfT: gp_Trsf;
	static gp_TrsfR: gp_Trsf;
	static gp_TrsfS: gp_Trsf;
	static gp_Vec: gp_Vec;
	static gp_XYZ: gp_XYZ;
	// static TopLoc_Location:TopLoc_Location
}
