import {PolyScene} from '../../../../src/engine/scene/PolyScene';
import {Poly} from '../../../../src/engine/Poly';

import {OBJLoaderModule} from '../../../../src/engine/poly/registers/modules/entry_points/OBJLoader';
Poly.registerModule(OBJLoaderModule);
export function SopFile() {
	// create a scene
	const scene = new PolyScene();
	const root = scene.root();

	// create a file node
	const geo = root.createNode('geo');
	const file = geo.createNode('file');
	file.p.url.set('https://raw.githubusercontent.com/polygonjs/polygonjs-assets/master/models/wolf.obj');

	// add a light
	root.createNode('hemisphereLight');

	// create a camera
	const perspectiveCamera1 = root.createNode('perspectiveCamera');
	perspectiveCamera1.p.t.set([5, 5, 5]);
	// add orbitControls
	const events1 = perspectiveCamera1.createNode('eventsNetwork');
	const orbitsControls = events1.createNode('cameraOrbitControls');
	perspectiveCamera1.p.controls.setNode(orbitsControls);

	// EXPORT
	const nodes = [file];
	const camera = perspectiveCamera1;
	return {scene, camera, nodes};
}
