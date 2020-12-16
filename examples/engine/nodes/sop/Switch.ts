import {PolyScene} from '../../../../src/engine/scene/PolyScene';

export function SopSwitch() {
	// create a scene
	const scene = new PolyScene();

	// create objects
	const geo = scene.root.createNode('geo');
	const sphere = geo.createNode('sphere');
	const box = geo.createNode('box');
	const tube = geo.createNode('tube');

	// create a switch
	const switch1 = geo.createNode('switch');
	switch1.set_input(0, sphere);
	switch1.set_input(1, box);
	switch1.set_input(2, tube);

	// create a copy node to instanciate
	// the result of the switch to the points
	// of a plane
	const plane = geo.createNode('plane');
	const attrib_create = geo.createNode('attrib_create');
	const copy = geo.createNode('copy');
	plane.p.size.set([4, 4]);
	copy.set_input(0, switch1);
	copy.set_input(1, attrib_create);
	attrib_create.set_input(0, plane);
	// with a pscale attribute we can vary the scale of the instances
	attrib_create.p.name.set('pscale');
	// this expression will give a random value for each point
	attrib_create.p.value1.set('rand(@ptnum)');
	copy.flags.display.set(true);

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
	const nodes = [switch1];
	const html_nodes = {switch1};
	const camera = perspective_camera1;
	return {scene, camera, nodes, html_nodes};
}
