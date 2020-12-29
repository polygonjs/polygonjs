import {PolyScene} from '../../../../src/engine/scene/PolyScene';

export function SopRoundedBox() {
	// create a scene
	const scene = new PolyScene();

	// create a box
	const geo = scene.root.createNode('geo');
	const roundedBox = geo.createNode('roundedBox');

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
	const nodes = [roundedBox];
	const htmlNodes = {roundedBox};
	const camera = perspectiveCamera1;
	return {scene, camera, nodes, htmlNodes};
}
