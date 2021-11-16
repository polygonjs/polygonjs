QUnit.test('viewer callbacks can be registered/unregistered', async (assert) => {
	const scene = window.scene;
	await scene.waitForCooksCompleted();
	assert.ok(!scene.loadingController.isLoading(), 'scene is loaded');

	const element = document.createElement('div');
	document.body.appendChild(element);
	const perspective_camera1 = window.perspective_camera1;
	const viewer = perspective_camera1.createViewer(element);

	for (let i = 0; i < 17; i++) {
		viewer.registerOnBeforeTick(`OnBeforeTick ${i}`, () => {});
		viewer.registerOnAfterTick(`OnAfterTick ${i}`, () => {});
		viewer.registerOnBeforeRender(`OnBeforeRender ${i}`, () => {});
		viewer.registerOnAfterRender(`OnAfterRender ${i}`, () => {});
	}
	assert.equal(viewer.registeredBeforeTickCallbacks().size, 17);
	assert.equal(viewer.registeredAfterTickCallbacks().size, 17);
	assert.equal(viewer.registeredBeforeRenderCallbacks().size, 17);
	assert.equal(viewer.registeredAfterRenderCallbacks().size, 17);

	assert.ok(viewer.registeredBeforeTickCallbacks().has(`OnBeforeTick 9`));
	assert.ok(viewer.registeredAfterTickCallbacks().has(`OnAfterTick 9`));
	assert.ok(viewer.registeredBeforeRenderCallbacks().has(`OnBeforeRender 9`));
	assert.ok(viewer.registeredAfterRenderCallbacks().has(`OnAfterRender 9`));

	viewer.unRegisterOnBeforeTick(`OnBeforeTick 9`);
	assert.notOk(viewer.registeredBeforeTickCallbacks().has(`OnBeforeTick 9`));
	viewer.unRegisterOnAfterTick(`OnAfterTick 9`);
	assert.notOk(viewer.registeredAfterTickCallbacks().has(`OnAfterTick 9`));
	viewer.unRegisterOnBeforeRender(`OnBeforeRender 9`);
	assert.notOk(viewer.registeredBeforeRenderCallbacks().has(`OnBeforeRender 9`));
	viewer.unRegisterOnAfterRender(`OnAfterRender 9`);
	assert.notOk(viewer.registeredAfterRenderCallbacks().has(`OnAfterRender 9`));

	// clear elements
	viewer.dispose();
	document.body.removeChild(element);
});
