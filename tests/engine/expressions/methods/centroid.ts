import {Box3} from 'three/src/math/Box3';
import {SceneJsonImporter} from '../../../../src/engine/io/json/import/Scene';
import {SceneJsonExporter} from '../../../../src/engine/io/json/export/Scene';
import {TextSopNode} from '../../../../src/engine/nodes/sop/Text';
import {TransformSopNode} from '../../../../src/engine/nodes/sop/Transform';

QUnit.test('expression centroid works with path', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const transform1 = geo1.createNode('transform');
	transform1.setInput(0, box1);
	transform1.p.t.x.set(3);
	transform1.p.t.y.set(5);
	transform1.p.t.z.set(-10);
	transform1.p.scale.set(3);

	const transform2 = geo1.createNode('transform');
	transform2.setInput(0, transform1);

	const box2 = geo1.createNode('box');

	box2.p.size.set("centroid('../transform1', 'x')");
	await box2.p.size.compute();
	assert.equal(box2.p.size.value, 3);

	box2.p.size.set("centroid('../transform1', 'y')");
	await box2.p.size.compute();
	assert.equal(box2.p.size.value, 5);

	box2.p.size.set("centroid('../transform1', 'z')");
	await box2.p.size.compute();
	assert.equal(box2.p.size.value, -10);

	transform1.p.t.x.set(4);
	transform2.p.t.x.set('-$CEX');
	await transform2.p.t.x.compute();
	assert.equal(transform2.p.t.x.value, -4);

	transform2.p.t.x.set('-$CEY');
	await transform2.p.t.x.compute();
	assert.equal(transform2.p.t.x.value, -5);

	transform2.p.t.x.set('-$CEZ');
	await transform2.p.t.x.compute();
	assert.equal(transform2.p.t.x.value, 10);
});

QUnit.test('using $CEX on a node without inputs fails correctly', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');

	box1.p.size.set('$CEX');
	await box1.p.size.compute();
	assert.equal(box1.p.size.value, 1);
	assert.equal(box1.p.size.states.error.message(), 'expression error: "$CEX" (invalid input (0))');
});

QUnit.test('expression centroid with input index still build dependency after scene load', async (assert) => {
	const geo1 = window.geo1;

	const text = geo1.createNode('text');
	const transform = geo1.createNode('transform');
	text.p.text.set('HA');
	transform.setInput(0, text);
	transform.flags.display.set(true);

	function bboxCenterX(bbox: Box3) {
		const min = bbox.min.clone();
		const max = bbox.max.clone();
		return (min.x + max.x) * 0.5;
	}

	let container = await transform.compute();
	let core_group = container.coreContent()!;
	let bbox = core_group.boundingBox();
	assert.in_delta(bboxCenterX(bbox), 1, 0.1);
	assert.in_delta(bbox.min.x, 0.1, 0.1);
	assert.in_delta(bbox.max.x, 1.8, 0.1);

	transform.p.t.x.set('-centroid(0).x');
	container = await transform.compute();
	core_group = container.coreContent()!;
	bbox = core_group.boundingBox();
	assert.equal(bboxCenterX(bbox), 0);
	assert.in_delta(bbox.min.x, -0.84, 0.1);
	assert.in_delta(bbox.max.x, 0.84, 0.1);

	const scene = window.scene;
	const data = new SceneJsonExporter(scene).data();

	console.log('************ LOAD **************');
	const scene2 = await SceneJsonImporter.loadData(data);
	await scene2.waitForCooksCompleted();

	const text2 = scene2.node(text.path()) as TextSopNode;
	const transform2 = scene2.node(transform.path()) as TransformSopNode;
	container = await transform2.compute();
	core_group = container.coreContent()!;
	bbox = core_group.boundingBox();
	assert.equal(bboxCenterX(bbox), 0);
	assert.in_delta(bbox.min.x, -0.84, 0.1);
	assert.in_delta(bbox.max.x, 0.84, 0.1);

	// make a longer word
	// and make sure that the transform still updates accordingly
	text2.p.text.set('This is a much much longer word to test that transform updates');
	container = await transform2.compute();
	core_group = container.coreContent()!;
	bbox = core_group.boundingBox();
	assert.equal(bboxCenterX(bbox), 0);
	assert.in_delta(bbox.min.x, -18.9, 1);
	assert.in_delta(bbox.max.x, 18.9, 1);
});
