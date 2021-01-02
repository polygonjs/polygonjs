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
	const attribCopy = geo.createNode('attribCopy');
	attribCopy.setInput(0, sphere);
	attribCopy.p.name.set('uv');
	attribCopy.p.tnewName.set(true);
	attribCopy.p.newName.set('position');

	// flatten the resulting geo
	const transform = geo.createNode('transform');
	transform.setInput(0, attribCopy);
	transform.p.t.z.set(0);

	// create a blend node to blend from the sphere and its uv projected version
	const blend = geo.createNode('blend');
	blend.setInput(0, sphere);
	blend.setInput(1, transform);
	blend.flags.display.set(true);

	// add a light
	scene.root.createNode('hemisphereLight');

	// create a camera
	const perspectiveCamera1 = scene.root.createNode('perspectiveCamera');
	perspectiveCamera1.p.t.set([5, 5, 5]);
	// add orbitControls
	const events1 = perspectiveCamera1.createNode('events');
	const orbitsControls = events1.createNode('cameraOrbitControls');
	perspectiveCamera1.p.controls.setNode(orbitsControls);

	// EXPORT
	const nodes = [attribCopy];
	const camera = perspectiveCamera1;
	const htmlNodes = {blend};
	return {scene, camera, nodes, htmlNodes};
}
