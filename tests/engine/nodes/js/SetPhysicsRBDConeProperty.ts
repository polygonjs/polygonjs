import type {QUnit} from '../../../helpers/QUnit';
import {CoreSleep} from '../../../../src/core/Sleep';
import {PhysicsWorldSopNode} from '../../../../src/engine/nodes/sop/PhysicsWorld';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {PhysicsRBDColliderType, PhysicsRBDType} from '../../../../src/core/physics/PhysicsAttribute';
import {PhysicsRBDRadiusAttribute} from '../../../../src/core/physics/PhysicsAttribute';
import {MultAddInput} from '../../../../src/engine/nodes/js/MultAdd';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {_getPhysicsRBDConeRadius} from '../../../../src/core/physics/shapes/RBDCone';
import { RBDCommonProperty } from '../../../../src/core/physics/shapes/_CommonHeightRadius';
export function testenginenodesjsSetPhysicsRBDConeProperty(qUnit: QUnit) {

function createPhysicsWorldNodes(node: PhysicsWorldSopNode) {
	// const physicsWorldReset = node.createNode('physicsWorldReset');
	// const onScenePlayState = node.createNode('onScenePlayState');
	const physicsWorldStepSimulation = node.createNode('physicsWorldStepSimulation');
	const onTick = node.createNode('onTick');

	// physicsWorldReset.setInput(0, onScenePlayState, OnScenePlayStateActorNode.INPUT_NAME_PAUSE);
	physicsWorldStepSimulation.setInput(0, onTick);
}

qUnit.test('js/setPhysicsRBDConeProperty simple', async (assert) => {
	const scene = window.scene;
	const geo1 = window.geo1;
	const cameraNode = window.perspective_camera1;
	cameraNode.p.t.z.set(5);

	const cone1 = geo1.createNode('cone');
	const physicsRBDAttributes1 = geo1.createNode('physicsRBDAttributes');
	const physicsWorld1 = geo1.createNode('physicsWorld');
	const actor1 = geo1.createNode('actor');

	physicsRBDAttributes1.setInput(0, cone1);
	physicsRBDAttributes1.setRBDType(PhysicsRBDType.DYNAMIC);
	physicsRBDAttributes1.setColliderType(PhysicsRBDColliderType.CONE);
	actor1.setInput(0, physicsRBDAttributes1);
	physicsWorld1.setInput(0, actor1);
	physicsWorld1.flags.display.set(true);

	createPhysicsWorldNodes(physicsWorld1);
	const getPhysicsRBDConeProperty1 = actor1.createNode('getPhysicsRBDConeProperty');
	const setPhysicsRBDConeProperty1 = actor1.createNode('setPhysicsRBDConeProperty');
	const onManualTrigger1 = actor1.createNode('onManualTrigger');
	const getObjectAttribute1 = actor1.createNode('getObjectAttribute');
	const multAdd1 = actor1.createNode('multAdd');
	setPhysicsRBDConeProperty1.setInput(0, onManualTrigger1);
	getObjectAttribute1.setAttribName(PhysicsRBDRadiusAttribute.RADIUS);
	getObjectAttribute1.setAttribType(JsConnectionPointType.FLOAT);

	const container = await physicsWorld1.compute();
	const object = container.coreContent()!.threejsObjects()[0].children[0];
	assert.in_delta(object.position.y, 0, 0.01);
	await RendererUtils.withViewer({cameraNode}, async ({viewer, element}) => {
		scene.play();
		await CoreSleep.sleep(100);
		assert.less_than(object.position.y, -0.01, 'object has gone down');

		//
		setPhysicsRBDConeProperty1.p.radius.set(2);
		await CoreSleep.sleep(50);
		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(50);
		assert.equal(_getPhysicsRBDConeRadius(object), 2);

		//
		scene.batchUpdates(() => {
			setPhysicsRBDConeProperty1.p.radius.set(4);
			setPhysicsRBDConeProperty1.p.lerp.set(0.5);
		});
		await CoreSleep.sleep(50);
		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(50);
		assert.equal(_getPhysicsRBDConeRadius(object), 3, 'with lerp=0.5');

		//
		scene.batchUpdates(() => {
			setPhysicsRBDConeProperty1.setInput(setPhysicsRBDConeProperty1.p.radius.name(), multAdd1);
			setPhysicsRBDConeProperty1.p.lerp.set(1);
			multAdd1.setInput(
				MultAddInput.VALUE,
				getPhysicsRBDConeProperty1,
				RBDCommonProperty.RADIUS
			);
			multAdd1.params.get('mult')!.set(2);
		});
		await CoreSleep.sleep(50);
		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(50);
		assert.equal(_getPhysicsRBDConeRadius(object), 6, 'radius x2');

		//
		setPhysicsRBDConeProperty1.setInput(setPhysicsRBDConeProperty1.p.radius.name(), getObjectAttribute1);
		await CoreSleep.sleep(50);
		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(50);
		assert.in_delta(_getPhysicsRBDConeRadius(object) || 0, 1, 0.01, 'back to original attrib value');
	});
});

}