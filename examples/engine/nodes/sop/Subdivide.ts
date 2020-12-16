import {PolyScene} from '../../../../src/engine/scene/PolyScene';

export function SopSubdivide() {
	// create a scene
	const scene = new PolyScene();

	// create a box
	const geo = scene.root.createNode('geo');
	const box = geo.createNode('box');

	// add a subdivide node
	const subdivide = geo.createNode('subdivide');
	subdivide.set_input(0, box);
	subdivide.flags.display.set(true);

	// add a light
	scene.root.createNode('hemisphere_light');

	// create a camera
	const perspective_camera1 = scene.root.createNode('perspective_camera');
	perspective_camera1.p.t.set([5, 5, 5]);
	// add orbit_controls
	const events1 = perspective_camera1.createNode('events');
	const orbits_controls = events1.createNode('camera_orbit_controls');
	perspective_camera1.p.controls.set(orbits_controls.full_path());

	// EXPORT
	const nodes = [subdivide];
	const html_nodes = {subdivide};
	const camera = perspective_camera1;
	return {scene, camera, nodes, html_nodes};
}
