import {PolyScene} from '../../../../src/engine/scene/PolyScene';

export function AnimPosition() {
	// create a scene
	const scene = new PolyScene();
	const root = scene.root();

	// create a objects to animate
	const geo = root.createNode('geo');
	const roundedBox = geo.createNode('roundedBox');
	const objectProperties = geo.createNode('objectProperties');
	const plane = geo.createNode('plane');
	const copy = geo.createNode('copy');
	objectProperties.setInput(0, roundedBox);
	copy.setInput(0, objectProperties);
	copy.setInput(1, plane);

	roundedBox.p.sizes.set([0.8, 0.8, 0.8]);
	plane.p.size.set([3, 3]);
	objectProperties.p.tname.set(true);
	objectProperties.p.name.set('animTarget');
	copy.flags.display.set(true);

	// setup the animation
	const animations = root.createNode('animationsNetwork');
	// set the target of the animation.
	// In this case, we target all objects of the THREE scene graph
	// which care called "anim_target" (which is how we call them with the objectProperties above)
	const target = animations.createNode('target');
	target.p.objectMask.set('*animTarget');
	target.p.updateMatrix.set(1);
	// set the name of the property updated by the animation.
	// In this case, we will update the Y axis of the rotation
	const propertyName = animations.createNode('propertyName');
	propertyName.setInput(0, target);
	propertyName.p.name.set('rotation.z');
	// set the name of the property value we will animate to
	const propertyValue = animations.createNode('propertyValue');
	propertyValue.setInput(0, propertyName);
	propertyValue.p.size.set(1);
	propertyValue.p.value1.set(0.5 * Math.PI);
	// sets the duration
	const duration = animations.createNode('duration');
	duration.setInput(0, propertyValue);
	duration.p.duration.set(0.5);
	// sets the operation, in this case we will add to the value
	// everytime the animation plays
	const operation = animations.createNode('operation');
	operation.setInput(0, duration);
	operation.p.operation.set(1);
	// add an easing
	const easing = animations.createNode('easing');
	easing.setInput(0, operation);
	// and sets the position of each animation
	// as the default would be that they play one after the other.
	// But while we want some delay, we want to adjust it.
	const position = animations.createNode('position');
	position.setInput(0, easing);
	position.p.offset.set(0.02);
	// finally we add add a null node, to give us a button to start and pause the animation
	const null1 = animations.createNode('null');
	null1.setInput(0, position);

	// add a light
	root.createNode('hemisphereLight');

	// create a camera
	const perspectiveCamera1 = root.createNode('perspectiveCamera');
	perspectiveCamera1.p.t.set([5, 5, 5]);
	// add orbitControls
	const events1 = perspectiveCamera1.createNode('eventsNetwork');
	const orbitsControls = events1.createNode('cameraOrbitControls');
	perspectiveCamera1.p.controls.setNode(orbitsControls);

	// EXPORT
	const nodes = [null1];
	const htmlNodes = {duration, position, null1};
	const camera = perspectiveCamera1;
	return {scene, camera, nodes, htmlNodes};
}
