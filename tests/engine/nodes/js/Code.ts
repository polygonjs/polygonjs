import {CoreSleep} from '../../../../src/core/Sleep';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('js/code simple', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, box1);
	actor1.flags.display.set(true);

	const onTick1 = actor1.createNode('onTick');
	const code1 = actor1.createNode('code');

	code1.setInput(JsConnectionPointType.TRIGGER, onTick1);

	const container = await actor1.compute();
	const object = container.coreContent()!.threejsObjects()[0];

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		scene.play();
		assert.equal(scene.time(), 0);
		assert.equal(object.position.y, 0);
		await CoreSleep.sleep(500);
		assert.in_delta(scene.time(), 0.5, 0.25, 'time is half second');
		assert.in_delta(object.position.y, 27, 6, 'pos is 27');
		await CoreSleep.sleep(500);
		assert.in_delta(scene.time(), 1, 0.25, 'time is one sec');
		assert.in_delta(object.position.y, 54, 10, 'pos is 54');
	});
});

QUnit.test('js/code modified with new input', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, box1);
	actor1.flags.display.set(true);
	actor1.io.inputs.overrideClonedState(true);

	const onTick1 = actor1.createNode('onTick');
	const code1 = actor1.createNode('code');

	const JS = `
	export class CodeJsProcessor extends BaseCodeJsProcessor {
		 initializeProcessor(){
			this.io.inputs.setNamedInputConnectionPoints([
				new JsConnectionPoint('myBoolParam', JsConnectionPointType.BOOLEAN),
			]);
		}
		 setTriggerableLines(controller) {
			const object3D = this.inputObject3D(this, controller);
			const myBoolParam = this.variableForInput(controller, 'myBoolParam');
	
			const bodyLines = [
				object3D + '.position.y = ' + myBoolParam + '? 1 : 0',
				object3D + '.updateMatrix()'
			];
			this.addTriggerableLines(controller, bodyLines);
		}
	}
`;
	code1.p.codeJavascript.set(JS);
	code1.setInput(JsConnectionPointType.TRIGGER, onTick1);
	const constant1 = actor1.createNode('constant');
	constant1.setJsType(JsConnectionPointType.BOOLEAN);
	constant1.p.boolean.set(0);
	code1.setInput('myBoolParam', constant1);

	const setObjectRotation1 = actor1.createNode('setObjectRotation');
	setObjectRotation1.p.rotation.set([0, 0.5 * Math.PI, 0]);
	setObjectRotation1.setInput(JsConnectionPointType.TRIGGER, code1);

	const container = await actor1.compute();
	const object = container.coreContent()!.threejsObjects()[0];

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		scene.play();
		assert.equal(scene.time(), 0);
		assert.equal(object.position.y, 0);
		await CoreSleep.sleep(500);
		assert.in_delta(scene.time(), 0.5, 0.25, 'time is half second');
		assert.equal(object.position.y, 0);
		assert.in_delta(object.quaternion.y, 0.707, 0.01);
		assert.in_delta(object.rotation.y, 0.5 * Math.PI, 0.01);
		constant1.p.boolean.set(1);
		await CoreSleep.sleep(500);
		assert.in_delta(scene.time(), 1, 0.25, 'time is one sec');
		assert.equal(object.position.y, 1);
	});
});
