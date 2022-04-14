import {CoreSleep} from '../../../../src/core/Sleep';
import {ActorConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Actor';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('actor/code simple', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, box1);
	actor1.flags.display.set(true);

	const onTick1 = actor1.createNode('onTick');
	const code1 = actor1.createNode('code');

	code1.setInput(ActorConnectionPointType.TRIGGER, onTick1);

	const container = await actor1.compute();
	const object = container.coreContent()!.objects()[0];

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		scene.play();
		assert.equal(scene.time(), 0);
		assert.equal(object.position.y, 0);
		await CoreSleep.sleep(500);
		assert.in_delta(scene.time(), 0.5, 0.25, 'time is half second');
		assert.in_delta(object.position.y, 27, 6);
		await CoreSleep.sleep(500);
		assert.in_delta(scene.time(), 1, 0.25, 'time is one sec');
		assert.in_delta(object.position.y, 54, 10);
	});
});

QUnit.test('actor/code modified with new input', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, box1);
	actor1.flags.display.set(true);

	const onTick1 = actor1.createNode('onTick');
	const code1 = actor1.createNode('code');

	const JS = `
export class CodeSopProcessor extends BaseCodeActorProcessor {
	initializeProcessor(){
		this.io.inputs.setNamedInputConnectionPoints([
			new ActorConnectionPoint('myBool2', ActorConnectionPointType.BOOLEAN),
		]);
	}
	receiveTrigger(context){
		const myBool2 = this._inputValue('myBool2', context);

		if(myBool2){
			this.runTrigger(context);
		}
	}
}
`;
	code1.p.codeJavascript.set(JS);
	code1.setInput(ActorConnectionPointType.TRIGGER, onTick1);
	const constant1 = actor1.createNode('constant');
	constant1.setConstantType(ActorConnectionPointType.BOOLEAN);
	constant1.p.boolean.set(0);
	code1.setInput('myBool2', constant1);

	const setObjectPosition1 = actor1.createNode('setObjectPosition');
	setObjectPosition1.p.position.set([0, 1, 0]);
	setObjectPosition1.setInput(ActorConnectionPointType.TRIGGER, code1);

	const container = await actor1.compute();
	const object = container.coreContent()!.objects()[0];

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		scene.play();
		assert.equal(scene.time(), 0);
		assert.equal(object.position.y, 0);
		await CoreSleep.sleep(500);
		assert.in_delta(scene.time(), 0.5, 0.25, 'time is half second');
		assert.equal(object.position.y, 0);
		constant1.p.boolean.set(1);
		await CoreSleep.sleep(500);
		assert.in_delta(scene.time(), 1, 0.25, 'time is one sec');
		assert.equal(object.position.y, 1);
	});
});
