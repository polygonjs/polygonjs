import {ParamType} from '../../../../src/engine/poly/ParamType';
import {Vector2} from 'three';
import {Vector3} from 'three';
import {Vector4} from 'three';
import {Color} from 'three';

async function ensure_default_value<T extends ParamType>(
	assert: Assert,
	param_type: T,
	given_default_value: any,
	expected_default_value: any,
	expected_value?: any
) {
	const options = {spare: true};
	const geo1 = window.geo1;

	if (expected_value === undefined) {
		expected_value = expected_default_value;
	}

	const param = geo1.addParam(param_type, 'test', given_default_value, options);
	if (param) {
		await param.compute();
		assert.deepEqual(param.defaultValue(), expected_default_value);
		assert.deepEqual(param.value, expected_value);
		geo1.params.updateParams({namesToDelete: ['test']});
	} else {
		assert.notOk(true, 'param should have been created');
	}
}

QUnit.test('params convert their default values to one they can handle', async (assert) => {
	await ensure_default_value(assert, ParamType.BOOLEAN, 0, 0, false);
	await ensure_default_value(assert, ParamType.BOOLEAN, 1, 1, true);
	await ensure_default_value(assert, ParamType.BOOLEAN, [1, 2, 3, 4], 1, true);
	await ensure_default_value(assert, ParamType.BOOLEAN, [1, 2, 3], 1, true);
	await ensure_default_value(assert, ParamType.BOOLEAN, [2, 1], 2, true);
	await ensure_default_value(assert, ParamType.BOOLEAN, '1', '1', true);

	await ensure_default_value(assert, ParamType.FLOAT, 1, 1);
	await ensure_default_value(assert, ParamType.FLOAT, [1, 2], 1);
	await ensure_default_value(assert, ParamType.FLOAT, [2, 1], 2);
	await ensure_default_value(assert, ParamType.FLOAT, '1', 1, 1);
	await ensure_default_value(assert, ParamType.FLOAT, 'round($PI)', 'round($PI)', Math.round(Math.PI));

	await ensure_default_value(assert, ParamType.VECTOR2, 1, [1, 1], new Vector2(1, 1));
	await ensure_default_value(assert, ParamType.VECTOR2, [1, 2, 3], [1, 2], new Vector2(1, 2));
	await ensure_default_value(assert, ParamType.VECTOR2, [2, 1], [2, 1], new Vector2(2, 1));
	await ensure_default_value(assert, ParamType.VECTOR2, [2], [2, 2], new Vector2(2, 2));
	await ensure_default_value(assert, ParamType.VECTOR2, '1', ['1', '1'], new Vector2(1, 1));
	await ensure_default_value(
		assert,
		ParamType.VECTOR2,
		[0, 'round($PI)'],
		[0, 'round($PI)'],
		new Vector2(0, Math.round(Math.PI))
	);
	await ensure_default_value(
		assert,
		ParamType.VECTOR2,
		['round($PI)', 'round($PI*2)'],
		['round($PI)', 'round($PI*2)'],
		new Vector2(Math.round(Math.PI), Math.round(2 * Math.PI))
	);

	await ensure_default_value(assert, ParamType.VECTOR3, 1, [1, 1, 1], new Vector3(1, 1, 1));
	await ensure_default_value(assert, ParamType.VECTOR3, [1, 2, 3, 4], [1, 2, 3], new Vector3(1, 2, 3));
	await ensure_default_value(assert, ParamType.VECTOR3, [1, 2, 3], [1, 2, 3], new Vector3(1, 2, 3));
	await ensure_default_value(assert, ParamType.VECTOR3, [2, 1], [2, 1, 1], new Vector3(2, 1, 1));
	await ensure_default_value(assert, ParamType.VECTOR3, '1+2', ['1+2', '1+2', '1+2'], new Vector3(3, 3, 3));

	ensure_default_value(assert, ParamType.VECTOR4, 1, [1, 1, 1, 1], new Vector4(1, 1, 1, 1));
	ensure_default_value(assert, ParamType.VECTOR4, [1, 2, 3, 4], [1, 2, 3, 4], new Vector4(1, 2, 3, 4));
	ensure_default_value(assert, ParamType.VECTOR4, [1, 2, 3], [1, 2, 3, 3], new Vector4(1, 2, 3, 3));
	ensure_default_value(assert, ParamType.VECTOR4, [2, 1], [2, 1, 1, 1], new Vector4(2, 1, 1, 1));
	ensure_default_value(assert, ParamType.VECTOR4, [2], [2, 2, 2, 2], new Vector4(2, 2, 2, 2));
	ensure_default_value(assert, ParamType.VECTOR4, '1', ['1', '1', '1', '1'], new Vector4(1, 1, 1, 1));

	ensure_default_value(assert, ParamType.COLOR, 1, [1, 1, 1], new Color(1, 1, 1));
	ensure_default_value(assert, ParamType.COLOR, [1, 2, 3, 4], [1, 2, 3], new Color(1, 2, 3));
	ensure_default_value(assert, ParamType.COLOR, [1, 2, 3], [1, 2, 3], new Color(1, 2, 3));
	ensure_default_value(assert, ParamType.COLOR, [2, 1], [2, 1, 1], new Color(2, 1, 1));
	ensure_default_value(assert, ParamType.COLOR, [2], [2, 2, 2], new Color(2, 2, 2));
	ensure_default_value(assert, ParamType.COLOR, '1+2', ['1+2', '1+2', '1+2'], new Color(3, 3, 3));
});
