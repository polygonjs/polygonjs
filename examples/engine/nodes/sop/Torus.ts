import {PolyScene} from '../../../../src/engine/scene/PolyScene';

export function SopTorus() {
	// create a scene
	const scene = new PolyScene();

	// create a torus
	const geo = scene.root.createNode('geo');
	const torus = geo.createNode('torus');

	// add a light
	scene.root.createNode('hemisphereLight');

	// create a camera
	const perspectiveCamera1 = scene.root.createNode('perspectiveCamera');
	perspectiveCamera1.p.t.set([5, 5, 5]);
	// add orbitControls
	const events1 = perspectiveCamera1.createNode('events');
	const orbitsControls = events1.createNode('cameraOrbitControls');
	perspectiveCamera1.p.controls.setNode(orbitsControls);

	// EXPORT
	const nodes = [torus];
	const camera = perspectiveCamera1;
	return {scene, camera, nodes};
}
