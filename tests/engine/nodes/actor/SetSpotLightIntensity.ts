import {SpotLightContainer} from './../../../../src/core/lights/SpotLight';
import {CoreSleep} from '../../../../src/core/Sleep';
import {ActorConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Actor';
import {RendererUtils} from '../../../helpers/RendererUtils';

QUnit.test('actor/setSpotlightIntensity', async (assert) => {
	const scene = window.scene;
	const perspective_camera1 = window.perspective_camera1;
	const geo1 = window.geo1;
	const spotLight1 = geo1.createNode('spotLight');
	const actor1 = geo1.createNode('actor');

	actor1.setInput(0, spotLight1);
	actor1.flags.display.set(true);

	const onManualTrigger1 = actor1.createNode('onManualTrigger');
	const setSpotLightIntensity1 = actor1.createNode('setSpotLightIntensity');

	setSpotLightIntensity1.setInput(ActorConnectionPointType.TRIGGER, onManualTrigger1);
	setSpotLightIntensity1.p.intensity.set(10);

	const container = await actor1.compute();
	const spotLightContainer = container.coreContent()!.objects()[0] as SpotLightContainer;
	const spotLight = spotLightContainer.light();

	// wait to make sure objects are mounted to the scene
	await CoreSleep.sleep(150);

	await RendererUtils.withViewer({cameraNode: perspective_camera1}, async (args) => {
		assert.equal(spotLight.intensity, 1);
		scene.play();
		assert.equal(scene.time(), 0);
		assert.equal(spotLight.intensity, 1);

		onManualTrigger1.p.trigger.pressButton();
		await CoreSleep.sleep(200);
		assert.equal(spotLight.intensity, 10);
	});
});
