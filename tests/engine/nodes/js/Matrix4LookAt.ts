import type {QUnit} from '../../../helpers/QUnit';
import {Mesh} from 'three';
export function testenginenodesjsMatrix4LookAt(qUnit: QUnit) {

qUnit.test('js/matrix4LookAt', async (assert) => {
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const objectBuilder1 = geo1.createNode('objectBuilder');
	objectBuilder1.setInput(0, box1);

	const output1 = objectBuilder1.createNode('output');
	const matrix4LookAt1 = objectBuilder1.createNode('matrix4LookAt');

	output1.setInput('matrix', matrix4LookAt1);

	async function getRotY() {
		const container = await objectBuilder1.compute();
		const object = container.coreContent()!.threejsObjects()[0] as Mesh;
		return object.rotation.y;
	}

	assert.equal(await getRotY(), 0);
	matrix4LookAt1.p.target.set([1, 0, 1]);
	assert.in_delta(await getRotY(), -Math.PI * 0.25, 0.00001);
});

}