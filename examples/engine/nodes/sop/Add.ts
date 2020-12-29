import {PolyScene} from '../../../../src/engine/scene/PolyScene';

export function SopAdd() {
	// create a scene
	const scene = new PolyScene();

	// create an add node
	const geo = scene.root.createNode('geo');
	const add = geo.createNode('add');

	// let's add a material so we can actually see the point
	const materials = scene.root.createNode('materials');
	const points = materials.createNode('points');
	points.p.color.set([0, 0, 1]);
	// assign the material
	const material = geo.createNode('material');
	material.setInput(0, add);
	material.p.material.set(points.fullPath());
	material.flags.display.set(true);

	// create a camera
	const perspectiveCamera1 = scene.root.createNode('perspectiveCamera');
	perspectiveCamera1.p.t.set([5, 5, 5]);
	// add orbitControls
	const events1 = perspectiveCamera1.createNode('events');
	const orbitsControls = events1.createNode('cameraOrbitControls');
	perspectiveCamera1.p.controls.set(orbitsControls.fullPath());

	// EXPORT
	const nodes = [add];
	const camera = perspectiveCamera1;
	return {scene, camera, nodes};
}
