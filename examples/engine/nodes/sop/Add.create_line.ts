import {PolyScene} from '../../../../src/engine/scene/PolyScene';

export function SopAdd_create_line() {
	// create a scene
	const scene = new PolyScene();

	const geo = scene.root.createNode('geo');
	// create a first add node, that generates multiple points
	const add = geo.createNode('add');
	add.p.points_count.set(10);
	// plug it into a jitter node, to move those points around
	const jitter = geo.createNode('jitter');
	jitter.setInput(0, add);

	// and create the add node that will connect those points
	const add2 = geo.createNode('add');
	add2.setInput(0, jitter);
	add2.p.create_point.set(false);
	add2.p.connect_input_points.set(true);

	// let's add a material so we can actually see the line
	const materials = scene.root.createNode('materials');
	const line_basic = materials.createNode('lineBasic');
	line_basic.p.color.set([0, 0, 1]);
	// assign the material
	const material = geo.createNode('material');
	material.setInput(0, add2);
	material.p.material.set(line_basic.fullPath());
	material.flags.display.set(true);

	// create a camera
	const perspective_camera1 = scene.root.createNode('perspectiveCamera');
	perspective_camera1.p.t.set([5, 5, 5]);
	// add orbit_controls
	const events1 = perspective_camera1.createNode('events');
	const orbits_controls = events1.createNode('cameraOrbitControls');
	perspective_camera1.p.controls.set(orbits_controls.fullPath());

	// EXPORT
	const nodes = [add2];
	const camera = perspective_camera1;
	return {scene, camera, nodes};
}
