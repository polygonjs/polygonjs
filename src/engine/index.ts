import {SceneJsonImporter} from './io/json/import/Scene';
import {PolyScene} from './scene/PolyScene';
import {Poly} from './Poly';
import {ExpressionRegister} from './poly/registers/expressions/ExpressionRegister';
import {NodesRegister} from './poly/registers/nodes/NodesRegister';
const expressionsRegister = Poly.instance().expressionsRegister;
const nodesRegister = Poly.instance().nodesRegister;
// register
import {AllRegister} from './poly/registers/All';
AllRegister.run();

// for webpack export
export {PolyScene, SceneJsonImporter, expressionsRegister, nodesRegister};

// for esbuild export
declare global {
	interface Window {
		POLY: {
			PolyScene: typeof PolyScene;
			SceneJsonImporter: typeof SceneJsonImporter;
			expressionsRegister: ExpressionRegister;
			nodesRegister: NodesRegister;
		};
	}
}
window.POLY = {
	PolyScene,
	SceneJsonImporter,
	expressionsRegister,
	nodesRegister,
};
