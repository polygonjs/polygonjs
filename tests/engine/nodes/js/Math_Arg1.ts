import type {QUnit} from '../../../helpers/QUnit';
import {CoreSleep} from '../../../../src/core/Sleep';
import {AbsJsNode} from '../../../../src/engine/nodes/js/Abs';
import {AcosJsNode} from '../../../../src/engine/nodes/js/Acos';
import {AsinJsNode} from '../../../../src/engine/nodes/js/Asin';
import {AtanJsNode} from '../../../../src/engine/nodes/js/Atan';
import {CeilJsNode} from '../../../../src/engine/nodes/js/Ceil';
import {CosJsNode} from '../../../../src/engine/nodes/js/Cos';
import {FloorJsNode} from '../../../../src/engine/nodes/js/Floor';
import {RoundJsNode} from '../../../../src/engine/nodes/js/Round';
import {SignJsNode} from '../../../../src/engine/nodes/js/Sign';
import {SinJsNode} from '../../../../src/engine/nodes/js/Sin';
import {SqrtJsNode} from '../../../../src/engine/nodes/js/Sqrt';
import {TanJsNode} from '../../../../src/engine/nodes/js/Tan';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {RendererUtils} from '../../../helpers/RendererUtils';
export function testenginenodesjsMath_Arg1(qUnit: QUnit) {

qUnit.test('js/Math_Arg1 simple', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, box1);
	actor1.flags.display.set(true);
	actor1.io.inputs.overrideClonedState(true);

	const abs = actor1.createNode('abs');
	const acos = actor1.createNode('acos');
	const asin = actor1.createNode('asin');
	const atan = actor1.createNode('atan');
	const ceil = actor1.createNode('ceil');
	const cos = actor1.createNode('cos');
	const floor = actor1.createNode('floor');
	const round = actor1.createNode('round');
	const sign = actor1.createNode('sign');
	const sin = actor1.createNode('sin');
	const sqrt = actor1.createNode('sqrt');
	const tan = actor1.createNode('tan');
	const onTick = actor1.createNode('onTick');
	const setObjectPosition = actor1.createNode('setObjectPosition');
	const floatToVec3 = actor1.createNode('floatToVec3');
	const constant = actor1.createNode('constant');

	setObjectPosition.setInput(JsConnectionPointType.TRIGGER, onTick);
	setObjectPosition.setInput('position', floatToVec3);

	const container = await actor1.compute();
	const object = container.coreContent()!.threejsObjects()[0];

	async function useNode(
		node:
			| AbsJsNode
			| AcosJsNode
			| AsinJsNode
			| AtanJsNode
			| CeilJsNode
			| CosJsNode
			| FloorJsNode
			| RoundJsNode
			| SignJsNode
			| SinJsNode
			| SqrtJsNode
			| TanJsNode,
		inputValue: number,
		expectedValue: number
	) {
		node.setInput(0, constant);
		floatToVec3.setInput('y', node);
		constant.p.float.set(inputValue);
		await CoreSleep.sleep(50);
		assert.equal(object.position.y, expectedValue, node.path());
	}

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		scene.play();
		await CoreSleep.sleep(50);
		assert.equal(object.position.y, 0);

		await useNode(abs, -1, 1);
		await useNode(abs, -2, 2);
		await useNode(acos, 0, Math.PI * 0.5);
		await useNode(acos, 1, 0);
		await useNode(asin, 0, Math.asin(0));
		await useNode(asin, 1, Math.asin(1));
		await useNode(atan, 0, Math.atan(0));
		await useNode(atan, 1, Math.atan(1));
		await useNode(ceil, 0.7, 1);
		await useNode(ceil, 1.7, 2);
		await useNode(cos, 0.2, Math.cos(0.2));
		await useNode(floor, 0.2, 0);
		await useNode(floor, 1.2, 1);
		await useNode(round, 1.2, 1);
		await useNode(sign, 1.2, 1);
		await useNode(sign, -1.2, -1);
		await useNode(sin, 0, Math.sin(0));
		await useNode(sin, 1, Math.sin(1));
		await useNode(sqrt, 2, Math.sqrt(2));
		await useNode(tan, 0, Math.tan(0));
		await useNode(tan, 0.5, Math.tan(0.5));
	});
});

}