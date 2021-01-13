import {PolyScene} from '../../../../src/engine/scene/PolyScene';

export function SopTetrahedron() {
	// create a scene
	const scene = new PolyScene();
	const root = scene.root();

	// create a box
	const geo = root.createNode('geo');
	const tetrahedron = geo.createNode('tetrahedron');
	tetrahedron.p.radius.set(1);
	tetrahedron.p.center.set([0, 0, 0]);
	tetrahedron.p.detail.set(5);
	tetrahedron.p.pointsOnly.set(false);

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
	const nodes = [tetrahedron];
	const htmlNodes = {tetrahedron};
	const camera = perspectiveCamera1;
	return {scene, camera, nodes, htmlNodes};
}
