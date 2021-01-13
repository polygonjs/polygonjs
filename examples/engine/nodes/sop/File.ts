import {PolyScene} from '../../../../src/engine/scene/PolyScene';

export function SopFile() {
	// create a scene
	const scene = new PolyScene();
	const root = scene.root();

	// create a file node
	const geo = root.createNode('geo');
	const file = geo.createNode('file');
	file.p.url.set('https://polygonjs.com/examples/models/wolf.obj');

	// add a light
	root.createNode('hemisphereLight');

	// create a camera
	const perspectiveCamera1 = root.createNode('perspectiveCamera');
	perspectiveCamera1.p.t.set([5, 5, 5]);
	// add orbitControls
	const events1 = perspectiveCamera1.createNode('events');
	const orbitsControls = events1.createNode('cameraOrbitControls');
	perspectiveCamera1.p.controls.setNode(orbitsControls);

	// EXPORT
	const nodes = [file];
	const camera = perspectiveCamera1;
	return {scene, camera, nodes};
}
