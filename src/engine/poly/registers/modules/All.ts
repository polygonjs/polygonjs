import {PolyEngine} from '../../../Poly';
import {DRACOLoaderModule} from './entry_points/DRACOLoader';
import {EXRLoaderModule} from './entry_points/EXRLoader';
import {FBXLoaderModule} from './entry_points/FBXLoader';
import {GLTFLoaderModule} from './entry_points/GLTFLoader';
import {KTX2LoaderModule} from './entry_points/KTX2Loader';
import {LDrawLoaderModule} from './entry_points/LDrawLoader';
import {OBJLoaderModule} from './entry_points/OBJLoader';
import {PDBLoaderModule} from './entry_points/PDBLoader';
import {PLYLoaderModule} from './entry_points/PLYLoader';
import {RGBELoaderModule} from './entry_points/RGBELoader';
import {SVGLoaderModule} from './entry_points/SVGLoader';
import {STLLoaderModule} from './entry_points/STLLoader';
import {TTFLoaderModule} from './entry_points/TTFLoader';

export class AllModulesRegister {
	static run(poly: PolyEngine) {
		poly.registerModule(DRACOLoaderModule);
		poly.registerModule(EXRLoaderModule);
		poly.registerModule(FBXLoaderModule);
		poly.registerModule(GLTFLoaderModule);
		poly.registerModule(KTX2LoaderModule);
		poly.registerModule(LDrawLoaderModule);
		poly.registerModule(OBJLoaderModule);
		poly.registerModule(PDBLoaderModule);
		poly.registerModule(PLYLoaderModule);
		poly.registerModule(RGBELoaderModule);
		poly.registerModule(SVGLoaderModule);
		poly.registerModule(STLLoaderModule);
		poly.registerModule(TTFLoaderModule);
	}
}
