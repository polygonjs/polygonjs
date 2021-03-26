QUnit.test('scene callbacks can be registered/unregistered', async (assert) => {
	const scene = window.scene;
	await scene.waitForCooksCompleted();
	assert.ok(!scene.loadingController.isLoading(), 'scene is loaded');

	for (let i = 0; i < 17; i++) {
		scene.registerOnBeforeTick(`OnBeforeTick ${i}`, () => {});
		scene.registerOnAfterTick(`OnAfterTick ${i}`, () => {});
	}
	assert.equal(scene.registeredBeforeTickCallbackNames()!.length, 17);
	assert.equal(scene.registeredAfterTickCallbackNames()!.length, 17);

	assert.ok(scene.registeredBeforeTickCallbackNames()!.includes(`OnBeforeTick 9`));
	assert.ok(scene.registeredAfterTickCallbackNames()!.includes(`OnAfterTick 9`));

	scene.unRegisterOnBeforeTick(`OnBeforeTick 9`);
	assert.notOk(scene.registeredBeforeTickCallbackNames()!.includes(`OnBeforeTick 9`));
	scene.unRegisterOnAfterTick(`OnAfterTick 9`);
	assert.notOk(scene.registeredAfterTickCallbackNames()!.includes(`OnAfterTick 9`));
});
