/**
 * Creates hollow SDFs
 *
 * @remarks
 *
 * based on [https://iquilezles.org/articles/distfunctions/](https://iquilezles.org/articles/distfunctions/)
 */
import {BaseSDFGlNode} from './_BaseSDF';
import {PolyDictionary} from './../../../types/GlobalTypes';
import {TypedGlNode} from './_Base';
import {ThreeToGl} from '../../../core/ThreeToGl';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {GlConnectionPointType} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {JsType} from '../../poly/registers/nodes/types/Js';

enum InputName {
	SDF = 'sdf',
	THICKNESS = 'thickness',
}
const DefaultValues: PolyDictionary<number> = {
	thickness: 0.1,
};
const OUTPUT_NAME = 'sdf';
const ALLOWED_TYPES = [GlConnectionPointType.FLOAT, GlConnectionPointType.SDF_CONTEXT];
class SDFOnionGlParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new SDFOnionGlParamsConfig();
export class SDFOnionGlNode extends TypedGlNode<SDFOnionGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return JsType.SDF_ONION;
	}

	override initializeNode() {
		super.initializeNode();

		this.io.connection_points.set_input_name_function(this._glInputName.bind(this));
		this.io.connection_points.set_output_name_function(this._glOutputName.bind(this));
		this.io.connection_points.set_expected_input_types_function(this._expectedInputTypes.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expectedOutputTypes.bind(this));
	}
	override paramDefaultValue(name: string) {
		return DefaultValues[name];
	}
	private _glInputName(index: number) {
		return [InputName.SDF, InputName.THICKNESS][index];
	}
	private _glOutputName(index: number) {
		return OUTPUT_NAME;
	}
	private _expectedInputTypes() {
		let firstInputType = this.io.connection_points.first_input_connection_type();
		if (!firstInputType || ALLOWED_TYPES.includes(firstInputType)) {
			firstInputType = GlConnectionPointType.FLOAT;
		}
		return [firstInputType, GlConnectionPointType.FLOAT];
	}
	private _expectedOutputTypes() {
		return [this._expectedInputTypes()[0]];
	}
	override setLines(shadersCollectionController: ShadersCollectionController) {
		const sdf = ThreeToGl.float(this.variableForInput(InputName.SDF));
		const thickness = ThreeToGl.float(this.variableForInput(InputName.THICKNESS));

		const firstInputType = this._expectedInputTypes()[0];
		const bodyLines: string[] = [];
		if (firstInputType == GlConnectionPointType.FLOAT) {
			const float = this.glVarName(OUTPUT_NAME);
			const bodyLine = `float ${float} = SDFOnion(${sdf}, ${thickness})`;
			bodyLines.push(bodyLine);
		} else {
			const sdfContext = this.glVarName(OUTPUT_NAME);
			const matId = `${sdf}.d`;
			const bodyLine = `SDFContext ${sdfContext} = SDFContext(SDFOnion(${sdf}.d, ${thickness}), 0, ${matId}, ${matId}, 0.)`;
			bodyLines.push(bodyLine);
		}
		shadersCollectionController.addBodyLines(this, bodyLines);
		BaseSDFGlNode.addSDFMethods(shadersCollectionController, this);
	}
}
