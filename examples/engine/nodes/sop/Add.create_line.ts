import {PolyScene} from '../../../../src/engine/scene/PolyScene';

export function SopAdd_createLine() {
	// create a scene
	const scene = new PolyScene();
	const root = scene.root();

	const geo = root.createNode('geo');
	// create a first add node, that generates multiple points
	const add = geo.createNode('add');
	add.p.pointsCount.set(10);
	// plug it into a jitter node, to move those points around
	const jitter = geo.createNode('jitter');
	jitter.setInput(0, add);

	// and create the add node that will connect those points
	const add2 = geo.createNode('add');
	add2.setInput(0, jitter);
	add2.p.createPoint.set(false);
	add2.p.connectInputPoints.set(true);

	// let's add a material so we can actually see the line
	const materials = root.createNode('materialsNetwork');
	const lineBasic = materials.createNode('lineBasic');
	lineBasic.p.color.set([0, 0, 1]);
	// assign the material
	const material = geo.createNode('material');
	material.setInput(0, add2);
	material.p.material.setNode(lineBasic);
	material.flags.display.set(true);

	// create a camera
	const perspectiveCamera1 = root.createNode('perspectiveCamera');
	perspectiveCamera1.p.t.set([5, 5, 5]);
	// add orbitControls
	const events1 = perspectiveCamera1.createNode('eventsNetwork');
	const orbitsControls = events1.createNode('cameraOrbitControls');
	perspectiveCamera1.p.controls.setNode(orbitsControls);

	// EXPORT
	const nodes = [add2];
	const camera = perspectiveCamera1;
	return {scene, camera, nodes};
}
