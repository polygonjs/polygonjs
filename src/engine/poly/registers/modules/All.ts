import {PolyEngine} from '../../../Poly';
import {CADModule} from './entryPoints/CAD';
import {CSGModule} from './entryPoints/CSG';
import {GSAPModule} from './entryPoints/GSAP';
import {PBRModule} from './entryPoints/PBR';
import {POLY_ANIMModule} from './entryPoints/POLY_ANIM';
import {POLY_GLModule} from './entryPoints/POLY_GL';
import {POLY_JSModule} from './entryPoints/POLY_JS';
import {POLY_OBJModule} from './entryPoints/POLY_OBJ';
import {POLY_SOPModule} from './entryPoints/POLY_SOP';
import {QUADModule} from './entryPoints/QUAD';
import {SDFModule} from './entryPoints/SDF';
import {TETModule} from './entryPoints/TET';

export class AllModulesRegister {
	static run(poly: PolyEngine) {
		poly.registerModule(CADModule);
		poly.registerModule(CSGModule);
		poly.registerModule(GSAPModule);
		poly.registerModule(PBRModule);
		poly.registerModule(POLY_ANIMModule);
		poly.registerModule(POLY_GLModule);
		poly.registerModule(POLY_JSModule);
		poly.registerModule(POLY_OBJModule);
		poly.registerModule(POLY_SOPModule);
		poly.registerModule(QUADModule);
		poly.registerModule(SDFModule);
		poly.registerModule(TETModule);
	}
}
