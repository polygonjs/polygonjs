import {ParamType} from '../../../../src/engine/poly/ParamType';

function ensure_default_value<T extends ParamType>(
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

	const param = geo1.add_param(param_type, 'test', given_default_value, options);
	if (param) {
		assert.deepEqual(param.default_value, expected_default_value);
		assert.deepEqual(param.value, expected_value);
		geo1.params.delete_param('test');
	} else {
		assert.notOk(true, 'param should have been created');
	}
}

QUnit.skip('params convert their default values to one they can handle', (assert) => {
	ensure_default_value(assert, ParamType.BOOLEAN, 0, false);
	ensure_default_value(assert, ParamType.BOOLEAN, 1, true);
	ensure_default_value(assert, ParamType.BOOLEAN, [1, 2, 3, 4], true);
	ensure_default_value(assert, ParamType.BOOLEAN, [1, 2, 3], true);
	ensure_default_value(assert, ParamType.BOOLEAN, [2, 1], true);
	ensure_default_value(assert, ParamType.BOOLEAN, '1', '1');

	ensure_default_value(assert, ParamType.FLOAT, 1, 1);
	ensure_default_value(assert, ParamType.FLOAT, [1, 2], 1);
	ensure_default_value(assert, ParamType.FLOAT, [2, 1], 2);
	ensure_default_value(assert, ParamType.FLOAT, '1', '1', '1');
	ensure_default_value(assert, ParamType.FLOAT, '$PI', '$PI', '$PI');

	ensure_default_value(assert, ParamType.VECTOR2, 1, [1, 1]);
	ensure_default_value(assert, ParamType.VECTOR2, [1, 2, 3], [1, 2]);
	ensure_default_value(assert, ParamType.VECTOR2, [2, 1], [2, 1]);
	ensure_default_value(assert, ParamType.VECTOR2, '1', [1, 1]);
	ensure_default_value(assert, ParamType.VECTOR2, [0, '$PI'], [0, '$PI']);
	ensure_default_value(assert, ParamType.VECTOR2, ['$PI', '$PI*2'], ['$PI', '$PI*2']);

	ensure_default_value(assert, ParamType.VECTOR3, 1, [1, 1, 1]);
	ensure_default_value(assert, ParamType.VECTOR3, [1, 2, 3, 4], [1, 2, 3]);
	ensure_default_value(assert, ParamType.VECTOR3, [1, 2, 3], [1, 2, 3]);
	ensure_default_value(assert, ParamType.VECTOR3, [2, 1], [2, 1, 1]);
	ensure_default_value(assert, ParamType.VECTOR3, '1', [1, 1, 1]);

	ensure_default_value(assert, ParamType.VECTOR4, 1, [1, 1, 1, 1]);
	ensure_default_value(assert, ParamType.VECTOR4, [1, 2, 3, 4], [1, 2, 3, 4]);
	ensure_default_value(assert, ParamType.VECTOR4, [1, 2, 3], [1, 2, 3, 3]);
	ensure_default_value(assert, ParamType.VECTOR4, [2, 1], [2, 1, 1, 1]);
	ensure_default_value(assert, ParamType.VECTOR4, '1', [1, 1, 1, 1]);
});
