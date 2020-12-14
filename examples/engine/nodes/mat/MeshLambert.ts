import {PolyScene} from '../../../../src/engine/scene/PolyScene';

export function MatMeshLambert() {
	// create a scene
	const scene = new PolyScene();

	// create a few objects
	const geo = scene.root.createNode('geo');
	const sphere = geo.createNode('sphere');
	sphere.p.center.x.set(-2);
	const box = geo.createNode('box');
	box.p.center.x.set(2);
	const torus = geo.createNode('torus');
	torus.p.center.z.set(-2);
	const torus_knot = geo.createNode('torus_knot');
	torus_knot.p.center.z.set(2);

	// merge the geometries
	const merge = geo.createNode('merge');
	merge.set_input(0, sphere);
	merge.set_input(1, box);
	merge.set_input(2, torus);
	merge.set_input(3, torus_knot);

	// create the material
	const materials = scene.root.createNode('materials');
	const mesh_basic = materials.createNode('mesh_lambert');
	mesh_basic.p.color.set([0, 0.5, 1]);

	// assign the material
	const material = geo.createNode('material');
	material.set_input(0, merge);
	material.p.material.set(mesh_basic.full_path());
	// set the display flag on the material node
	material.flags.display.set(true);

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
	const nodes = [sphere];
	const camera = perspective_camera1;
	return {scene, camera, nodes};
}
