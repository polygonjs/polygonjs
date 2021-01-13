import {PolyScene} from '../../../../src/engine/scene/PolyScene';

export function SopAdd() {
	// create a scene
	const scene = new PolyScene();
	const root = scene.root();

	// create an add node
	const geo = root.createNode('geo');
	const add = geo.createNode('add');

	// let's add a material so we can actually see the point
	const materials = root.createNode('materials');
	const points = materials.createNode('points');
	points.p.color.set([0, 0, 1]);
	// assign the material
	const material = geo.createNode('material');
	material.setInput(0, add);
	material.p.material.setNode(points);
	material.flags.display.set(true);

	// create a camera
	const perspectiveCamera1 = root.createNode('perspectiveCamera');
	perspectiveCamera1.p.t.set([5, 5, 5]);
	// add orbitControls
	const events1 = perspectiveCamera1.createNode('events');
	const orbitsControls = events1.createNode('cameraOrbitControls');
	perspectiveCamera1.p.controls.setNode(orbitsControls);

	// EXPORT
	const nodes = [add];
	const camera = perspectiveCamera1;
	return {scene, camera, nodes};
}
