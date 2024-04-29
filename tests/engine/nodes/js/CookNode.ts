import type {QUnit} from '../../../helpers/QUnit';
import {Mesh} from 'three';
import {CoreSleep} from '../../../../src/core/Sleep';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {FloatParam} from '../../../../src/engine/index_all';
import {triggerPointerdownInMiddle} from '../../../helpers/EventsHelper';
export function testenginenodesjsCookNode(qUnit: QUnit) {
	qUnit.test('js/cookNode', async (assert) => {
		const scene = window.scene;
		const perspective_camera1 = window.perspective_camera1;
		const geo1 = window.geo1;

		const box1 = geo1.createNode('box');
		const sphere1 = geo1.createNode('sphere');
		const switch1 = geo1.createNode('switch');
		const null1 = geo1.createNode('null');

		null1.setInput(0, switch1);
		switch1.setInput(0, box1);
		switch1.setInput(1, sphere1);

		const emptyObject1 = geo1.createNode('emptyObject');
		const actor1 = geo1.createNode('actor');
		actor1.setInput(0, emptyObject1);

		actor1.flags.display.set(true);
		actor1.io.inputs.overrideClonedState(true);

		const onPointerdown1 = actor1.createNode('onPointerdown');
		const getNode1 = actor1.createNode('getNode');
		const cookNode1 = actor1.createNode('cookNode');
		const getGeometryNodeObjects1 = actor1.createNode('getGeometryNodeObjects');
		const arrayElement1 = actor1.createNode('arrayElement');
		const onTick1 = actor1.createNode('onTick');
		const multAdd1 = actor1.createNode('multAdd');
		const floatToInt1 = actor1.createNode('floatToInt');
		const createObjects1 = actor1.createNode('createObjects');

		createObjects1.setInput(JsConnectionPointType.TRIGGER, getGeometryNodeObjects1);
		createObjects1.setInput('child', arrayElement1);
		arrayElement1.setInput(0, getGeometryNodeObjects1, JsConnectionPointType.OBJECT_3D_ARRAY);
		arrayElement1.setInput(1, floatToInt1);
		floatToInt1.setInput(0, multAdd1);
		multAdd1.setInput(0, onTick1, 1);
		getGeometryNodeObjects1.setInput(JsConnectionPointType.TRIGGER, cookNode1);
		getGeometryNodeObjects1.setInput(JsConnectionPointType.NODE, getNode1);
		cookNode1.setInput(JsConnectionPointType.TRIGGER, onPointerdown1);
		cookNode1.setInput(JsConnectionPointType.NODE, getNode1);

		(multAdd1.params.get('mult') as FloatParam).set(0);
		getNode1.p.Node.setNode(null1);

		const nullContainer = await null1.compute();
		const nullObject = nullContainer.coreContent()!.threejsObjects()[0] as Mesh;
		assert.equal(nullObject.children.length, 0);

		const container = await actor1.compute();
		const object = container.coreContent()!.threejsObjects()[0] as Mesh;

		// wait to make sure objects are mounted to the scene
		await CoreSleep.sleep(150);

		await RendererUtils.withViewer({cameraNode: perspective_camera1}, async ({viewer}) => {
			scene.play();
			const canvas = viewer.canvas();

			assert.equal(object.children.length, 0);

			triggerPointerdownInMiddle(canvas);
			await CoreSleep.sleep(200);
			assert.equal(object.children.length, 1);
			assert.equal(object.children.map((o) => o.name).join(','), ['box1']);

			switch1.p.input.set(1);
			triggerPointerdownInMiddle(canvas);
			await CoreSleep.sleep(200);
			assert.equal(object.children.length, 2);
			assert.equal(object.children.map((o) => o.name).join(','), ['box1', 'sphere1']);

			triggerPointerdownInMiddle(canvas);
			await CoreSleep.sleep(200);
			assert.equal(object.children.length, 3);
			assert.equal(object.children.map((o) => o.name).join(','), ['box1', 'sphere1', 'sphere1']);

			switch1.p.input.set(0);
			triggerPointerdownInMiddle(canvas);
			await CoreSleep.sleep(200);
			assert.equal(object.children.length, 4);
			assert.equal(object.children.map((o) => o.name).join(','), ['box1', 'sphere1', 'sphere1', 'box1']);
		});
	});
}
