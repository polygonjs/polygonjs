import type {QUnit} from '../../../helpers/QUnit';
import {ParamType} from './../../../../src/engine/poly/ParamType';
import {GlConnectionPointType} from './../../../../src/engine/nodes/utils/io/connections/Gl';
import {Vector2Param} from './../../../../src/engine/params/Vector2';
import {Vector3Param} from './../../../../src/engine/params/Vector3';
import {NoiseName, NoiseOutputType} from '../../../../src/engine/nodes/gl/Noise';
export function testenginenodesglNoise(qUnit: QUnit) {

qUnit.test('gl noise params update as type changes', async (assert) => {
	const MAT = window.MAT;
	const material_basic_builder1 = MAT.createNode('meshBasicBuilder');
	material_basic_builder1.createNode('output');
	material_basic_builder1.createNode('globals');
	assert.equal(material_basic_builder1.children().length, 2);

	const noise1 = material_basic_builder1.createNode('noise');

	// start with type as vec3
	assert.deepEqual(noise1.params.get('amp')?.valueSerialized(), [1, 1, 1]);
	assert.deepEqual(noise1.params.get('amp')?.defaultValueSerialized(), [1, 1, 1]);
	assert.deepEqual(noise1.params.get('position')?.valueSerialized(), [0, 0, 0]);
	assert.deepEqual(noise1.params.get('position')?.defaultValueSerialized(), [0, 0, 0]);
	assert.deepEqual(noise1.params.get('freq')?.valueSerialized(), [1, 1, 1]);
	assert.deepEqual(noise1.params.get('freq')?.defaultValueSerialized(), [1, 1, 1]);
	assert.deepEqual(noise1.params.get('offset')?.valueSerialized(), [0, 0, 0]);
	assert.deepEqual(noise1.params.get('offset')?.defaultValueSerialized(), [0, 0, 0]);
	assert.deepEqual((noise1.params.get('amp') as Vector3Param).value.toArray(), [1, 1, 1]);
	assert.equal(noise1.params.get('amp')?.type(), ParamType.VECTOR3);
	assert.equal(noise1.io.inputs.namedInputConnectionPointsByName('amp')?.type(), GlConnectionPointType.VEC3);
	assert.equal(noise1.io.inputs.namedInputConnectionPointsByName('position')?.type(), GlConnectionPointType.VEC3);
	assert.equal(noise1.io.inputs.namedInputConnectionPointsByName('freq')?.type(), GlConnectionPointType.VEC3);
	assert.equal(noise1.io.inputs.namedInputConnectionPointsByName('offset')?.type(), GlConnectionPointType.VEC3);
	assert.equal(noise1.io.outputs.namedOutputConnectionPointsByName('noise')?.type(), GlConnectionPointType.VEC3);

	// move to type as vec2
	noise1.setNoiseName(NoiseName.NOISE_2D);
	assert.deepEqual(noise1.params.get('amp')?.valueSerialized(), [1, 1]);
	assert.deepEqual(noise1.params.get('amp')?.defaultValueSerialized(), [1, 1]);
	assert.deepEqual(noise1.params.get('position')?.valueSerialized(), [0, 0]);
	assert.deepEqual(noise1.params.get('position')?.defaultValueSerialized(), [0, 0]);
	assert.deepEqual(noise1.params.get('freq')?.valueSerialized(), [1, 1]);
	assert.deepEqual(noise1.params.get('freq')?.defaultValueSerialized(), [1, 1]);
	assert.deepEqual(noise1.params.get('offset')?.valueSerialized(), [0, 0]);
	assert.deepEqual(noise1.params.get('offset')?.defaultValueSerialized(), [0, 0]);
	noise1.params.get('amp')?.set([2, 3]);
	assert.deepEqual((noise1.params.get('amp') as Vector2Param).value.toArray(), [2, 3]);
	assert.equal(noise1.params.get('amp')?.type(), ParamType.VECTOR2);
	assert.equal(noise1.io.inputs.namedInputConnectionPointsByName('amp')?.type(), GlConnectionPointType.VEC2);
	assert.equal(noise1.io.inputs.namedInputConnectionPointsByName('position')?.type(), GlConnectionPointType.VEC2);
	assert.equal(noise1.io.inputs.namedInputConnectionPointsByName('freq')?.type(), GlConnectionPointType.VEC2);
	assert.equal(noise1.io.inputs.namedInputConnectionPointsByName('offset')?.type(), GlConnectionPointType.VEC2);
	assert.equal(noise1.io.outputs.namedOutputConnectionPointsByName('noise')?.type(), GlConnectionPointType.VEC2);

	// back to vec3
	noise1.setNoiseName(NoiseName.NOISE_3D);
	assert.deepEqual(noise1.params.get('amp')?.valueSerialized(), [2, 3, 3]);
	assert.deepEqual(noise1.params.get('amp')?.defaultValueSerialized(), [1, 1, 1]);
	assert.deepEqual(noise1.params.get('position')?.valueSerialized(), [0, 0, 0]);
	assert.deepEqual(noise1.params.get('position')?.defaultValueSerialized(), [0, 0, 0]);
	assert.deepEqual(noise1.params.get('freq')?.valueSerialized(), [1, 1, 1]);
	assert.deepEqual(noise1.params.get('freq')?.defaultValueSerialized(), [1, 1, 1]);
	assert.deepEqual(noise1.params.get('offset')?.valueSerialized(), [0, 0, 0]);
	assert.deepEqual(noise1.params.get('offset')?.defaultValueSerialized(), [0, 0, 0]);
	assert.deepEqual((noise1.params.get('amp') as Vector3Param).value.toArray(), [2, 3, 3]);
	assert.equal(noise1.params.get('amp')?.type(), ParamType.VECTOR3);
	assert.equal(noise1.io.inputs.namedInputConnectionPointsByName('amp')?.type(), GlConnectionPointType.VEC3);
	assert.equal(noise1.io.inputs.namedInputConnectionPointsByName('position')?.type(), GlConnectionPointType.VEC3);
	assert.equal(noise1.io.inputs.namedInputConnectionPointsByName('freq')?.type(), GlConnectionPointType.VEC3);
	assert.equal(noise1.io.inputs.namedInputConnectionPointsByName('offset')?.type(), GlConnectionPointType.VEC3);
	assert.equal(noise1.io.outputs.namedOutputConnectionPointsByName('noise')?.type(), GlConnectionPointType.VEC3);

	// set output type to float
	noise1.setOutputType(NoiseOutputType.Float);
	assert.deepEqual(noise1.params.get('amp')?.valueSerialized(), 2, 'amp = 2');
	assert.deepEqual(noise1.params.get('amp')?.defaultValueSerialized(), 1, 'amp = 1');
	assert.deepEqual(noise1.params.get('position')?.valueSerialized(), [0, 0, 0]);
	assert.deepEqual(noise1.params.get('position')?.defaultValueSerialized(), [0, 0, 0]);
	assert.deepEqual(noise1.params.get('freq')?.valueSerialized(), [1, 1, 1]);
	assert.deepEqual(noise1.params.get('freq')?.defaultValueSerialized(), [1, 1, 1]);
	assert.deepEqual(noise1.params.get('offset')?.valueSerialized(), [0, 0, 0]);
	assert.deepEqual(noise1.params.get('offset')?.defaultValueSerialized(), [0, 0, 0]);
	assert.equal(noise1.params.get('amp')?.type(), ParamType.FLOAT);
	assert.equal(noise1.io.inputs.namedInputConnectionPointsByName('amp')?.type(), GlConnectionPointType.FLOAT);
	assert.equal(noise1.io.inputs.namedInputConnectionPointsByName('position')?.type(), GlConnectionPointType.VEC3);
	assert.equal(noise1.io.inputs.namedInputConnectionPointsByName('freq')?.type(), GlConnectionPointType.VEC3);
	assert.equal(noise1.io.inputs.namedInputConnectionPointsByName('offset')?.type(), GlConnectionPointType.VEC3);
	assert.equal(noise1.io.outputs.namedOutputConnectionPointsByName('noise')?.type(), GlConnectionPointType.FLOAT);

	// output to vec2
	noise1.setOutputType(NoiseOutputType.Vec2);
	assert.deepEqual(noise1.params.get('amp')?.valueSerialized(), [2, 2], 'amp = [2,2]');
	assert.deepEqual(noise1.params.get('amp')?.defaultValueSerialized(), [1, 1], 'amp = [1,1]');
	assert.deepEqual(noise1.params.get('position')?.valueSerialized(), [0, 0, 0]);
	assert.deepEqual(noise1.params.get('position')?.defaultValueSerialized(), [0, 0, 0]);
	assert.deepEqual(noise1.params.get('freq')?.valueSerialized(), [1, 1, 1]);
	assert.deepEqual(noise1.params.get('freq')?.defaultValueSerialized(), [1, 1, 1]);
	assert.deepEqual(noise1.params.get('offset')?.valueSerialized(), [0, 0, 0]);
	assert.deepEqual(noise1.params.get('offset')?.defaultValueSerialized(), [0, 0, 0]);
	assert.equal(noise1.params.get('amp')?.type(), ParamType.VECTOR2);
	assert.equal(noise1.io.inputs.namedInputConnectionPointsByName('amp')?.type(), GlConnectionPointType.VEC2);
	assert.equal(noise1.io.inputs.namedInputConnectionPointsByName('position')?.type(), GlConnectionPointType.VEC3);
	assert.equal(noise1.io.inputs.namedInputConnectionPointsByName('freq')?.type(), GlConnectionPointType.VEC3);
	assert.equal(noise1.io.inputs.namedInputConnectionPointsByName('offset')?.type(), GlConnectionPointType.VEC3);
	assert.equal(noise1.io.outputs.namedOutputConnectionPointsByName('noise')?.type(), GlConnectionPointType.VEC2);

	// output to vec3
	noise1.setOutputType(NoiseOutputType.Vec3);
	assert.deepEqual(noise1.params.get('amp')?.valueSerialized(), [2, 2, 2], 'amp = [2,2,2]');
	assert.deepEqual(noise1.params.get('amp')?.defaultValueSerialized(), [1, 1, 1], 'amp = [1,1,1]');
	assert.deepEqual(noise1.params.get('position')?.valueSerialized(), [0, 0, 0]);
	assert.deepEqual(noise1.params.get('position')?.defaultValueSerialized(), [0, 0, 0]);
	assert.deepEqual(noise1.params.get('freq')?.valueSerialized(), [1, 1, 1]);
	assert.deepEqual(noise1.params.get('freq')?.defaultValueSerialized(), [1, 1, 1]);
	assert.deepEqual(noise1.params.get('offset')?.valueSerialized(), [0, 0, 0]);
	assert.deepEqual(noise1.params.get('offset')?.defaultValueSerialized(), [0, 0, 0]);
	assert.equal(noise1.params.get('amp')?.type(), ParamType.VECTOR3);
	assert.equal(noise1.io.inputs.namedInputConnectionPointsByName('amp')?.type(), GlConnectionPointType.VEC3);
	assert.equal(noise1.io.inputs.namedInputConnectionPointsByName('position')?.type(), GlConnectionPointType.VEC3);
	assert.equal(noise1.io.inputs.namedInputConnectionPointsByName('freq')?.type(), GlConnectionPointType.VEC3);
	assert.equal(noise1.io.inputs.namedInputConnectionPointsByName('offset')?.type(), GlConnectionPointType.VEC3);
	assert.equal(noise1.io.outputs.namedOutputConnectionPointsByName('noise')?.type(), GlConnectionPointType.VEC3);

	// output to vec3
	noise1.setOutputType(NoiseOutputType.NoChange);
	assert.deepEqual(noise1.params.get('amp')?.valueSerialized(), [2, 2, 2], 'amp = [2,2,2]');
	assert.deepEqual(noise1.params.get('amp')?.defaultValueSerialized(), [1, 1, 1], 'amp = [1,1,1]');
	assert.deepEqual(noise1.params.get('position')?.valueSerialized(), [0, 0, 0]);
	assert.deepEqual(noise1.params.get('position')?.defaultValueSerialized(), [0, 0, 0]);
	assert.deepEqual(noise1.params.get('freq')?.valueSerialized(), [1, 1, 1]);
	assert.deepEqual(noise1.params.get('freq')?.defaultValueSerialized(), [1, 1, 1]);
	assert.deepEqual(noise1.params.get('offset')?.valueSerialized(), [0, 0, 0]);
	assert.deepEqual(noise1.params.get('offset')?.defaultValueSerialized(), [0, 0, 0]);
	assert.equal(noise1.params.get('amp')?.type(), ParamType.VECTOR3);
	assert.equal(noise1.io.inputs.namedInputConnectionPointsByName('amp')?.type(), GlConnectionPointType.VEC3);
	assert.equal(noise1.io.inputs.namedInputConnectionPointsByName('position')?.type(), GlConnectionPointType.VEC3);
	assert.equal(noise1.io.inputs.namedInputConnectionPointsByName('freq')?.type(), GlConnectionPointType.VEC3);
	assert.equal(noise1.io.inputs.namedInputConnectionPointsByName('offset')?.type(), GlConnectionPointType.VEC3);
	assert.equal(noise1.io.outputs.namedOutputConnectionPointsByName('noise')?.type(), GlConnectionPointType.VEC3);
	// assert.deepEqual((noise1.params.get('amp') as Vector3Param).value.toArray(), 2);
	// noise1.setNoiseName(NoiseName.NOISE_2D);
	// assert.deepEqual(noise1.params.get('amp')?.valueSerialized(), [1, 1]);
	// assert.deepEqual(noise1.params.get('amp')?.defaultValueSerialized(), [1, 1]);
	// noise1.params.get('amp')?.set([2, 3]);
});

}