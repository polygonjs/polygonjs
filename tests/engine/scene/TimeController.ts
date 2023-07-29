import type {QUnit} from '../../helpers/QUnit';
export function testenginesceneTimeController(qUnit: QUnit) {
qUnit.test('scene callbacks can be registered/unregistered', async (assert) => {
	const scene = window.scene;
	await scene.waitForCooksCompleted();
	assert.ok(!scene.loadingController.isLoading(), 'scene is loaded');

	for (let i = 0; i < 17; i++) {
		scene.registerOnBeforeTick(`OnBeforeTick ${i}`, () => {});
		scene.registerOnAfterTick(`OnAfterTick ${i}`, () => {});
	}
	assert.equal(scene.registeredBeforeTickCallbacks().size, 17);
	assert.equal(scene.registeredAfterTickCallbacks().size, 17);

	assert.ok(scene.registeredBeforeTickCallbacks().has(`OnBeforeTick 9`));
	assert.ok(scene.registeredAfterTickCallbacks().has(`OnAfterTick 9`));

	scene.unRegisterOnBeforeTick(`OnBeforeTick 9`);
	assert.notOk(scene.registeredBeforeTickCallbacks().has(`OnBeforeTick 9`));
	scene.unRegisterOnAfterTick(`OnAfterTick 9`);
	assert.notOk(scene.registeredAfterTickCallbacks().has(`OnAfterTick 9`));
});

}