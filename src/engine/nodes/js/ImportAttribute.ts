/**
 * reads an entity attribute for a given index
 *
 *
 */
import {TypedJsNode} from './_Base';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {JsConnectionPointType} from '../utils/io/connections/Js';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {PointBuilderFunctionDataAttributeDataItem} from './code/assemblers/pointBuilder/_BasePointBuilderPersistedConfig';
import {Poly} from '../../Poly';
import {defaultObject} from './_BaseObject3D';

export const ATTRIBUTE_NODE_AVAILABLE_JS_TYPES = [
	JsConnectionPointType.COLOR,
	JsConnectionPointType.FLOAT,
	JsConnectionPointType.INT,
	JsConnectionPointType.VECTOR2,
	JsConnectionPointType.VECTOR3,
	JsConnectionPointType.VECTOR4,
];
export enum ImportAttributeJsNodeInput {
	INDEX = 'index',
}
export enum ImportAttributeJsNodeOutput {
	VAL = 'val',
}

class ImportAttributeJsParamsConfig extends NodeParamsConfig {
	name = ParamConfig.STRING('');
	type = ParamConfig.INTEGER(0, {
		menu: {
			entries: ATTRIBUTE_NODE_AVAILABLE_JS_TYPES.map((name, i) => {
				return {name: name, value: i};
			}),
		},
	});
	/** @param entity index */
	index = ParamConfig.INTEGER(0);
}
const ParamsConfig = new ImportAttributeJsParamsConfig();

export class ImportAttributeJsNode extends TypedJsNode<ImportAttributeJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return JsType.IMPORT_ATTRIBUTE;
	}

	override initializeNode() {
		this.io.connection_points.initializeNode();

		this.io.connection_points.set_expected_input_types_function(() => this._expectedInputTypes());
		this.io.connection_points.set_input_name_function((index: number) => this.inputName());
		this.io.connection_points.set_expected_output_types_function(() => [this._expectedOutputType()]);
	}

	private _expectedInputTypes() {
		return [JsConnectionPointType.INT];
	}
	private _expectedOutputType() {
		return ATTRIBUTE_NODE_AVAILABLE_JS_TYPES[this.pv.type];
	}

	inputName() {
		return ImportAttributeJsNodeInput.INDEX;
	}
	outputName() {
		return ImportAttributeJsNodeOutput.VAL;
	}

	attribData(): PointBuilderFunctionDataAttributeDataItem {
		return {
			attribName: this.attributeName(),
			attribType: this.jsType(),
		};
	}
	attributeName(): string {
		return this.pv.name.trim();
	}
	jsType() {
		const connectionPoints = this.io.outputs.namedOutputConnectionPoints();
		if (!connectionPoints) {
			return JsConnectionPointType.FLOAT;
		}
		return connectionPoints[0].type();
	}
	setJsType(type: JsConnectionPointType) {
		this.p.type.set(ATTRIBUTE_NODE_AVAILABLE_JS_TYPES.indexOf(type));
	}

	override setLines(linesController: JsLinesCollectionController) {
		const primitiveGraph = defaultObject(linesController);
		const index = this.variableForInputParam(linesController, this.p.index);
		const attribName = this.variableForInputParam(linesController, this.p.name);
		const out = this.jsVarName(ImportAttributeJsNodeOutput.VAL);

		const func = Poly.namedFunctionsRegister.getFunction('importPrimitiveAttributeNumber', this, linesController);
		const bodyLine = func.asString(primitiveGraph, attribName, index);
		linesController.addBodyOrComputed(this, [{dataType: JsConnectionPointType.INT, varName: out, value: bodyLine}]);
	}
}
