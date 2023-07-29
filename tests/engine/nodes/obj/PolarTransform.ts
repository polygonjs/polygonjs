import type {QUnit} from '../../../helpers/QUnit';
export function testenginenodesobjPolarTransform(qUnit: QUnit) {
qUnit.test('obj/polarTransform simple', async (assert) => {
	const root = window.root;

	const polarTransform = root.createNode('polarTransform');
	polarTransform.p.center.set([1, 2, 3]);
	polarTransform.p.depth.set(1);
	await polarTransform.compute();
	assert.deepEqual(polarTransform.object.position.toArray(), [1, 2, 4]);
	assert.deepEqual(polarTransform.object.rotation.toArray(), [0, 0, 0, 'XYZ']);

	polarTransform.p.longitude.set(90);
	polarTransform.p.depth.set(1);
	await polarTransform.compute();
	assert.deepEqual(polarTransform.object.position.toArray(), [2, 2, 3]);
	assert.deepEqual(polarTransform.object.rotation.toArray(), [0, 0.5 * Math.PI, 0, 'XYZ']);
});

}