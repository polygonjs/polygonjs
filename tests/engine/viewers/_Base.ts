import {Poly} from '../../../src/engine/Poly';
import {HTMLElementWithViewer} from '../../../src/engine/viewers/_Base';
import {RendererUtils} from '../../helpers/RendererUtils';

QUnit.test('viewer domElement is assigned scene and viewer', async (assert) => {
	const scene = window.scene;
	await scene.waitForCooksCompleted();

	await RendererUtils.withViewer({cameraNode: window.perspective_camera1}, async ({viewer, element}) => {
		const elementWithScene = element as HTMLElementWithViewer<any>;
		assert.deepEqual(elementWithScene.scene, scene);
		assert.deepEqual(elementWithScene.viewer, viewer);
		assert.deepEqual(elementWithScene.Poly, Poly);
	});
});
