import {PolyScene} from '../../../../src/engine/scene/PolyScene';

export function SopAttribCreate() {
	// create a scene
	const scene = new PolyScene();

	const geo = scene.root.createNode('geo');
	// create a line
	const line = geo.createNode('line');
	line.p.points_count.set(50);

	// add an attribute 'amp'
	// which we can later use in a noise SOP
	// by giving an expression to set its value
	// the amp value will be:
	// - 0 for the first point
	// - 1 for the last point
	// - and a smooth gradient in between
	const attrib_create = geo.createNode('attribCreate');
	attrib_create.setInput(0, line);
	attrib_create.p.name.set('amp');
	attrib_create.p.value1.set('@ptnum / (points_count(0)-1)');

	// create a noise SOP
	const noise = geo.createNode('noise');
	noise.setInput(0, attrib_create);
	noise.p.tamplitude_attrib.set(true);
	// init with a non-zero offset to better see the noise
	noise.p.offset.set([4.3, 0, 0]);
	noise.p.use_rest_attributes.set(false);
	noise.p.compute_normals.set(false);

	// add a material to see the line
	const materials = scene.root.createNode('materials');
	const line_basic = materials.createNode('lineBasic');
	line_basic.p.color.set([0, 0, 1]);
	// assign the material
	const material = geo.createNode('material');
	material.setInput(0, noise);
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
	const nodes = [attrib_create];
	const camera = perspective_camera1;
	const html_nodes = {noise, attrib_create};
	return {scene, camera, nodes, html_nodes};
}
