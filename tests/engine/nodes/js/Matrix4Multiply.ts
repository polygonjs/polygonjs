import {Mesh} from 'three';
import {Matrix4MultiplyInputName} from '../../../../src/engine/nodes/js/Matrix4Multiply';

QUnit.test('js/matrix4Multiply', async (assert) => {
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const objectBuilder1 = geo1.createNode('objectBuilder');
	objectBuilder1.setInput(0, box1);

	const output1 = objectBuilder1.createNode('output');
	const matrix4LookAt1 = objectBuilder1.createNode('matrix4LookAt');
	const matrix4MakeTranslation1 = objectBuilder1.createNode('matrix4MakeTranslation');
	const matrix4Multiply1 = objectBuilder1.createNode('matrix4Multiply');

	output1.setInput('matrix', matrix4Multiply1);
	matrix4Multiply1.setInput(Matrix4MultiplyInputName.m1, matrix4MakeTranslation1);
	matrix4Multiply1.setInput(Matrix4MultiplyInputName.m2, matrix4LookAt1);

	async function getPosXRY() {
		const container = await objectBuilder1.compute();
		const object = container.coreContent()!.threejsObjects()[0] as Mesh;
		return {tx: object.position.x, ry: object.rotation.y};
	}

	assert.deepEqual(await getPosXRY(), {tx: 0, ry: 0});

	matrix4MakeTranslation1.p.t.set([1, 0, 1]);
	matrix4LookAt1.p.target.set([1, 0, 1]);
	assert.equal((await getPosXRY()).tx, 1);
	assert.in_delta((await getPosXRY()).ry, -Math.PI * 0.25, 0.0001);
});
