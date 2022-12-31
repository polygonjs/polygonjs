import {Number3} from './../../../src/types/GlobalTypes';
import {OnBeforeCompileDataHandler} from './../../../src/engine/nodes/gl/code/assemblers/materials/OnBeforeCompile';
import {MeshBasicBuilderMatNode} from './../../../src/engine/nodes/mat/MeshBasicBuilder';
import {ParamType} from '../../../src/engine/poly/ParamType';
import {ColorConversion} from '../../../src/core/Color';
import {SceneJsonExporter} from '../../../src/engine/io/json/export/Scene';
import {SceneJsonImporter} from '../../../src/engine/io/json/import/Scene';
import {ColorSopNode} from '../../../src/engine/nodes/sop/Color';
import {ColorParam} from '../../../src/engine/params/Color';
import {Color} from 'three';
import {GlConnectionPointType} from '../../../src/engine/nodes/utils/io/connections/Gl';
import {saveAndLoadScene} from '../../helpers/ImportHelper';

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

		assert.ok(param1.options.colorConversion() == ColorConversion.NONE);
		param1.options.setOption('conversion', ColorConversion.LINEAR_TO_SRGB);
		assert.ok(param1.options.colorConversion());
		assert.ok(param1.options.hasOptionsOverridden());

		const data = await new SceneJsonExporter(scene).data();
		// console.log('************ LOAD **************');
		const scene2 = await SceneJsonImporter.loadData(data);
		await scene2.waitForCooksCompleted();
		const color2 = scene2.node(color1.path()) as ColorSopNode;
		const param2 = color2.p.color;
		assert.equal(param2.options.colorConversion(), ColorConversion.LINEAR_TO_SRGB);
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

		assert.ok(param1.options.colorConversion() == ColorConversion.NONE);
		param1.options.setOption('conversion', ColorConversion.LINEAR_TO_SRGB);
		assert.ok(param1.options.colorConversion());
		assert.ok(param1.options.hasOptionsOverridden());

		const data = await new SceneJsonExporter(scene).data();
		// console.log('************ LOAD **************');
		const scene2 = await SceneJsonImporter.loadData(data);
		await scene2.waitForCooksCompleted();
		const color2 = scene2.node(color1.path()) as ColorSopNode;
		const param2 = color2.params.get('color2')! as ColorParam;
		assert.equal(param2.options.colorConversion(), ColorConversion.LINEAR_TO_SRGB);
	}
);

QUnit.test('params/color accepts a color', async (assert) => {
	const geo1 = window.geo1;
	const color1 = geo1.createNode('color');

	const color = color1.p.color;
	color.set(new Color(1, 2, 3));
	assert.deepEqual(color.value.toArray(), [1, 2, 3]);
});

QUnit.test('params/color colorConversion is saved and loaded correctly', async (assert) => {
	const scene = window.scene;
	const MAT = scene.createNode('materialsNetwork');
	const meshBasicBuilder1 = MAT.createNode('meshBasicBuilder');
	const constant1 = meshBasicBuilder1.createNode('constant');
	const output1 = meshBasicBuilder1.createNode('output');

	constant1.setGlType(GlConnectionPointType.VEC3);
	constant1.p.asColor.set(1);
	constant1.p.color.set([0.4, 0.6, 0.8]);
	output1.setInput('color', constant1);

	const lineStart = 'vec3 v_POLY_constant1_val = vec3(';
	async function declaredColor(matNode: MeshBasicBuilderMatNode): Promise<Number3> {
		const material = await matNode.material();
		const fragmentShader = OnBeforeCompileDataHandler.getData(material)!.fragmentShader;
		const lines = fragmentShader.split('\n');
		for (let line of lines) {
			if (line.includes(lineStart)) {
				const lineEnd = line.split(lineStart)[1];
				return lineEnd
					.replace(');', '')
					.split(',')
					.map((is) => parseFloat(is)) as Number3;
			}
		}
		return [-1, -1, -1];
	}

	assert.deepEqual(await declaredColor(meshBasicBuilder1), [0.4, 0.6, 0.8]);
	await saveAndLoadScene(scene, async (scene2) => {
		const meshBasicBuilder2 = scene2.node(meshBasicBuilder1.path()) as MeshBasicBuilderMatNode;
		assert.deepEqual(await declaredColor(meshBasicBuilder2), [0.4, 0.6, 0.8], 'new scene no conversion ok');
	});

	constant1.p.color.options.setOption('conversion', ColorConversion.LINEAR_TO_SRGB);
	constant1.p.color.setDirty();
	await constant1.p.color.compute();

	assert.deepEqual(
		await declaredColor(meshBasicBuilder1),
		[0.665189483970395, 0.7977406370381005, 0.9063331834449992]
	);
	await saveAndLoadScene(scene, async (scene2) => {
		const meshBasicBuilder2 = scene2.node(meshBasicBuilder1.path()) as MeshBasicBuilderMatNode;
		assert.deepEqual(
			await declaredColor(meshBasicBuilder2),
			[0.665189483970395, 0.7977406370381005, 0.9063331834449992],
			'new scene LINEAR_TO_SRGB ok'
		);
	});

	constant1.p.color.options.setOption('conversion', ColorConversion.SRGB_TO_LINEAR);
	constant1.p.color.setDirty();
	await constant1.p.color.compute();

	assert.deepEqual(
		await declaredColor(meshBasicBuilder1),
		[0.13286832154414627, 0.31854677811435356, 0.6038273388475408]
	);
	await saveAndLoadScene(scene, async (scene2) => {
		const meshBasicBuilder2 = scene2.node(meshBasicBuilder1.path()) as MeshBasicBuilderMatNode;
		assert.deepEqual(
			await declaredColor(meshBasicBuilder2),
			[0.13286832154414627, 0.31854677811435356, 0.6038273388475408],
			'new scene SRGB_TO_LINEAR ok'
		);
	});

	constant1.p.color.options.setOption('conversion', ColorConversion.NONE);
	constant1.p.color.setDirty();
	await constant1.p.color.compute();

	assert.deepEqual(await declaredColor(meshBasicBuilder1), [0.4, 0.6, 0.8]);
	await saveAndLoadScene(scene, async (scene2) => {
		const meshBasicBuilder2 = scene2.node(meshBasicBuilder1.path()) as MeshBasicBuilderMatNode;
		assert.deepEqual(await declaredColor(meshBasicBuilder2), [0.4, 0.6, 0.8], 'new scene no conversion ok');
	});
});
