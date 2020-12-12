import {SceneJsonExporter} from '../../../../src/engine/io/json/export/Scene';
import {SceneJsonImporter} from '../../../../src/engine/io/json/import/Scene';

QUnit.test('expression ch works in relative', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const box2 = geo1.createNode('box');

	box1.p.size.set(2);
	box2.p.size.set("ch('../box1/size')");

	await box2.p.size.compute();
	assert.equal(box2.p.size.value, 2);

	box1.p.size.set(3);
	await box2.p.size.compute();
	assert.equal(box2.p.size.value, 3);

	box1.p.size.set('3+2');
	await box2.p.size.compute();
	assert.equal(box2.p.size.value, 5);
});

QUnit.test('expression ch works in absolute', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');
	const box2 = geo1.createNode('box');

	box1.p.size.set(2);
	box2.p.size.set("ch('/geo1/box1/size')");

	await box2.p.size.compute();
	assert.equal(box2.p.size.value, 2);

	box1.p.size.set(3);
	await box2.p.size.compute();
	assert.equal(box2.p.size.value, 3);

	box1.p.size.set('3+2');
	await box2.p.size.compute();
	assert.equal(box2.p.size.value, 5);
});

QUnit.test('expression ch can be resolved if no node exist at first with absolute path', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');

	box1.p.size.set("ch('/geo1/box2/size')");
	await box1.p.size.compute();
	assert.equal(box1.p.size.value, 0);

	// create box2 after setting the expression
	const box2 = geo1.createNode('box');
	await box1.p.size.compute();
	assert.equal(box1.p.size.value, 1);

	box2.p.size.set(3);
	await box1.p.size.compute();
	assert.equal(box1.p.size.value, 3);
});

QUnit.test('expression ch can be resolved if no node exist at first with relative path', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');

	box1.p.size.set("ch('../box2/size')");
	await box1.p.size.compute();
	assert.equal(box1.p.size.value, 0);

	// create box2 after setting the expression
	const box2 = geo1.createNode('box');
	await box1.p.size.compute();
	assert.equal(box1.p.size.value, 1);

	box2.p.size.set(3);
	await box1.p.size.compute();
	assert.equal(box1.p.size.value, 3);
});

QUnit.test('expression ch can be resolved if on scene load', async (assert) => {
	const geo1 = window.geo1;

	const box1 = geo1.createNode('box');

	box1.p.size.set("-ch('../ty')");
	await box1.p.size.compute();
	assert.equal(box1.p.size.value, 0);

	geo1.p.t.y.set(-3);
	await box1.p.size.compute();
	assert.equal(box1.p.size.value, 3);

	const scene = window.scene;
	const data = new SceneJsonExporter(scene).data();
	console.log('************ LOAD **************');
	const scene2 = await SceneJsonImporter.load_data(data);
	await scene2.wait_for_cooks_completed();

	const geo2 = scene2.root.nodes_by_type('geo')[0];
	const box2 = geo2.nodes_by_type('box')[0];
	assert.equal(box2.p.size.value, 3);

	geo2.p.t.y.set(-5);
	await box2.p.size.compute();
	assert.equal(box2.p.size.value, 5);
});
