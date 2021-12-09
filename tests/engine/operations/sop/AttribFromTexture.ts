import {PointSopNode} from '../../../../src/engine/nodes/sop/Point';
import {PolyScene} from '../../../../src/engine/scene/PolyScene';
import {saveAndLoadScene} from '../../../helpers/ImportHelper';

function prepareCOP(scene: PolyScene) {
	const cop = scene.root().createNode('copNetwork');
	const image = cop.createNode('image');
	return image;
}

QUnit.test('operation/sop/attribFromTexture with float - optimized', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;

	const image = prepareCOP(window.scene);

	const plane = geo1.createNode('plane');
	plane.p.stepSize.set(0.02);

	const attribFromTexture = geo1.createNode('attribFromTexture');
	attribFromTexture.setInput(0, plane);
	attribFromTexture.p.attrib.set('height');
	attribFromTexture.p.attribSize.set(1);
	attribFromTexture.p.texture.setNode(image);
	attribFromTexture.p.mult.set(0.002);

	const point = geo1.createNode('point');
	point.setInput(0, attribFromTexture);
	point.p.updateY.set(1);
	point.p.y.set('@P.y+@height');

	let container = await point.compute();
	let core_group = container.coreContent()!;
	let bbox = core_group.boundingBox();
	assert.in_delta(bbox.max.y, 0.5, 0.1);

	attribFromTexture.flags.optimize.set(true);

	await saveAndLoadScene(scene, async (scene2) => {
		await scene2.waitForCooksCompleted();
		const point2 = scene2.node(point.path()) as PointSopNode;
		await point2.compute();
		container = await point2.compute();
		core_group = container.coreContent()!;
		bbox = core_group.boundingBox();
		assert.in_delta(bbox.max.y, 0.5, 0.1);
	});
});

QUnit.test('operation/sop/attribFromTexture with vector - optimized', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;

	const image = prepareCOP(window.scene);

	const sphere = geo1.createNode('sphere');

	const attribFromTexture = geo1.createNode('attribFromTexture');
	attribFromTexture.setInput(0, sphere);
	attribFromTexture.p.attrib.set('offset');
	attribFromTexture.p.attribSize.set(3);
	attribFromTexture.p.texture.setNode(image);
	attribFromTexture.p.mult.set(0.002);

	const point = geo1.createNode('point');
	point.setInput(0, attribFromTexture);
	point.p.updateX.set(1);
	point.p.updateY.set(1);
	point.p.updateZ.set(1);
	point.p.x.set('@P.x + @offset.x');
	point.p.y.set('@P.y + @offset.y');
	point.p.z.set('@P.z + @offset.z');

	let container = await point.compute();
	let core_group = container.coreContent()!;
	let bbox = core_group.boundingBox();
	assert.in_delta(bbox.max.y, 1.4, 0.1);
	assert.in_delta(bbox.min.y, -1, 0.1);

	attribFromTexture.flags.optimize.set(true);

	await saveAndLoadScene(scene, async (scene2) => {
		const point2 = scene2.node(point.path()) as PointSopNode;
		await point2.compute();
		container = await point2.compute();
		core_group = container.coreContent()!;
		bbox = core_group.boundingBox();
		assert.in_delta(bbox.max.y, 1.4, 0.1);
		assert.in_delta(bbox.min.y, -1, 0.1);
	});
});
