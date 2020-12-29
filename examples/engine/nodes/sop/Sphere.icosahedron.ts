import {PolyScene} from '../../../../src/engine/scene/PolyScene';

export function SopSphereIcosahedron() {
	// create a scene
	const scene = new PolyScene();

	// create a sphere
	const geo = scene.root.createNode('geo');
	const sphere = geo.createNode('sphere');
	sphere.p.type.set(1);

	// add a light
	scene.root.createNode('hemisphereLight');

	// create a camera
	const perspectiveCamera1 = scene.root.createNode('perspectiveCamera');
	perspectiveCamera1.p.t.set([5, 5, 5]);
	// add orbitControls
	const events1 = perspectiveCamera1.createNode('events');
	const orbitsControls = events1.createNode('cameraOrbitControls');
	perspectiveCamera1.p.controls.set(orbitsControls.fullPath());

	// EXPORT
	const nodes = [sphere];
	const htmlNodes = {sphere};
	const camera = perspectiveCamera1;
	return {scene, camera, nodes, htmlNodes};
}
