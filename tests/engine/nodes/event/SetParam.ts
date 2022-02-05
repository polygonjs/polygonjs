import {SceneJsonExporter} from '../../../../src/engine/io/json/export/Scene';
import {SceneJsonImporter} from '../../../../src/engine/io/json/import/Scene';
import {SwitchSopNode} from '../../../../src/engine/nodes/sop/Switch';
import {CoreSleep} from '../../../../src/core/Sleep';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {GlConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Gl';
import {ParamType} from '../../../../src/engine/poly/ParamType';

QUnit.test('event/setParam simple', async (assert) => {
	const geo1 = window.geo1;
	const scene = window.scene;

	const box1 = geo1.createNode('box');
	const sphere1 = geo1.createNode('sphere');
	const switch1 = geo1.createNode('switch');
	switch1.setInput(0, box1);
	switch1.setInput(1, sphere1);

	await scene.waitForCooksCompleted();

	switch1.p.input.set(0);
	let container = await switch1.compute();
	assert.equal(container.pointsCount(), 24);

	const events1 = scene.root().createNode('eventsNetwork');
	const set_param1 = events1.createNode('setParam');
	set_param1.p.param.set(switch1.p.input.path());
	await set_param1.p.param.compute();
	set_param1.p.number.set(1);

	// manual trigger
	await set_param1.p.execute.pressButton();
	await CoreSleep.sleep(100);
	assert.equal(switch1.pv.input, 1, 'switch input is set to 1');
	container = await switch1.compute();
	assert.equal(container.pointsCount(), 961);

	set_param1.p.number.set(0);
	await set_param1.p.execute.pressButton();
	await CoreSleep.sleep(100);
	assert.equal(switch1.pv.input, 0, 'switch input is set to 0');
	container = await switch1.compute();
	assert.equal(container.pointsCount(), 24);

	// then setup on scene load
	set_param1.p.number.set(1);
	switch1.p.input.set(0); // make sure to save with input as 0
	const scene1 = events1.createNode('scene');
	set_param1.setInput(0, scene1, 0);

	const data = new SceneJsonExporter(scene).data();
	const scene2 = await SceneJsonImporter.loadData(data);
	await scene2.waitForCooksCompleted();

	await CoreSleep.sleep(100);

	const switch2 = scene2.node(switch1.path()) as SwitchSopNode;
	assert.equal(switch2.pv.input, 1);
});

QUnit.test(
	'event/setParam finds a param again when node owning it is deleted and one with same name is recreated',
	async (assert) => {
		const geo1 = window.geo1;

		const box1 = geo1.createNode('box');
		const transform1 = geo1.createNode('transform');
		transform1.setInput(0, box1);

		const eventsNetwork1 = geo1.createNode('eventsNetwork');
		const setParam1 = eventsNetwork1.createNode('setParam');

		setParam1.p.param.setParam(transform1.p.scale);
		assert.equal(setParam1.pv.param.path(), '/geo1/transform1/scale', 'param paths match');
		assert.deepEqual(setParam1.pv.param.param(), transform1.p.scale, 'params match');

		geo1.removeNode(transform1);
		assert.notOk(setParam1.pv.param.param(), 'ref is lost');

		const transform2 = geo1.createNode('transform');
		transform2.setInput(0, box1);
		assert.equal(transform2.name(), 'transform1');
		assert.equal(transform2.p.scale.path(), setParam1.pv.param.path());
		assert.deepEqual(setParam1.pv.param.param(), transform2.p.scale, 'params match again');
	}
);

QUnit.test(
	'event/setParam finds a material spare param again material deletes it then recreates it',
	async (assert) => {
		const {renderer} = await RendererUtils.waitForRenderer();

		const geo1 = window.geo1;
		const MAT = window.MAT;

		const meshBasicBuilder1 = MAT.createNode('meshBasicBuilder');
		meshBasicBuilder1.createNode('output');
		await meshBasicBuilder1.compute();
		assert.notOk(meshBasicBuilder1.params.has('myCustomParam'), 'no spare param yet');
		const paramGlNode1 = meshBasicBuilder1.createNode('param');
		paramGlNode1.setGlType(GlConnectionPointType.FLOAT);
		paramGlNode1.p.name.set('myCustomParam');
		await RendererUtils.compile(meshBasicBuilder1, renderer);
		assert.ok(meshBasicBuilder1.params.get('myCustomParam'), 'spare param has been created');
		const spareParam1 = meshBasicBuilder1.params.get('myCustomParam')!;
		assert.ok(spareParam1, 'spare param created');

		const eventsNetwork1 = geo1.createNode('eventsNetwork');
		const setParam1 = eventsNetwork1.createNode('setParam');

		setParam1.p.param.setParam(spareParam1);
		assert.equal(setParam1.pv.param.path(), '/MAT/meshBasicBuilder1/myCustomParam', 'param paths match');
		assert.deepEqual(setParam1.pv.param.param(), spareParam1, 'params match');

		// 1 - check the param is retrieved when changing name once and then back
		paramGlNode1.p.name.set('myCustomParam2');
		await RendererUtils.compile(meshBasicBuilder1, renderer);
		assert.notOk(meshBasicBuilder1.params.has('myCustomParam'));
		assert.ok(meshBasicBuilder1.params.has('myCustomParam2'));

		assert.notOk(setParam1.pv.param.param(), 'ref is lost');

		paramGlNode1.p.name.set('myCustomParam');
		await RendererUtils.compile(meshBasicBuilder1, renderer);
		assert.ok(meshBasicBuilder1.params.has('myCustomParam'));
		assert.notOk(meshBasicBuilder1.params.has('myCustomParam2'));
		const spareParam2 = meshBasicBuilder1.params.get('myCustomParam')!;
		assert.ok(spareParam2, 'spare param created');
		assert.deepEqual(setParam1.pv.param.param(), spareParam2, 'params match again');

		// 2 - check the param is retrieved when adding another param, which may trigger deletion of the first one

		const paramGlNode2 = meshBasicBuilder1.createNode('param');
		paramGlNode2.p.name.set('myCustomParam3');
		await RendererUtils.compile(meshBasicBuilder1, renderer);
		assert.ok(meshBasicBuilder1.params.get('myCustomParam'), 'spare param still present');
		assert.equal(meshBasicBuilder1.params.get('myCustomParam')?.type(), ParamType.FLOAT, 'spare param is a float');
		assert.ok(meshBasicBuilder1.params.get('myCustomParam3'), 'new spare param');
		assert.deepEqual(
			setParam1.pv.param.param()?.graphNodeId(),
			meshBasicBuilder1.params.get('myCustomParam')?.graphNodeId(),
			'params still match'
		);

		// 3 - check the param is retrieved when changing its type
		paramGlNode1.setGlType(GlConnectionPointType.VEC3);
		await RendererUtils.compile(meshBasicBuilder1, renderer);
		assert.ok(meshBasicBuilder1.params.get('myCustomParam'), 'spare param still present');
		assert.equal(meshBasicBuilder1.params.get('myCustomParam')?.type(), ParamType.VECTOR3, 'spare param is a vec3');
		assert.deepEqual(
			setParam1.pv.param.param()?.graphNodeId(),
			meshBasicBuilder1.params.get('myCustomParam')?.graphNodeId(),
			'params still match'
		);

		RendererUtils.dispose();
	}
);
