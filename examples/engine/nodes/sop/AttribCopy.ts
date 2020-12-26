import {PolyScene} from '../../../../src/engine/scene/PolyScene';

export function SopAttribCopy() {
	// create a scene
	const scene = new PolyScene();

	const geo = scene.root.createNode('geo');
	// create a sphere
	const sphere = geo.createNode('sphere');
	sphere.p.radius.set(0.5);
	sphere.p.center.set([0.5, 0.5, 0]);

	// copy the uv to the position
	const attrib_copy = geo.createNode('attribCopy');
	attrib_copy.setInput(0, sphere);
	attrib_copy.p.name.set('uv');
	attrib_copy.p.tnew_name.set(true);
	attrib_copy.p.new_name.set('position');

	// flatten the resulting geo
	const transform = geo.createNode('transform');
	transform.setInput(0, attrib_copy);
	transform.p.t.z.set(0);

	// create a blend node to blend from the sphere and its uv projected version
	const blend = geo.createNode('blend');
	blend.setInput(0, sphere);
	blend.setInput(1, transform);
	blend.flags.display.set(true);

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
	const nodes = [attrib_copy];
	const camera = perspective_camera1;
	const html_nodes = {blend};
	return {scene, camera, nodes, html_nodes};
}
