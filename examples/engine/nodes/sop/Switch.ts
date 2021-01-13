import {PolyScene} from '../../../../src/engine/scene/PolyScene';

export function SopSwitch() {
	// create a scene
	const scene = new PolyScene();
	const root = scene.root();

	// create objects
	const geo = root.createNode('geo');
	const sphere = geo.createNode('sphere');
	const box = geo.createNode('box');
	const tube = geo.createNode('tube');

	// create a switch
	const switch1 = geo.createNode('switch');
	switch1.setInput(0, sphere);
	switch1.setInput(1, box);
	switch1.setInput(2, tube);

	// create a copy node to instanciate
	// the result of the switch to the points
	// of a plane
	const plane = geo.createNode('plane');
	const attribCreate = geo.createNode('attribCreate');
	const copy = geo.createNode('copy');
	plane.p.size.set([4, 4]);
	copy.setInput(0, switch1);
	copy.setInput(1, attribCreate);
	attribCreate.setInput(0, plane);
	// with a pscale attribute we can vary the scale of the instances
	attribCreate.p.name.set('pscale');
	// this expression will give a random value for each point
	attribCreate.p.value1.set('rand(@ptnum)');
	copy.flags.display.set(true);

	// add a light
	root.createNode('hemisphereLight');

	// create a camera
	const perspectiveCamera1 = root.createNode('perspectiveCamera');
	perspectiveCamera1.p.t.set([5, 5, 5]);
	// add orbitControls
	const events1 = perspectiveCamera1.createNode('events');
	const orbitsControls = events1.createNode('cameraOrbitControls');
	perspectiveCamera1.p.controls.setNode(orbitsControls);

	// EXPORT
	const nodes = [switch1];
	const htmlNodes = {switch1};
	const camera = perspectiveCamera1;
	return {scene, camera, nodes, htmlNodes};
}
