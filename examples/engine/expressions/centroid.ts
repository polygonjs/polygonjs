import {PolyScene} from '../../../src/engine/scene/PolyScene';

export function ExpressionCentroid() {
	// create a scene
	const scene = new PolyScene();
	const root = scene.root();

	// create a box and a sphere
	const geo = root.createNode('geo');
	const box = geo.createNode('box');
	const torus = geo.createNode('torus');
	const transform = geo.createNode('transform');
	const noise = geo.createNode('noise');
	const merge = geo.createNode('merge');

	noise.setInput(0, torus);
	transform.setInput(0, box);
	merge.setInput(0, noise);
	merge.setInput(1, transform);
	merge.flags.display.set(true);

	torus.p.radiusTube.set(0.1);
	torus.p.segmentsRadial.set(10);
	torus.p.segmentsTube.set(30);

	noise.p.amplitude.set(0.7);
	noise.p.freq.set([0.3, 0.3, 0.3]);
	noise.p.offset.y.set('$T');

	box.p.size.set(0.25);

	transform.p.t.x.set(`centroid('../${noise.name()}').x`);
	transform.p.t.z.set(`centroid('../${noise.name()}').z`);

	// add a light
	root.createNode('hemisphereLight');

	// create a camera
	const perspectiveCamera1 = root.createNode('perspectiveCamera');
	perspectiveCamera1.p.t.set([5, 5, 5]);
	// add orbitControls
	const events1 = perspectiveCamera1.createNode('eventsNetwork');
	const orbitsControls = events1.createNode('cameraOrbitControls');
	perspectiveCamera1.p.controls.setNode(orbitsControls);

	// play
	scene.play();

	// EXPORT
	const nodes = [torus];
	const htmlNodes = {box};
	const camera = perspectiveCamera1;
	return {scene, camera, nodes, htmlNodes};
}
