/**
 * allows to set up complex animations using keyframes
 *
 *
 */

import {NodeParamsConfig, ParamConfig} from './../utils/params/ParamsConfig';
import {TypedJsNode} from './_Base';
import {JsConnectionPointType} from '../utils/io/connections/Js';
import {ChannelData} from '../../../core/keyframes/KeyframeCommon';
import {sampleData, sampleData0} from '../../../core/keyframes/KeyframeSamples';
import {rangeStartEnd} from '../../../core/ArrayUtils';
import {IntegerParam} from '../../params/Integer';
import {StringParam} from '../../params/String';
import {ConstantJsDefinition} from './utils/JsDefinition';
import {Poly} from '../../Poly';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {channelDataToString} from '../../../core/keyframes/KeyframeSerialize';
import {createVariable} from './code/assemblers/_BaseJsPersistedConfigUtils';
import {isArray} from '../../../core/Type';
import {_setArrayLength} from '../../functions/_ArrayUtils';

interface VectorLinesOptions {
	outputName: string;
	channelIndex: number;
	dataType: JsConnectionPointType.VECTOR2 | JsConnectionPointType.VECTOR3 | JsConnectionPointType.VECTOR4;
	channelCreate: 'channelVector2' | 'channelVector3' | 'channelVector4';
	channelGetValue: 'channelValueVector2' | 'channelValueVector3' | 'channelValueVector4';
}

// const INIT_DATA: ChannelsData = {
// 	depth: SAMPLE_DATA
// };
enum KeyframesJsNodeInputName {
	time = 'time',
}

type AvailableJsConnectionType =
	| JsConnectionPointType.FLOAT
	| JsConnectionPointType.VECTOR2
	| JsConnectionPointType.VECTOR3
	| JsConnectionPointType.VECTOR4;
export const AVAILABLE_JS_CONNECTION_POINT_TYPES: AvailableJsConnectionType[] = [
	JsConnectionPointType.FLOAT,
	JsConnectionPointType.VECTOR2,
	JsConnectionPointType.VECTOR3,
	JsConnectionPointType.VECTOR4,
];
export const ARRAY_SIZE_BY_TYPE: Record<AvailableJsConnectionType, number> = {
	[JsConnectionPointType.FLOAT]: 1,
	[JsConnectionPointType.VECTOR2]: 2,
	[JsConnectionPointType.VECTOR3]: 3,
	[JsConnectionPointType.VECTOR4]: 4,
};
export const CHANNEL_SUFFIX_BY_CHANNEL_INDEX: string[] = ['x', 'y', 'z', 'w'];

function visibleIfChannelsCountAtLeast(index: number) {
	return {
		visibleIf: rangeStartEnd(index + 1, 10).map((i) => ({channelsCount: i})),
	};
}
function channelTypeParam(index: number) {
	return ParamConfig.INTEGER(AVAILABLE_JS_CONNECTION_POINT_TYPES.indexOf(JsConnectionPointType.FLOAT), {
		menu: {
			entries: AVAILABLE_JS_CONNECTION_POINT_TYPES.map((name, i) => {
				return {name: name, value: i};
			}),
		},
		separatorBefore: true,
		...visibleIfChannelsCountAtLeast(index),
	});
}
function channelNameParam(index: number) {
	return ParamConfig.STRING(`channel${index}`, {
		...visibleIfChannelsCountAtLeast(index),
	});
}
function channelDataParam(index: number) {
	return ParamConfig.STRING(channelDataToString(sampleData()), {
		...visibleIfChannelsCountAtLeast(index),
	});
}
export function channelDataInputName(index: number) {
	return `data${index}`;
}
class KeyframesJsParamsConfig extends NodeParamsConfig {
	// main = ParamConfig.FOLDER();
	// time = ParamConfig.FLOAT(0, {
	// 	step: 0.001,
	// });
	channels = ParamConfig.FOLDER();
	channelsCount = ParamConfig.INTEGER(1, {
		range: [0, 10],
		rangeLocked: [true, true],
	});
	channelType0 = channelTypeParam(0);
	channelName0 = channelNameParam(0);
	data0 = channelDataParam(0);
	channelType1 = channelTypeParam(1);
	channelName1 = channelNameParam(1);
	data1 = channelDataParam(1);
	channelType2 = channelTypeParam(2);
	channelName2 = channelNameParam(2);
	data2 = channelDataParam(2);
	channelType3 = channelTypeParam(3);
	channelName3 = channelNameParam(3);
	data3 = channelDataParam(3);
	channelType4 = channelTypeParam(4);
	channelName4 = channelNameParam(4);
	data4 = channelDataParam(4);
	channelType5 = channelTypeParam(5);
	channelName5 = channelNameParam(5);
	data5 = channelDataParam(5);
	channelType6 = channelTypeParam(6);
	channelName6 = channelNameParam(6);
	data6 = channelDataParam(6);
	channelType7 = channelTypeParam(7);
	channelName7 = channelNameParam(7);
	data7 = channelDataParam(7);
	channelType8 = channelTypeParam(8);
	channelName8 = channelNameParam(8);
	data8 = channelDataParam(8);
	channelType9 = channelTypeParam(9);
	channelName9 = channelNameParam(9);
	data9 = channelDataParam(9);
	spare = ParamConfig.FOLDER();
}
const ParamsConfig = new KeyframesJsParamsConfig();

export class KeyframesJsNode extends TypedJsNode<KeyframesJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return JsType.KEYFRAMES;
	}

	override initializeNode() {
		super.initializeNode();

		this.io.connection_points.set_input_name_function(this._expectedInputName.bind(this));
		this.io.connection_points.set_expected_input_types_function(this._expectedInputTypes.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expectedOutputTypes.bind(this));
		this.io.connection_points.set_output_name_function(this._expectedOutputName.bind(this));
	}

	channelTypeParams(): IntegerParam[] {
		return [
			this.p.channelType0,
			this.p.channelType1,
			this.p.channelType2,
			this.p.channelType3,
			this.p.channelType4,
			this.p.channelType5,
			this.p.channelType6,
			this.p.channelType7,
			this.p.channelType8,
			this.p.channelType9,
		];
	}
	channelNameParams(): StringParam[] {
		return [
			this.p.channelName0,
			this.p.channelName1,
			this.p.channelName2,
			this.p.channelName3,
			this.p.channelName4,
			this.p.channelName5,
			this.p.channelName6,
			this.p.channelName7,
			this.p.channelName8,
			this.p.channelName9,
		];
	}
	channelDataParams(): StringParam[] {
		return [
			this.p.data0,
			this.p.data1,
			this.p.data2,
			this.p.data3,
			this.p.data4,
			this.p.data5,
			this.p.data6,
			this.p.data7,
			this.p.data8,
			this.p.data9,
		];
	}
	// dataParam(channelName: string) {
	// 	const paramIndex = this.channelNameParams().findIndex((param) => param.value === channelName);
	// 	return this.channelDataParams()[paramIndex];
	// }

	// channelsData(target: ChannelsData) {
	// 	// const data: ChannelsData = {};
	// 	const existingChannelNames = Object.keys(target);
	// 	for (const channelName of existingChannelNames) {
	// 		delete target[channelName];
	// 	}

	// 	const count = this.pv.channelsCount;
	// 	for (let i = 0; i < count; i++) {
	// 		const channelName = this._channelNameParams()[i].value;
	// 		const channelData = JSON.parse(this.channelDataParams()[i].value);
	// 		target[channelName] = channelData;
	// 	}
	// }

	setChannelType(index: number, type: AvailableJsConnectionType) {
		const param = this.channelTypeParams()[index];
		if (!param) {
			return;
		}
		param.set(AVAILABLE_JS_CONNECTION_POINT_TYPES.indexOf(type));
	}
	setChannelName(index: number, inputName: string) {
		const param = this.channelNameParams()[index];
		if (!param) {
			return;
		}
		param.set(inputName);
	}
	setChannelData(index: number, data: ChannelData[]) {
		const param = this.channelDataParams()[index];
		if (!param) {
			return;
		}
		const expectedArraySize = ARRAY_SIZE_BY_TYPE[this._expectedOutputTypes()[index]];
		if (expectedArraySize > 1) {
			param.set(JSON.stringify(data));
		} else {
			const firstElem = data[0];
			param.set(JSON.stringify(firstElem));
		}
	}
	channelData(index: number): ChannelData | ChannelData[] | undefined {
		const param = this.channelDataParams()[index];
		if (!param) {
			return;
		}
		const data = JSON.parse(param.value) as ChannelData | ChannelData[];
		const expectedArraySize = ARRAY_SIZE_BY_TYPE[this._expectedOutputTypes()[index]];
		if (expectedArraySize > 1) {
			// make array if not already one
			if (isArray(data)) {
				if (data.length != expectedArraySize) {
					_setArrayLength(data, expectedArraySize, sampleData0);
				}
				return data as ChannelData[];
			} else {
				const newData = [data];
				_setArrayLength(newData, expectedArraySize, sampleData0);
				return newData;
			}
		} else {
			// use first element if array
			if (isArray(data)) {
				return data[0];
			} else {
				return data;
			}
		}
	}

	protected _channelsCount(): number {
		return this.pv.channelsCount;
	}

	protected _expectedInputTypes(): JsConnectionPointType[] {
		// const count = this.pv.channelsCount;
		return [JsConnectionPointType.FLOAT]; //, ...ArrayUtils.range(0, count).map(() => JsConnectionPointType.STRING)];
	}
	protected _expectedInputName(index: number) {
		// const count = this.pv.channelsCount;
		// const dataNames: string[] = ArrayUtils.range(0, count).map((i) =>
		// 	channelDataInputName(this._expectedOutputName(i))
		// );
		return [KeyframesJsNodeInputName.time][index];
	}

	protected _expectedOutputTypes() {
		const count = this._channelsCount();
		const params: IntegerParam[] = this.channelTypeParams();
		return rangeStartEnd(0, count).map((value, i) => AVAILABLE_JS_CONNECTION_POINT_TYPES[params[i].value]);
	}

	protected _expectedOutputName(index: number) {
		const params: StringParam[] = this.channelNameParams();
		return params[index].value;
	}

	override setLines(linesController: JsLinesCollectionController) {
		const time = this.variableForInput(linesController, KeyframesJsNodeInputName.time);
		const usedOutputNames = this.io.outputs.used_output_names();

		const _f = (outputName: string, channelIndex: number) => {
			if (!usedOutputNames.includes(outputName)) {
				return;
			}
			const funcCurve = Poly.namedFunctionsRegister.getFunction('channelFloat', this, linesController);
			const funcCurveValue = Poly.namedFunctionsRegister.getFunction('channelValueFloat', this, linesController);
			const curve = this.jsVarName(`${outputName}_CURVE`);
			const out = this.jsVarName(outputName);
			linesController.addDefinitions(this, [
				new ConstantJsDefinition(
					this,
					linesController,
					JsConnectionPointType.FLOAT,
					curve,
					funcCurve.asString(this.channelDataParams()[channelIndex].value)
				),
			]);

			linesController.addBodyOrComputed(this, [
				{
					dataType: JsConnectionPointType.FLOAT,
					varName: out,
					value: funcCurveValue.asString(linesController.assembler().memberReference(curve), time),
				},
			]);
		};
		const _v = (options: VectorLinesOptions) => {
			const {outputName, channelIndex, dataType, channelCreate, channelGetValue} = options;
			if (!usedOutputNames.includes(outputName)) {
				return;
			}
			const funcCurve = Poly.namedFunctionsRegister.getFunction(channelCreate, this, linesController);
			const funcCurveValue = Poly.namedFunctionsRegister.getFunction(channelGetValue, this, linesController);
			const variable = createVariable(dataType);

			const curve = this.jsVarName(`${outputName}_CURVE`);
			const out = this.jsVarName(outputName);
			linesController.addDefinitions(this, [
				new ConstantJsDefinition(
					this,
					linesController,
					dataType,
					curve,
					funcCurve.asString(this.channelDataParams()[channelIndex].value)
				),
			]);
			if (variable) {
				const tmpVarName = linesController.addVariable(this, variable);
				linesController.addBodyOrComputed(this, [
					{
						dataType,
						varName: out,
						value: funcCurveValue.asString(
							linesController.assembler().memberReference(curve),
							time,
							tmpVarName
						),
					},
				]);
			}
		};

		const channelsCount = this._channelsCount();
		for (let channelIndex = 0; channelIndex < channelsCount; channelIndex++) {
			const outputName = this._expectedOutputName(channelIndex);
			const channelType = this._expectedOutputTypes()[channelIndex];
			switch (channelType) {
				case JsConnectionPointType.FLOAT: {
					_f(outputName, channelIndex);
					break;
				}
				case JsConnectionPointType.VECTOR2: {
					_v({
						outputName,
						channelIndex,
						dataType: channelType,
						channelCreate: 'channelVector2',
						channelGetValue: 'channelValueVector2',
					});
					break;
				}
				case JsConnectionPointType.VECTOR3: {
					_v({
						outputName,
						channelIndex,
						dataType: channelType,
						channelCreate: 'channelVector3',
						channelGetValue: 'channelValueVector3',
					});
					break;
				}
				case JsConnectionPointType.VECTOR4: {
					_v({
						outputName,
						channelIndex,
						dataType: channelType,
						channelCreate: 'channelVector4',
						channelGetValue: 'channelValueVector4',
					});
					break;
				}
			}
		}
	}
}
