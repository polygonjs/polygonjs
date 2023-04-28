import {Mesh} from 'three';
import {JsConnectionPointType} from '../../../../src/engine/nodes/utils/io/connections/Js';

QUnit.test('js/eulerFromQuaternion', async (assert) => {
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const objectBuilder1 = geo1.createNode('objectBuilder');
	objectBuilder1.setInput(0, box1);

	const output1 = objectBuilder1.createNode('output');

	const quaternion1 = objectBuilder1.createNode('quaternion');
	const eulerFromQuaternion1 = objectBuilder1.createNode('eulerFromQuaternion');

	output1.setInput('rotation', eulerFromQuaternion1);
	eulerFromQuaternion1.setInput(JsConnectionPointType.QUATERNION, quaternion1);

	quaternion1.p.axis.set([0, 1, 0]);

	async function getRotY() {
		const container = await objectBuilder1.compute();
		const object = container.coreContent()!.threejsObjects()[0] as Mesh;
		return object.rotation.y;
	}

	assert.equal(await getRotY(), 0);

	quaternion1.p.angle.set(0.5 * Math.PI);
	assert.equal(await getRotY(), Math.PI * 0.5);
});
