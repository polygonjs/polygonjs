import type {QUnit} from '../../../helpers/QUnit';
import {Mesh} from 'three';
export function testenginenodesjsMatrix4MakeTranslation(qUnit: QUnit) {

qUnit.test('js/matrix4MakeTranslation', async (assert) => {
	const geo1 = window.geo1;
	const box1 = geo1.createNode('box');
	const objectBuilder1 = geo1.createNode('objectBuilder');
	objectBuilder1.setInput(0, box1);

	const output1 = objectBuilder1.createNode('output');
	const matrix4MakeTranslation1 = objectBuilder1.createNode('matrix4MakeTranslation');

	output1.setInput('matrix', matrix4MakeTranslation1);

	async function getPosX() {
		const container = await objectBuilder1.compute();
		const object = container.coreContent()!.threejsObjects()[0] as Mesh;
		return object.position.x;
	}

	assert.equal(await getPosX(), 0);
	matrix4MakeTranslation1.p.t.set([1, 0, 1]);
	assert.equal(await getPosX(), 1);
});

}