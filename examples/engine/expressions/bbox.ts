import {PolyScene} from '../../../src/engine/scene/PolyScene';

export function ExpressionBbox() {
	// create a scene
	const scene = new PolyScene();
	const root = scene.root();

	// create a box and a sphere
	const geo = root.createNode('geo');
	const sphere = geo.createNode('sphere');
	const box = geo.createNode('box');
	const torus = geo.createNode('torus');
	const merge1 = geo.createNode('merge');
	const merge2 = geo.createNode('merge');

	merge1.setInput(0, sphere);
	merge1.setInput(1, box);
	box.p.center.x.set(3);

	merge2.setInput(0, merge1);
	merge2.setInput(1, torus);
	merge2.flags.display.set(true);

	torus.p.radius.set(`bbox('../${merge1.name()}').max.x`);
	torus.p.radiusTube.set(0.15);
	torus.p.segmentsRadial.set(5);
	torus.p.segmentsTube.set(60);
	torus.p.direction.set([0, 0, 1]);

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
	const nodes = [torus];
	const htmlNodes = {box};
	const camera = perspectiveCamera1;
	return {scene, camera, nodes, htmlNodes};
}
