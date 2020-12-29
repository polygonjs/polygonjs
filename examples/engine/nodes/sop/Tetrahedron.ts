import {PolyScene} from '../../../../src/engine/scene/PolyScene';

export function SopTetrahedron() {
	// create a scene
	const scene = new PolyScene();

	// create a box
	const geo = scene.root.createNode('geo');
	const tetrahedron = geo.createNode('tetrahedron');
	tetrahedron.p.radius;
	tetrahedron.p.center;
	tetrahedron.p.detail;
	tetrahedron.p.points_only;

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
	const nodes = [tetrahedron];
	const htmlNodes = {tetrahedron};
	const camera = perspectiveCamera1;
	return {scene, camera, nodes, htmlNodes};
}
