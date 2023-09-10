import type {QUnit} from '../../../helpers/QUnit';
import {CoreObject} from '../../../../src/core/geometry/modules/three/CoreObject';
import {CameraAttribute} from '../../../../src/core/camera/CoreCamera';
export function testenginenodessopCameraCSSRenderer(qUnit: QUnit) {
	qUnit.test('sop/cameraCSSRenderer simple', async (assert) => {
		const geo1 = window.geo1;
		const camera1 = geo1.createNode('perspectiveCamera');
		const cameraCSSRenderer1 = geo1.createNode('cameraCSSRenderer');
		const CSS2DRenderer1 = cameraCSSRenderer1.createNode('CSS2DRenderer');
		cameraCSSRenderer1.p.node.setNode(CSS2DRenderer1);
		cameraCSSRenderer1.setInput(0, camera1);
		const container = await cameraCSSRenderer1.compute();
		const objects = container.coreContent()!.allObjects()!;
		assert.equal(objects.length, 1);

		assert.equal(
			CoreObject.attribValue(objects[0], CameraAttribute.CSS_RENDERER_NODE_ID),
			CSS2DRenderer1.graphNodeId()
		);
	});
	qUnit.test('sop/cameraCSSRenderer applyToChildren', async (assert) => {
		const geo1 = window.geo1;
		const camera1 = geo1.createNode('perspectiveCamera');
		const hierarchy1 = geo1.createNode('hierarchy');
		const cameraCSSRenderer1 = geo1.createNode('cameraCSSRenderer');
		const CSS2DRenderer1 = cameraCSSRenderer1.createNode('CSS2DRenderer');
		cameraCSSRenderer1.p.node.setNode(CSS2DRenderer1);
		hierarchy1.setInput(0, camera1);
		cameraCSSRenderer1.setInput(0, hierarchy1);
		const container = await cameraCSSRenderer1.compute();
		const objects = container.coreContent()!.allObjects()!;
		assert.equal(objects.length, 1);

		assert.equal(
			CoreObject.attribValue(objects[0], CameraAttribute.CSS_RENDERER_NODE_ID),
			CSS2DRenderer1.graphNodeId()
		);
		assert.equal(
			CoreObject.attribValue(objects[0].children[0], CameraAttribute.CSS_RENDERER_NODE_ID),
			CSS2DRenderer1.graphNodeId()
		);
	});
}
