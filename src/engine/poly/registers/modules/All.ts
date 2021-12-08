import {ModuleName} from './Common';
import {PolyEngine} from '../../../Poly';
import {BasisTextureLoader} from './entry_points/BasisTextureLoader';
import {DRACOLoader} from './entry_points/DRACOLoader';
import {EXRLoader} from './entry_points/EXRLoader';
import {FBXLoader} from './entry_points/FBXLoader';
import {GLTFLoader} from './entry_points/GLTFLoader';
import {LDrawLoader} from './entry_points/LDrawLoader';
import {OBJLoader} from './entry_points/OBJLoader';
import {PDBLoader} from './entry_points/PDBLoader';
import {PLYLoader} from './entry_points/PLYLoader';
import {RGBELoader} from './entry_points/RGBELoader';
import {SVGLoader} from './entry_points/SVGLoader';
import {STLLoader} from './entry_points/STLLoader';
import {TTFLoader} from './entry_points/TTFLoader';

export class AllModulesRegister {
	static run(poly: PolyEngine) {
		poly.modulesRegister.register(ModuleName.BasisTextureLoader, BasisTextureLoader);
		poly.modulesRegister.register(ModuleName.DRACOLoader, DRACOLoader);
		poly.modulesRegister.register(ModuleName.EXRLoader, EXRLoader);
		poly.modulesRegister.register(ModuleName.FBXLoader, FBXLoader);
		poly.modulesRegister.register(ModuleName.GLTFLoader, GLTFLoader);
		poly.modulesRegister.register(ModuleName.LDrawLoader, LDrawLoader);
		poly.modulesRegister.register(ModuleName.OBJLoader, OBJLoader);
		poly.modulesRegister.register(ModuleName.PDBLoader, PDBLoader);
		poly.modulesRegister.register(ModuleName.PLYLoader, PLYLoader);
		poly.modulesRegister.register(ModuleName.RGBELoader, RGBELoader);
		poly.modulesRegister.register(ModuleName.SVGLoader, SVGLoader);
		poly.modulesRegister.register(ModuleName.STLLoader, STLLoader);
		poly.modulesRegister.register(ModuleName.TTFLoader, TTFLoader);
	}
}
