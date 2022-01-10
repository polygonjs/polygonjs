import {TransformSopNode} from '../../../../src/engine/nodes/sop/Transform';
import {saveAndLoadScene} from '../../../helpers/ImportHelper';

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
	assert.equal(box1.p.size.value, 1);

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
	assert.equal(box1.p.size.value, 1);

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

	await saveAndLoadScene(window.scene, async (scene2) => {
		await scene2.waitForCooksCompleted();

		const geo2 = scene2.root().nodesByType('geo')[0];
		const box2 = geo2.nodesByType('box')[0];
		assert.equal(box2.p.size.value, 3);

		geo2.p.t.y.set(-5);
		await box2.p.size.compute();
		assert.equal(box2.p.size.value, 5);
	});
});

QUnit.test('expression ch can find dependency again when node is deleted', async (assert) => {
	const geo1 = window.geo1;

	const box1a = geo1.createNode('box');
	const box1b = geo1.createNode('box');
	const transform1a = geo1.createNode('transform');
	const transform1b = geo1.createNode('transform');
	transform1a.setInput(0, box1a);
	transform1b.setInput(0, box1b);

	const ry1 = transform1b.p.r.y;
	ry1.set(`90*ch('../${transform1a.name()}/ty')`);
	assert.equal(ry1.rawInput(), `90*ch('../transform1/ty')`);
	await ry1.compute();
	assert.equal(ry1.value, 0);

	transform1a.p.t.y.set(1);
	await ry1.compute();
	assert.equal(ry1.value, 90);

	// renaming node renames the expression
	transform1a.setName('transform_ref');
	assert.equal(transform1a.name(), 'transform_ref');
	assert.equal(ry1.rawInput(), `90 * ch('../transform_ref/ty')`);

	// node still has effect after removal
	transform1a.p.t.y.set(2);
	await ry1.compute();
	assert.equal(ry1.value, 180);

	// moving the deleted node has no effect on the ch expression
	geo1.removeNode(transform1a);
	transform1a.p.t.y.set(10);
	await ry1.compute();
	assert.equal(
		ry1.states.error.message(),
		`expression returns an invalid type (undefined) (90 * ch('../transform_ref/ty'))`
	);
	assert.equal(ry1.value, 0, 'node has been removed and should have no effect');

	// moving the new one has effect
	const transform1c = geo1.createNode('transform');
	transform1c.setName('transform_ref');
	assert.equal(transform1c.name(), 'transform_ref');
	transform1c.p.t.y.set(10);
	await ry1.compute();

	assert.equal(ry1.value, 900, 'new node has now effect');

	await saveAndLoadScene(window.scene, async (scene2) => {
		await scene2.waitForCooksCompleted();
		const transform2c = scene2.node(transform1c.path()) as TransformSopNode;
		const transform2b = scene2.node(transform1b.path()) as TransformSopNode;
		const ry2 = transform2b.p.r.y;
		await ry2.compute();
		assert.equal(ry2.value, 900);

		transform2c.p.t.y.set(-5);
		await ry2.compute();
		assert.equal(ry2.value, -5 * 90, 'ok after save/load');
	});
});

QUnit.test(
	'expression ch can find dependency again when node is deleted without rename needed if same name',
	async (assert) => {
		const geo1 = window.geo1;

		const box1a = geo1.createNode('box');
		const box1b = geo1.createNode('box');
		const transform1a = geo1.createNode('transform');
		assert.equal(transform1a.name(), 'transform1');
		const transform1b = geo1.createNode('transform');
		transform1a.setInput(0, box1a);
		transform1b.setInput(0, box1b);

		const ry1 = transform1b.p.r.y;
		ry1.set(`90*ch('../${transform1a.name()}/ty')`);
		assert.equal(ry1.rawInput(), `90*ch('../transform1/ty')`);
		await ry1.compute();
		assert.equal(ry1.value, 0);

		transform1a.p.t.y.set(1);
		await ry1.compute();
		assert.equal(ry1.value, 90);

		// node still has effect after removal
		transform1a.p.t.y.set(2);
		await ry1.compute();
		assert.equal(ry1.value, 180);

		// moving the deleted node has no effect on the ch expression
		geo1.removeNode(transform1a);
		transform1a.p.t.y.set(10);
		await ry1.compute();
		assert.equal(
			ry1.states.error.message(),
			`expression returns an invalid type (undefined) (90*ch('../transform1/ty'))`
		);
		assert.equal(ry1.value, 0, 'node has been removed and should have no effect');

		// moving the new one has effect
		const transform1c = geo1.createNode('transform');
		assert.equal(transform1a.name(), 'transform1');
		transform1c.p.t.y.set(10);
		await ry1.compute();
		assert.equal(ry1.value, 900, 'new node has now effect');

		await saveAndLoadScene(window.scene, async (scene2) => {
			await scene2.waitForCooksCompleted();
			const transform2c = scene2.node(transform1c.path()) as TransformSopNode;
			const transform2b = scene2.node(transform1b.path()) as TransformSopNode;
			const ry2 = transform2b.p.r.y;
			await ry2.compute();
			assert.equal(ry2.value, 900);

			transform2c.p.t.y.set(-5);
			await ry2.compute();
			assert.equal(ry2.value, -5 * 90, 'ok after save/load');
		});
	}
);

QUnit.test('expression ch works with an expression as argument', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;

	const transform1 = geo1.createNode('transform');
	const transform2 = geo1.createNode('transform');
	const sphere = geo1.createNode('sphere');
	assert.equal(transform1.name(), 'transform1');
	assert.equal(transform2.name(), 'transform2');
	transform1.p.t.y.set(45);
	transform2.p.t.y.set(90);

	const radius = sphere.p.radius;
	radius.set(`ch('../transform'+(1+$F%2)+'/ty')`);

	await radius.compute();
	assert.equal(radius.value, 45);

	scene.setFrame(1);
	await radius.compute();
	assert.equal(radius.value, 90);

	scene.setFrame(2);
	await radius.compute();
	assert.equal(radius.value, 45);

	scene.setFrame(3);
	await radius.compute();
	assert.equal(radius.value, 90);
});
