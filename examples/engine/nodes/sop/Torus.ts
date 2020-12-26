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
	const perspective_camera1 = scene.root.createNode('perspectiveCamera');
	perspective_camera1.p.t.set([5, 5, 5]);
	// add orbit_controls
	const events1 = perspective_camera1.createNode('events');
	const orbits_controls = events1.createNode('cameraOrbitControls');
	perspective_camera1.p.controls.set(orbits_controls.fullPath());

	// EXPORT
	const nodes = [torus];
	const camera = perspective_camera1;
	return {scene, camera, nodes};
}
