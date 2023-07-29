import type {QUnit} from '../../../helpers/QUnit';
import {Mesh, Vector3} from 'three';
export function testenginenodesjsNoiseImproved(qUnit: QUnit) {

qUnit.test('js/noiseImproved', async (assert) => {
	const geo1 = window.geo1;
	const plane1 = geo1.createNode('plane');
	const pointBuilder1 = geo1.createNode('pointBuilder');
	pointBuilder1.setInput(0, plane1);

	plane1.p.size.set([10, 10]);
	plane1.p.stepSize.set(0.1);

	const output1 = pointBuilder1.createNode('output');
	const globals1 = pointBuilder1.createNode('globals');
	const noiseImproved1 = pointBuilder1.createNode('noiseImproved');
	const add1 = pointBuilder1.createNode('add');
	const multScalar1 = pointBuilder1.createNode('multScalar');

	output1.setInput('position', add1);
	add1.setInput(0, globals1, 'position');
	add1.setInput(1, multScalar1);
	multScalar1.setInput(0, globals1, 'normal');
	multScalar1.setInput(1, noiseImproved1);

	async function getBboxYSize() {
		const container = await pointBuilder1.compute();
		const object = container.coreContent()!.threejsObjects()[0] as Mesh;
		const geometry = object.geometry;
		geometry.computeBoundingBox();
		const size = new Vector3();
		geometry.boundingBox?.getSize(size);
		return size.y;
	}

	assert.in_delta(await getBboxYSize(), 0, 0.01);
	noiseImproved1.setInput(0, globals1, 'position');
	assert.in_delta(await getBboxYSize(), 1.77, 0.01);
});

}