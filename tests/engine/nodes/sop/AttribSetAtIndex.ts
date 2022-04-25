import {Vector4} from 'three';
import {Vector2} from 'three';
import {Vector3} from 'three';
import {AttribType, AttribClass, AttribSize} from '../../../../src/core/geometry/Constant';
import {CoreEntity} from '../../../../src/core/geometry/Entity';
import {CoreType} from '../../../../src/core/Type';
import {AttribCreateSopNode} from '../../../../src/engine/nodes/sop/AttribCreate';
import {AttribSetAtIndexSopNode} from '../../../../src/engine/nodes/sop/AttribSetAtIndex';
import {FloatParam} from '../../../../src/engine/params/Float';
import {Vector2Param} from '../../../../src/engine/params/Vector2';
import {Vector3Param} from '../../../../src/engine/params/Vector3';
import {Vector4Param} from '../../../../src/engine/params/Vector4';
import {StringOrNumber2, StringOrNumber3, StringOrNumber4} from '../../../../src/types/GlobalTypes';

interface MultiTestOptions {
	existingAttrib: boolean;
	attribClass: AttribClass;
	attribType: AttribType;
	attribSize: AttribSize;
	withExpression: boolean;
	withValidIndex: boolean;
}

QUnit.test('sop/attribSetAtIndex using group or not', async (assert) => {
	const geo1 = window.geo1;

	function vParamNumeric(attribSetAtIndex: AttribSetAtIndexSopNode | AttribCreateSopNode) {
		const size = attribSetAtIndex.pv.size;
		const vparam = [
			attribSetAtIndex.p.value1,
			attribSetAtIndex.p.value2,
			attribSetAtIndex.p.value3,
			attribSetAtIndex.p.value4,
		][size - 1];
		return vparam;
	}
	function assignVParamNumeric(
		attribSetAtIndex: AttribSetAtIndexSopNode | AttribCreateSopNode,
		valueN: string | number
	) {
		const param = vParamNumeric(attribSetAtIndex);
		if (param instanceof FloatParam) {
			param.set(valueN);
		}
		if (param instanceof Vector2Param) {
			const valuesN: StringOrNumber2 = [valueN, valueN];
			param.set(valuesN);
		}
		if (param instanceof Vector3Param) {
			const valuesN: StringOrNumber3 = [valueN, valueN, valueN];
			param.set(valuesN);
		}
		if (param instanceof Vector4Param) {
			const valuesN: StringOrNumber4 = [valueN, valueN, valueN, valueN];
			param.set(valuesN);
		}
	}
	// {"existingAttrib":true,"attribSize":1,"withExpression":true,"withGroup":true}
	function buildExpectedNumericValue(options: MultiTestOptions) {
		const {existingAttrib, withExpression, withValidIndex} = options;
		if (existingAttrib) {
			if (withExpression) {
				if (withValidIndex) {
					return [7, 7, 14, 7];
				} else {
					return [7, 7, 7, 7];
				}
			} else {
				if (withValidIndex) {
					return [7, 7, 1, 7];
				} else {
					return [7, 7, 7, 7];
				}
			}
		} else {
			if (withExpression) {
				if (withValidIndex) {
					return [0, 0, 14, 0];
				} else {
					return [0, 0, 0, 0];
				}
			} else {
				if (withValidIndex) {
					return [0, 0, 1, 0];
				} else {
					return [0, 0, 0, 0];
				}
			}
		}
	}

	function buildExpectedValues(options: MultiTestOptions) {
		const {existingAttrib, attribType, attribSize, withExpression, withValidIndex} = options;

		if (attribType == AttribType.NUMERIC) {
			const valueN = buildExpectedNumericValue(options);

			switch (attribSize) {
				case 1: {
					return valueN;
				}
				case 2: {
					return valueN.map((v) => new Vector2(v, v).toArray());
				}
				case 3: {
					return valueN.map((v) => new Vector3(v, v, v).toArray());
				}
				case 4: {
					return valueN.map((v) => new Vector4(v, v, v, v).toArray());
				}
			}
		} else {
			if (existingAttrib) {
				if (withExpression) {
					if (withValidIndex) {
						return ['defaultStringVal', 'defaultStringVal', 'pt14', 'defaultStringVal'];
					} else {
						return ['defaultStringVal', 'defaultStringVal', 'defaultStringVal', 'defaultStringVal'];
					}
				} else {
					if (withValidIndex) {
						return ['defaultStringVal', 'defaultStringVal', 'a', 'defaultStringVal'];
					} else {
						return ['defaultStringVal', 'defaultStringVal', 'defaultStringVal', 'defaultStringVal'];
					}
				}
			} else {
				if (withExpression) {
					if (withValidIndex) {
						return ['', '', 'pt14', ''];
					} else {
						return ['', '', '', ''];
					}
				} else {
					if (withValidIndex) {
						return ['', '', 'a', ''];
					} else {
						return ['', '', '', ''];
					}
				}
			}
		}
	}

	async function testOptions(options: MultiTestOptions, i: number) {
		const {existingAttrib, attribClass, attribType, attribSize, withExpression, withValidIndex} = options;
		// if (i != 81) {
		// 	return;
		// }
		// console.log(i, options);
		const children = [...geo1.children()];
		for (let child of children) {
			geo1.removeNode(child);
		}

		const attribName = 'test';
		const plane1 = geo1.createNode('plane');
		plane1.setName(`plane_${i}`);
		const merge1 = geo1.createNode('merge');
		merge1.setInput(0, plane1);
		merge1.setInput(1, plane1);
		merge1.setInput(2, plane1);
		merge1.setInput(3, plane1);
		const geoSource = attribClass == AttribClass.VERTEX ? plane1 : merge1;
		const attribSetAtIndex1 = geo1.createNode('attribSetAtIndex');
		attribSetAtIndex1.setName(`attribCreate_main_${i}`);

		attribSetAtIndex1.setAttribClass(attribClass);
		attribSetAtIndex1.setAttribType(attribType);
		attribSetAtIndex1.p.name.set(attribName);
		attribSetAtIndex1.p.size.set(attribSize);
		if (attribType == AttribType.NUMERIC) {
			assignVParamNumeric(attribSetAtIndex1, withExpression ? '7*2' : 1);
		} else {
			attribSetAtIndex1.p.string.set(withExpression ? 'pt`7*2`' : 'a');
		}
		attribSetAtIndex1.p.index.set(withValidIndex ? 2 : 999);

		const attribCreate_tmp = geo1.createNode('attribCreate');
		attribCreate_tmp.setName(`attribCreate_tmp_${i}`);
		if (existingAttrib) {
			attribCreate_tmp.setAttribClass(attribClass);
			attribCreate_tmp.setAttribType(attribType);
			attribCreate_tmp.p.name.set(attribName);
			attribCreate_tmp.p.size.set(attribSize);
			if (attribType == AttribType.NUMERIC) {
				assignVParamNumeric(attribCreate_tmp, 7);
			} else {
				attribCreate_tmp.p.string.set('defaultStringVal');
			}
			attribCreate_tmp.setInput(0, geoSource);
			attribSetAtIndex1.setInput(0, attribCreate_tmp);
		} else {
			attribSetAtIndex1.setInput(0, geoSource);
		}
		const container = await attribSetAtIndex1.compute();
		// assert.notOk(attribCreate1.states.error.active());
		// assert.notOk(attribCreate1.states.error.message());
		const pts = container.coreContent()!.points();
		const coreObjects = container.coreContent()!.coreObjects();
		const entities = attribClass == AttribClass.VERTEX ? pts : coreObjects;

		// if (existingAttrib) {
		const expectedValues = buildExpectedValues(options);
		assert.deepEqual(
			entities.map((p: CoreEntity) => {
				const v = p.attribValue(attribName);
				return CoreType.isVector(v) ? v.toArray() : v;
			}),
			expectedValues,
			`${i}-${JSON.stringify(options)}`
		);
		// } else {
		// 	assert.equal(attribSetAtIndex1.states.error.message(), `attribute 'test' not found`);
		// }
	}

	const existingAttribs: boolean[] = [true, false];
	const attribClasses: AttribClass[] = [AttribClass.VERTEX, AttribClass.OBJECT];
	const attribTypes: AttribType[] = [AttribType.NUMERIC, AttribType.STRING];
	const attribSizes: AttribSize[] = [1, 2, 3, 4];
	const withExpressions: boolean[] = [true, false];
	const withValidIndices: boolean[] = [true, false];

	let i = 0;

	for (let existingAttrib of existingAttribs) {
		for (let attribClass of attribClasses) {
			for (let attribType of attribTypes) {
				for (let attribSize of attribSizes) {
					for (let withExpression of withExpressions) {
						for (let withValidIndex of withValidIndices) {
							const options: MultiTestOptions = {
								existingAttrib,
								attribClass,
								attribType,
								attribSize,
								withExpression,
								withValidIndex,
							};
							await testOptions(options, i);
							i++;
						}
					}
				}
			}
		}
	}
});
