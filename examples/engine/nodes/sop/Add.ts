import {PolyScene} from '../../../../src/engine/scene/PolyScene';

export function SopAdd() {
	// create a scene
	const scene = new PolyScene();

	// create an add node
	const geo = scene.root.createNode('geo');
	const add = geo.createNode('add');

	// let's add a material so we can actually see the point
	const materials = scene.root.createNode('materials');
	const points = materials.createNode('points');
	points.p.color.set([0, 0, 1]);
	// assign the material
	const material = geo.createNode('material');
	material.set_input(0, add);
	material.p.material.set(points.full_path());
	material.flags.display.set(true);

	// create a camera
	const perspective_camera1 = scene.root.createNode('perspective_camera');
	perspective_camera1.p.t.set([5, 5, 5]);
	// add orbit_controls
	const events1 = perspective_camera1.createNode('events');
	const orbits_controls = events1.createNode('camera_orbit_controls');
	perspective_camera1.p.controls.set(orbits_controls.full_path());

	// EXPORT
	const nodes = [add];
	const camera = perspective_camera1;
	return {scene, camera, nodes};
}
