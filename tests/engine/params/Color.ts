import {ParamType} from '../../../src/engine/poly/ParamType';
import {ColorConversion} from '../../../src/core/Color';
import {SceneJsonExporter} from '../../../src/engine/io/json/export/Scene';
import {SceneJsonImporter} from '../../../src/engine/io/json/import/Scene';
import {ColorSopNode} from '../../../src/engine/nodes/sop/Color';
import {ColorParam} from '../../../src/engine/params/Color';

QUnit.test('color eval correctly when set to different values', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;

	const color = geo1.addParam(ParamType.COLOR, 'color_debug', [1, 1, 1], {spare: true})!;
	assert.deepEqual(color.value.toArray(), [1, 1, 1]);

	color.r.set(0);
	assert.deepEqual(color.value.toArray(), [0, 1, 1]);

	color.g.set(0.5);
	assert.deepEqual(color.value.toArray(), [0, 0.5, 1]);

	color.b.set(0.7);
	assert.deepEqual(color.value.toArray(), [0, 0.5, 0.7]);

	await scene.waitForCooksCompleted();

	color.r.set('5*2');
	assert.ok(color.r.isDirty());
	assert.ok(color.isDirty());
	assert.ok(color.r.hasExpression());
	assert.ok(color.hasExpression());
	await color.compute();
	assert.notOk(color.r.isDirty(), 'red is dirty');
	assert.notOk(color.isDirty(), 'color is dirty');
	assert.deepEqual(color.r.value, 10, 'value is 10');
	assert.deepEqual(color.value.toArray(), [10, 0.5, 0.7], 'red is 10');
});

QUnit.test('color is_default', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;
	scene.timeController.setMaxFrame(10);
	scene.setFrame(1);

	const color = geo1.addParam(ParamType.COLOR, 'color_debug', [1, 1, '$F'], {spare: true})!;
	await color.compute();
	assert.ok(color.isDefault());
	assert.deepEqual(color.value.toArray(), [1, 1, 1]);
	assert.equal(color.defaultValueSerialized().join(':'), '1:1:$F');

	scene.setFrame(2);
	await color.compute();
	assert.ok(color.isDefault());
	assert.deepEqual(color.value.toArray(), [1, 1, 2]);
	assert.equal(color.defaultValueSerialized().join(':'), '1:1:$F');

	color.b.set(3);
	assert.ok(!color.isDefault());
	assert.deepEqual(color.value.toArray(), [1, 1, 3]);
	assert.equal(color.defaultValueSerialized().join(':'), '1:1:$F');
});

QUnit.test(
	'color conversion option can be changed and this is preserved on scene save/load for a normal param',
	async (assert) => {
		const scene = window.scene;
		const geo1 = window.geo1;
		const color1 = geo1.createNode('color');
		const param1 = color1.p.color;

		assert.ok(param1.options.colorConversion() == null);
		param1.options.setOption('conversion', ColorConversion.LINEAR_TO_GAMMA);
		assert.ok(param1.options.colorConversion());
		assert.ok(param1.options.hasOptionsOverridden());

		const data = new SceneJsonExporter(scene).data();
		// console.log('************ LOAD **************');
		const scene2 = await SceneJsonImporter.loadData(data);
		await scene2.waitForCooksCompleted();
		const color2 = scene2.node(color1.path()) as ColorSopNode;
		const param2 = color2.p.color;
		assert.equal(param2.options.colorConversion(), ColorConversion.LINEAR_TO_GAMMA);
	}
);

QUnit.test(
	'color conversion option can be changed and this is preserved on scene save/load for a spare param',
	async (assert) => {
		const scene = window.scene;
		const geo1 = window.geo1;
		const color1 = geo1.createNode('color');
		const param1 = color1.addParam(ParamType.COLOR, 'color2', [0, 0, 0], {spare: true})!;
		color1.params.postCreateSpareParams();

		assert.ok(param1.options.colorConversion() == null);
		param1.options.setOption('conversion', ColorConversion.LINEAR_TO_GAMMA);
		assert.ok(param1.options.colorConversion());
		assert.ok(param1.options.hasOptionsOverridden());

		const data = new SceneJsonExporter(scene).data();
		// console.log('************ LOAD **************');
		const scene2 = await SceneJsonImporter.loadData(data);
		await scene2.waitForCooksCompleted();
		const color2 = scene2.node(color1.path()) as ColorSopNode;
		const param2 = color2.params.get('color2')! as ColorParam;
		assert.equal(param2.options.colorConversion(), ColorConversion.LINEAR_TO_GAMMA);
	}
);
