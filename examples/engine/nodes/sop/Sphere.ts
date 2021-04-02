import {PolyScene} from '../../../../src/engine/scene/PolyScene';

export function SopSphere() {
	// create a scene
	const scene = new PolyScene();
	const root = scene.root();

	// create a sphere
	const geo = root.createNode('geo');
	const sphere = geo.createNode('sphere');

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
	const nodes = [sphere];
	const htmlNodes = {sphere};
	const camera = perspectiveCamera1;
	return {scene, camera, nodes, htmlNodes};
}
