import {PolyScene} from '../../../../src/engine/scene/PolyScene';

export function SopBlend() {
	// create a scene
	const scene = new PolyScene();
	const root = scene.root();

	// create a box and a sphere
	const geo = root.createNode('geo');
	const box = geo.createNode('box');
	const sphere = geo.createNode('sphere');
	sphere.p.resolution.set([50, 50]);

	// use a transform ray SOP to snap the points of the sphere to the box
	const transform = geo.createNode('transform');
	const ray = geo.createNode('ray');
	transform.setInput(0, sphere);
	transform.p.scale.set(0.2);
	ray.setInput(0, transform);
	ray.setInput(1, box);

	// create a blend,
	// to blend between the sphere and its projected version
	const blend = geo.createNode('blend');
	blend.setInput(0, sphere);
	blend.setInput(1, ray);
	blend.flags.display.set(true);

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
	const nodes = [blend];
	const htmlNodes = {blend};
	const camera = perspectiveCamera1;
	return {scene, camera, nodes, htmlNodes};
}
