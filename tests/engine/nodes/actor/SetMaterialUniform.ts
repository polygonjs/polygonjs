import {UNIFORM_PARAM_PREFIX} from '../../../../src/core/material/uniform';
import {CoreSleep} from '../../../../src/core/Sleep';
import {MaterialUserDataUniforms} from '../../../../src/engine/nodes/gl/code/assemblers/materials/OnBeforeCompile';
import {ActorConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Actor';
import {GlConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Gl';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('actor/setMaterialUniform', async (assert) => {
	const MAT = window.MAT;
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const material1 = geo1.createNode('material');
	const actor1 = geo1.createNode('actor');

	const meshBasicBuilder1 = MAT.createNode('meshBasicBuilder');
	const material = meshBasicBuilder1.material;

	const output1 = meshBasicBuilder1.createNode('output');
	const param1 = meshBasicBuilder1.createNode('param');
	param1.setGlType(GlConnectionPointType.VEC3);
	param1.p.name.set('myUniform');
	output1.setInput('color', param1);

	material1.p.material.setNode(meshBasicBuilder1);
	material1.setInput(0, box1);
	actor1.setInput(0, material1);
	actor1.flags.display.set(true);

	const onManualTrigger1 = actor1.createNode('onManualTrigger');
	const setMaterialUniform1 = actor1.createNode('setMaterialUniform');

	setMaterialUniform1.setInput(ActorConnectionPointType.TRIGGER, onManualTrigger1);
	setMaterialUniform1.p.name.set('myUniform');
	setMaterialUniform1.setUniformType(ActorConnectionPointType.VECTOR3);
	setMaterialUniform1.params.get(ActorConnectionPointType.VECTOR3)!.set([0.2, 0.3, 0.4]);

	const lerpConstant = actor1.createNode('constant');
	lerpConstant.setConstantType(ActorConnectionPointType.FLOAT);
	setMaterialUniform1.setInput('lerp', lerpConstant);
	lerpConstant.p.float.set(1);

	const uniformName = `${UNIFORM_PARAM_PREFIX}myUniform`;
	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(150);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		scene.play();
		await CoreSleep.sleep(500);
		assert.in_delta(scene.time(), 0.5, 0.25, 'time is 0.5 sec');

		assert.equal(MaterialUserDataUniforms.getUniforms(material)![uniformName].value.x, 0);
		await CoreSleep.sleep(500);
		assert.in_delta(scene.time(), 1, 0.25, 'time is 1 sec');
		assert.equal(MaterialUserDataUniforms.getUniforms(material)![uniformName].value.x, 0, 'color unchanged');

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(100);
		assert.equal(MaterialUserDataUniforms.getUniforms(material)![uniformName].value.x, 0.2, 'color changed');

		lerpConstant.p.float.set(0.5);
		setMaterialUniform1.params.get(ActorConnectionPointType.VECTOR3)!.set([0.4, 0.3, 0.8]);
		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(100);
		assert.in_delta(
			MaterialUserDataUniforms.getUniforms(material)![uniformName].value.x,
			0.3,
			0.0001,
			'color changed'
		);
	});
});
