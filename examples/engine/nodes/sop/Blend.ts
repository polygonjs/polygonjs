import {PolyScene} from '../../../../src/engine/scene/PolyScene';

export function SopBlend() {
	// create a scene
	const scene = new PolyScene();
	const root = scene.root();

	// create a box and a sphere
	const geo = root.createNode('geo');
	const box = geo.createNode('box');
	const sphere = geo.createNode('sphere');
	box.p.size.set(1);
	box.p.divisions.set([10, 10, 10]);

	// use a normals SOP to have the normals pointing outwards like a sphere
	const normals = geo.createNode('normals');
	normals.setInput(0, box);
	normals.p.edit.set(true);
	normals.p.updateX.set(true);
	normals.p.updateY.set(true);
	normals.p.updateZ.set(true);
	normals.p.x.set('@P.x');
	normals.p.y.set('@P.y');
	normals.p.z.set('@P.z');

	// use a transform ray SOP to snap the points of the sphere to the box
	const ray = geo.createNode('ray');
	ray.setInput(0, normals);
	ray.setInput(1, sphere);

	// create a blend,
	// to blend between the sphere and its projected version
	const blend = geo.createNode('blend');
	blend.setInput(0, box);
	blend.setInput(1, ray);
	blend.flags.display.set(true);

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
	const nodes = [blend];
	const htmlNodes = {blend};
	const camera = perspectiveCamera1;
	return {scene, camera, nodes, htmlNodes};
}
