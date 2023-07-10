import {Material} from 'three';
import {Water} from '../../../../src/modules/core/objects/Water';
import {RendererUtils} from '../../../helpers/RendererUtils';
import {OceanPlaneSopNode} from '../../../../src/engine/nodes/sop/OceanPlane';
import {NullSopNode} from '../../../../src/engine/nodes/sop/Null';
import {CoreSleep} from '../../../../src/core/Sleep';

QUnit.test(
	'oceanPlane can be cloned and keep unique material and the time uniform is updated correctly',
	async (assert) => {
		const scene = window.scene;
		const geo1 = window.geo1;
		// cancels geo node displayNodeController
		// update: display flag needs to be set to true for onAddRemove hooks to be run
		// geo1.flags.display.set(false);

		const {renderer} = await RendererUtils.waitForRenderer(window.scene);
		assert.ok(renderer, 'renderer created');

		const plane = geo1.createNode('plane');
		const oceanPlane = geo1.createNode('oceanPlane');
		const null1 = geo1.createNode('null');

		oceanPlane.setInput(0, plane);
		null1.setInput(0, oceanPlane);

		// let container = await oceanPlane.compute();
		// let water1 = container.coreContent()!.threejsObjectsWithGeo()[0] as Water;
		const _getOceanPlane = async (node: OceanPlaneSopNode | NullSopNode) => {
			node.flags.display.set(true);
			await node.compute();
			await CoreSleep.sleep(100);
			return geo1.object.children[1].children[0] as Water;
		};
		const water1 = await _getOceanPlane(oceanPlane);

		assert.equal(water1.material.uniforms.time.value, scene.time());
		scene.setFrame(600);
		assert.in_delta(scene.time(), 10, 0.01);
		assert.equal(water1.material.uniforms.time.value, scene.time());

		// clone
		// container = await null1.compute();
		// let water2 = container.coreContent()!.threejsObjectsWithGeo()[0] as Water;
		const water2 = await _getOceanPlane(null1);

		assert.notEqual((water1.material as Material).uuid, (water2.material as Material).uuid);

		assert.equal(water1.material.uniforms.time.value, scene.time());
		scene.setFrame(1200);
		assert.in_delta(scene.time(), 20, 0.01);
		assert.equal(water2.material.uniforms.time.value, scene.time());
	}
);

QUnit.test('oceanPlane can complete cook without a renderer', async (assert) => {
	const geo1 = window.geo1;
	geo1.flags.display.set(false); // cancels geo node displayNodeController

	const plane = geo1.createNode('plane');
	const oceanPlane = geo1.createNode('oceanPlane');
	const null1 = geo1.createNode('null');

	oceanPlane.setInput(0, plane);
	null1.setInput(0, oceanPlane);

	await oceanPlane.compute();
	assert.equal(1, 1, 'ocean has cooked');
});
