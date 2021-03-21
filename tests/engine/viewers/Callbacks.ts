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
	assert.equal(viewer.registeredBeforeTickCallbackNames()!.length, 17);
	assert.equal(viewer.registeredAfterTickCallbackNames()!.length, 17);
	assert.equal(viewer.registeredBeforeRenderCallbackNames()!.length, 17);
	assert.equal(viewer.registeredAfterRenderCallbackNames()!.length, 17);

	assert.ok(viewer.registeredBeforeTickCallbackNames()!.includes(`OnBeforeTick 9`));
	assert.ok(viewer.registeredAfterTickCallbackNames()!.includes(`OnAfterTick 9`));
	assert.ok(viewer.registeredBeforeRenderCallbackNames()!.includes(`OnBeforeRender 9`));
	assert.ok(viewer.registeredAfterRenderCallbackNames()!.includes(`OnAfterRender 9`));

	viewer.unRegisterOnBeforeTick(`OnBeforeTick 9`);
	assert.notOk(viewer.registeredBeforeTickCallbackNames()!.includes(`OnBeforeTick 9`));
	viewer.unRegisterOnAfterTick(`OnAfterTick 9`);
	assert.notOk(viewer.registeredAfterTickCallbackNames()!.includes(`OnAfterTick 9`));
	viewer.unRegisterOnBeforeRender(`OnBeforeRender 9`);
	assert.notOk(viewer.registeredBeforeRenderCallbackNames()!.includes(`OnBeforeRender 9`));
	viewer.unRegisterOnAfterRender(`OnAfterRender 9`);
	assert.notOk(viewer.registeredAfterRenderCallbackNames()!.includes(`OnAfterRender 9`));

	// clear elements
	viewer.dispose();
	document.body.removeChild(element);
});
