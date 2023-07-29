import type {QUnit} from '../../../helpers/QUnit';
import {Mesh} from 'three';
import {CoreSleep} from '../../../../src/core/Sleep';
import {TransformTargetType} from '../../../../src/core/Transform';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {ParamType} from '../../../../src/engine/poly/ParamType';
import {RendererUtils} from '../../../helpers/RendererUtils';
export function testenginenodesjsGetSibbling(qUnit: QUnit) {

qUnit.test('js/GetSibbling', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;

	const geo1 = window.geo1;
	const sphere1 = geo1.createNode('sphere');
	const actor1 = geo1.createNode('actor');

	sphere1.p.radius.set(0.5);
	actor1.setInput(0, sphere1);

	function _createSibblingObject(x: number) {
		const boxLines = geo1.createNode('boxLines');
		const transform1 = geo1.createNode('transform');

		transform1.setInput(0, boxLines);
		transform1.setApplyOn(TransformTargetType.OBJECT);
		transform1.p.t.x.set(x);

		return transform1;
	}
	const transform0 = _createSibblingObject(-1);
	const transform2 = _createSibblingObject(2);
	const transform3 = _createSibblingObject(3);

	const merge1 = geo1.createNode('merge');
	merge1.setInput(0, transform0);
	merge1.setInput(1, actor1);
	merge1.setInput(2, transform2);
	merge1.setInput(3, transform3);
	merge1.flags.display.set(true);

	const onTick1 = actor1.createNode('onTick');
	const setObjectPosition1 = actor1.createNode('setObjectPosition');
	const getObjectProperty1 = actor1.createNode('getObjectProperty');
	const getSibbling1 = actor1.createNode('getSibbling');
	const param1 = actor1.createNode('param');

	param1.setJsType(JsConnectionPointType.INT);
	param1.p.name.set('offset');

	getObjectProperty1.setInput(0, getSibbling1);
	getSibbling1.setInput('offset', param1);

	setObjectPosition1.setInput(JsConnectionPointType.TRIGGER, onTick1);
	setObjectPosition1.setInput('position', getObjectProperty1, 'position');

	const container = await merge1.compute();
	const object = container.coreContent()!.threejsObjects()[1] as Mesh;

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(150);
	const offsetParam = actor1.params.get('offset')!;
	assert.ok(offsetParam);
	assert.equal(offsetParam.type(), ParamType.INTEGER);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		scene.play();
		assert.equal(scene.time(), 0);
		assert.equal(object.position.y, 0);
		await CoreSleep.sleep(500);
		assert.in_delta(scene.time(), 0.5, 0.25, 'time is 0.5 sec');
		assert.equal(object.position.x, 0, 'object still at 0');

		offsetParam.set(-1);
		await CoreSleep.sleep(100);
		assert.equal(object.position.x, -1, 'object moved to -1');

		offsetParam.set(1);
		await CoreSleep.sleep(100);
		assert.equal(object.position.x, 2, 'object moved to 2');

		offsetParam.set(2);
		await CoreSleep.sleep(100);
		assert.equal(object.position.x, 3, 'object moved to 3');

		offsetParam.set(3);
		await CoreSleep.sleep(100);
		assert.equal(object.position.x, -1, 'object moved to -1');

		// out of bound index
		offsetParam.set(4);
		await CoreSleep.sleep(100);
		assert.equal(object.position.x, -1, 'object not moved as this queries itself');

		// out of bound index
		offsetParam.set(5);
		await CoreSleep.sleep(100);
		assert.equal(object.position.x, 2, 'object moved to 2');

		offsetParam.set(1);
		await CoreSleep.sleep(100);
		assert.equal(object.position.x, 2, 'object moved to 2');

		// negative index
		offsetParam.set(-1);
		await CoreSleep.sleep(100);
		assert.equal(object.position.x, -1, 'object moved to -1');

		// negative index
		offsetParam.set(-2);
		await CoreSleep.sleep(100);
		assert.equal(object.position.x, 3, 'object moved to 3');
	});
});

}