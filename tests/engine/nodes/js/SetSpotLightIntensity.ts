import type {QUnit} from '../../../helpers/QUnit';
import {SpotLightContainer} from './../../../../src/core/lights/SpotLight';
import {CoreSleep} from '../../../../src/core/Sleep';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';
import {RendererUtils} from '../../../helpers/RendererUtils';
export function testenginenodesjsSetSpotLightIntensity(qUnit: QUnit) {

qUnit.test('js/setSpotlightIntensity', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const spotLight1 = geo1.createNode('spotLight');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, spotLight1);
	actor1.flags.display.set(true);
	actor1.io.inputs.overrideClonedState(true);

	const onManualTrigger1 = actor1.createNode('onManualTrigger');
	const setSpotLightIntensity1 = actor1.createNode('setSpotLightIntensity');

	setSpotLightIntensity1.setInput(JsConnectionPointType.TRIGGER, onManualTrigger1);
	setSpotLightIntensity1.p.intensity.set(10);

	const container = await actor1.compute();
	const spotLightContainer = container.coreContent()!.threejsObjects()[0] as SpotLightContainer;
	const spotLight = spotLightContainer.light();

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(150);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		assert.equal(spotLight.intensity, 2);
		scene.play();
		assert.equal(scene.time(), 0);
		assert.equal(spotLight.intensity, 2);

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(200);
		assert.equal(spotLight.intensity, 10);
	});
});

}