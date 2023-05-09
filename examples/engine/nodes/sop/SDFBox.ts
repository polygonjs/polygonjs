// import {PolyScene} from '../../../../src/engine/scene/PolyScene';

// export function SopSDFBox() {
// 	// create a scene
// 	const scene = new PolyScene();
// 	const root = scene.root();

// 	// create a file node
// 	const geo = root.createNode('geo');
// 	const SDFBox1 = geo.createNode('SDFBox');
// 	SDFBox1.flags.display.set(true);

// 	// add a light
// 	root.createNode('hemisphereLight');

// 	// create a camera
// 	const perspectiveCamera1 = root.createNode('perspectiveCamera');
// 	perspectiveCamera1.p.t.set([5, 5, 5]);
// 	// add orbitControls
// 	const events1 = perspectiveCamera1.createNode('eventsNetwork');
// 	const orbitsControls = events1.createNode('cameraOrbitControls');
// 	perspectiveCamera1.p.controls.setNode(orbitsControls);

// 	// EXPORT
// 	const nodes = [SDFBox1];
// 	const camera = perspectiveCamera1;
// 	return {scene, camera, nodes};
// }
