import {PolyEngine} from '../../../Poly';
import {CADModule} from './entryPoints/CAD';
import {CSGModule} from './entryPoints/CSG';
import {PBRModule} from './entryPoints/PBR';
import {QUADModule} from './entryPoints/QUAD';
import {SDFModule} from './entryPoints/SDF';
import {TETModule} from './entryPoints/TET';

export class AllModulesRegister {
	static run(poly: PolyEngine) {
		poly.registerModule(CADModule);
		poly.registerModule(CSGModule);
		poly.registerModule(PBRModule);
		poly.registerModule(QUADModule);
		poly.registerModule(SDFModule);
		poly.registerModule(TETModule);
	}
}
