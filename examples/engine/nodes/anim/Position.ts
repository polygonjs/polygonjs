import {PolyScene} from '../../../../src/engine/scene/PolyScene';

export function AnimPosition() {
	// create a scene
	const scene = new PolyScene();

	// create a objects to animate
	const geo = scene.root.createNode('geo');
	const rounded_box = geo.createNode('rounded_box');
	const object_properties = geo.createNode('object_properties');
	const plane = geo.createNode('plane');
	const copy = geo.createNode('copy');
	object_properties.set_input(0, rounded_box);
	copy.set_input(0, object_properties);
	copy.set_input(1, plane);

	rounded_box.p.size.set(0.8);
	plane.p.size.set([3, 3]);
	object_properties.p.tname.set(true);
	object_properties.p.name.set('anim_target');

	// resets the transform of the objects
	// to ensure that their pivot is at the center of the box
	const transform_reset = geo.createNode('transform_reset');
	transform_reset.set_input(0, copy);
	transform_reset.p.mode.set(2);
	transform_reset.flags.display.set(true);

	// setup the animation
	const animations = scene.root.createNode('animations');
	// set the target of the animation.
	// In this case, we target all objects of the THREE scene graph
	// which care called "anim_target" (which is how we call them with the object_properties above)
	const target = animations.createNode('target');
	target.p.object_mask.set('anim_target');
	target.p.update_matrix.set(1);
	// set the name of the property updated by the animation.
	// In this case, we will update the Y axis of the rotation
	const property_name = animations.createNode('property_name');
	property_name.set_input(0, target);
	property_name.p.name.set('rotation.y');
	// set the name of the property value we will animate to
	const property_value = animations.createNode('property_value');
	property_value.set_input(0, property_name);
	property_value.p.size.set(1);
	property_value.p.value1.set(0.5 * Math.PI);
	// sets the duration
	const duration = animations.createNode('duration');
	duration.set_input(0, property_value);
	duration.p.duration.set(0.5);
	// sets the operation, in this case we will add to the value
	// everytime the animation plays
	const operation = animations.createNode('operation');
	operation.set_input(0, duration);
	operation.p.operation.set(1);
	// add an easing
	const easing = animations.createNode('easing');
	easing.set_input(0, operation);
	// and sets the position of each animation
	// as the default would be that they play one after the other.
	// But while we want some delay, we want to adjust it.
	const position = animations.createNode('position');
	position.set_input(0, easing);
	position.p.offset.set(0.02);
	// finally we add add a null node, to give us a button to start and pause the animation
	const null1 = animations.createNode('null');
	null1.set_input(0, position);

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
	const nodes = [null1];
	const html_nodes = {duration, position, null1};
	const camera = perspective_camera1;
	return {scene, camera, nodes, html_nodes};
}
