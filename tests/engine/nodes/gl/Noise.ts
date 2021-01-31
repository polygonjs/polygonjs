import {NOISE_NAMES, NoiseName} from '../../../../src/engine/nodes/gl/Noise';

QUnit.test('gl noise params update as type changes', async (assert) => {
	const MAT = window.MAT;
	const material_basic_builder1 = MAT.createNode('meshBasicBuilder');
	material_basic_builder1.createNode('output');
	material_basic_builder1.createNode('globals');
	assert.equal(material_basic_builder1.children().length, 2);

	const noise1 = material_basic_builder1.createNode('noise');

	// start with type as vec3
	assert.deepEqual(noise1.params.get('amp')?.valueSerialized(), [1, 1, 1]);
	assert.deepEqual(noise1.params.get('amp')?.defaultValueSerialized(), [1, 1, 1]);

	// move to type as vec2
	noise1.p.type.set(NOISE_NAMES.indexOf(NoiseName.NOISE_2D));
	assert.deepEqual(noise1.params.get('amp')?.valueSerialized(), [1, 1]);
	assert.deepEqual(noise1.params.get('amp')?.defaultValueSerialized(), [1, 1]);
	noise1.params.get('amp')?.set([2, 3]);

	// back to vec2
	noise1.p.type.set(NOISE_NAMES.indexOf(NoiseName.NOISE_3D));
	assert.deepEqual(noise1.params.get('amp')?.valueSerialized(), [2, 3, 3]);
	assert.deepEqual(noise1.params.get('amp')?.defaultValueSerialized(), [1, 1, 1]);
});
