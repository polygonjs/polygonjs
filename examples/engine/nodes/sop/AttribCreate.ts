import {PolyScene} from '../../../../src/engine/scene/PolyScene';

export function SopAttribCreate() {
	// create a scene
	const scene = new PolyScene();

	const geo = scene.root.createNode('geo');
	// create a line
	const line = geo.createNode('line');
	line.p.pointsCount.set(50);

	// add an attribute 'amp'
	// which we can later use in a noise SOP
	// by giving an expression to set its value
	// the amp value will be:
	// - 0 for the first point
	// - 1 for the last point
	// - and a smooth gradient in between
	const attribCreate = geo.createNode('attribCreate');
	attribCreate.setInput(0, line);
	attribCreate.p.name.set('amp');
	attribCreate.p.value1.set('@ptnum / (points_count(0)-1)');

	// create a noise SOP
	const noise = geo.createNode('noise');
	noise.setInput(0, attribCreate);
	noise.p.tamplitudeAttrib.set(true);
	// init with a non-zero offset to better see the noise
	noise.p.offset.set([4.3, 0, 0]);
	noise.p.useRestAttributes.set(false);
	noise.p.computeNormals.set(false);

	// add a material to see the line
	const materials = scene.root.createNode('materials');
	const lineBasic = materials.createNode('lineBasic');
	lineBasic.p.color.set([0, 0, 1]);
	// assign the material
	const material = geo.createNode('material');
	material.setInput(0, noise);
	material.p.material.setNode(lineBasic);
	material.flags.display.set(true);

	// create a camera
	const perspectiveCamera1 = scene.root.createNode('perspectiveCamera');
	perspectiveCamera1.p.t.set([5, 5, 5]);
	// add orbitControls
	const events1 = perspectiveCamera1.createNode('events');
	const orbitsControls = events1.createNode('cameraOrbitControls');
	perspectiveCamera1.p.controls.setNode(orbitsControls);

	// EXPORT
	const nodes = [attribCreate];
	const camera = perspectiveCamera1;
	const htmlNodes = {noise, attribCreate};
	return {scene, camera, nodes, htmlNodes};
}
