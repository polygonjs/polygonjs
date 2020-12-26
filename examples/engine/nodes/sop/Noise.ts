import {PolyScene} from '../../../../src/engine/scene/PolyScene';

export function SopNoise() {
	// create a scene
	const scene = new PolyScene();

	// create a sphere
	const geo = scene.root.createNode('geo');
	const sphere = geo.createNode('sphere');

	// add a noise
	const noise = geo.createNode('noise');
	noise.setInput(0, sphere);
	noise.p.amplitude.set(0.5);
	noise.p.use_normals.set(true);
	noise.flags.display.set(true);

	// add a light
	scene.root.createNode('hemisphereLight');

	// create a camera
	const perspective_camera1 = scene.root.createNode('perspectiveCamera');
	perspective_camera1.p.t.set([5, 5, 5]);
	// add orbit_controls
	const events1 = perspective_camera1.createNode('events');
	const orbits_controls = events1.createNode('cameraOrbitControls');
	perspective_camera1.p.controls.set(orbits_controls.fullPath());

	// EXPORT
	const nodes = [noise];
	const html_nodes = {noise};
	const camera = perspective_camera1;
	return {scene, camera, nodes, html_nodes};
}
