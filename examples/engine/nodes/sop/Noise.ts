import {PolyScene} from '../../../../src/engine/scene/PolyScene';

export function SopNoise() {
	// create a scene
	const scene = new PolyScene();
	const root = scene.root();

	// create a sphere
	const geo = root.createNode('geo');
	const sphere = geo.createNode('sphere');

	// add a noise
	const noise = geo.createNode('noise');
	noise.setInput(0, sphere);
	noise.p.amplitude.set(0.5);
	noise.p.useNormals.set(true);
	noise.flags.display.set(true);

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
	const nodes = [noise];
	const htmlNodes = {noise};
	const camera = perspectiveCamera1;
	return {scene, camera, nodes, htmlNodes};
}
