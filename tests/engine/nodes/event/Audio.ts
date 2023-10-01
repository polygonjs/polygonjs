import type {QUnit} from '../../../helpers/QUnit';
import {ASSETS_ROOT} from '../../../../src/core/loader/AssetsUtils';
import {CoreSleep} from '../../../../src/core/Sleep';
export function testenginenodeseventAudio(qUnit: QUnit) {
	qUnit.test('event/audio onStop trigger', async (assert) => {
		const scene = window.scene;
		const geo1 = window.geo1;

		const listener1 = scene.root().createNode('audioListener');
		const positionalAudio1 = scene.root().createNode('positionalAudio');
		await listener1.activateSound();

		const file1 = positionalAudio1.createNode('file');
		positionalAudio1.p.audioNode.setNode(file1);

		const eventsNetwork = scene.root().createNode('eventsNetwork');
		const audio1 = eventsNetwork.createNode('audio');
		const setParam1 = eventsNetwork.createNode('setParam');
		setParam1.setInput(0, audio1);
		setParam1.p.param.setParam(geo1.p.t.x);
		setParam1.p.number.set(1);
		setParam1.p.increment.set(1);

		assert.equal(geo1.p.t.x.value, 0, 'not moved 0');

		file1.p.autostart.set(0);
		file1.p.loop.set(0);

		file1.p.url.set(
			`${ASSETS_ROOT}/audio/resources/freesound/short/657826__the-sacha-rush__thoughtful-atmospheric-rapid-intro.mp3`
		);
		audio1.p.audio.setNode(file1);
		audio1.p.play.pressButton();

		assert.equal(geo1.p.t.x.value, 0, 'not moved 1');
		await CoreSleep.sleep(4000);

		file1.p.pause.pressButton();
		await CoreSleep.sleep(500);
		assert.equal(geo1.p.t.x.value, 1, 'moved to 1');
		audio1.p.play.pressButton();

		await CoreSleep.sleep(4000);
		assert.equal(geo1.p.t.x.value, 1, 'not moved again');

		audio1.p.play.pressButton();
		await CoreSleep.sleep(4000);
		assert.equal(geo1.p.t.x.value, 2, 'moved to 2');
	});
}
