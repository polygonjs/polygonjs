import {CoreSleep} from '../../../../src/core/Sleep';
import {AbsActorNode} from '../../../../src/engine/nodes/actor/Abs';
import {AcosActorNode} from '../../../../src/engine/nodes/actor/Acos';
import {AsinActorNode} from '../../../../src/engine/nodes/actor/Asin';
import {AtanActorNode} from '../../../../src/engine/nodes/actor/Atan';
import {CeilActorNode} from '../../../../src/engine/nodes/actor/Ceil';
import {CosActorNode} from '../../../../src/engine/nodes/actor/Cos';
import {FloorActorNode} from '../../../../src/engine/nodes/actor/Floor';
import {RoundActorNode} from '../../../../src/engine/nodes/actor/Round';
import {SignActorNode} from '../../../../src/engine/nodes/actor/Sign';
import {SinActorNode} from '../../../../src/engine/nodes/actor/Sin';
import {SqrtActorNode} from '../../../../src/engine/nodes/actor/Sqrt';
import {TanActorNode} from '../../../../src/engine/nodes/actor/Tan';
import {ActorConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Actor';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('actor/Math_Arg1 simple', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, box1);
	actor1.flags.display.set(true);

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

	setObjectPosition.setInput(ActorConnectionPointType.TRIGGER, onTick);
	setObjectPosition.setInput('position', floatToVec3);

	const container = await actor1.compute();
	const object = container.coreContent()!.threejsObjects()[0];

	async function useNode(
		node:
			| AbsActorNode
			| AcosActorNode
			| AsinActorNode
			| AtanActorNode
			| CeilActorNode
			| CosActorNode
			| FloorActorNode
			| RoundActorNode
			| SignActorNode
			| SinActorNode
			| SqrtActorNode
			| TanActorNode,
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
