import {PolyScene} from '../../../../src/engine/scene/PolyScene';

export function SopAttribAddMult() {
	// create a scene
	const scene = new PolyScene();

	// build a geometry that will use an attribute called 'height'
	const geo = scene.root.createNode('geo');
	const plane = geo.createNode('plane');
	plane.p.size.set([4, 4]);
	//let's increase the resolution of the plane
	plane.p.step_size.set(0.05);

	// create an attrib create
	const attrib_create = geo.createNode('attrib_create');
	attrib_create.set_input(0, plane);
	attrib_create.p.name.set('height');
	// here we set the attribute value with an expression
	// that depends on the z position of each point
	attrib_create.p.value1.set('sin(2*@P.z)');

	// create the attrib_add_mult
	const attrib_add_mult = geo.createNode('attrib_add_mult');
	attrib_add_mult.set_input(0, attrib_create);
	attrib_add_mult.p.name.set('height');
	attrib_add_mult.p.mult.set(0.5);

	// create a point SOP to use the height attribute to deform the plane
	const point = geo.createNode('point');
	point.set_input(0, attrib_add_mult);
	point.p.update_y.set(1);
	// by setting another expression,
	// we set the y position to equal the height attribute
	point.p.y.set('@height');
	point.flags.display.set(true);

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
	const nodes = [attrib_add_mult];
	const camera = perspective_camera1;
	return {scene, camera, nodes};
}
