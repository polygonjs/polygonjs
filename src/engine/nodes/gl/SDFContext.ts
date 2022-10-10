/**
 * Creates an SDF context
 *
 */
import {SDFMaterialGlNode} from './SDFMaterial';
import {GlType} from './../../poly/registers/nodes/types/Gl';
import {TypedGlNode} from './_Base';
import {ThreeToGl} from '../../../core/ThreeToGl';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {GlConnectionPointType} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';

const INPUT_NAME = {
	SDF: 'sdf',
	MATERIAL: 'material',
};
const OUTPUT_NAME = GlType.SDF_CONTEXT;
class SDFContextGlParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new SDFContextGlParamsConfig();
export class SDFContextGlNode extends TypedGlNode<SDFContextGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return GlType.SDF_CONTEXT;
	}

	override initializeNode() {
		super.initializeNode();

		this.io.connection_points.set_expected_input_types_function(this._expectedInputTypes.bind(this));
		this.io.connection_points.set_input_name_function(this._glInputNames.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expectedOutputTypes.bind(this));
		this.io.connection_points.set_output_name_function(this._glOutputNames.bind(this));
	}
	private _expectedInputTypes() {
		return [GlConnectionPointType.FLOAT, GlConnectionPointType.SDF_MATERIAL];
	}
	private _expectedOutputTypes() {
		return [GlConnectionPointType.SDF_CONTEXT];
	}
	private _glInputNames(i: number) {
		return [INPUT_NAME.SDF, INPUT_NAME.MATERIAL][i];
	}
	private _glOutputNames(i: number) {
		return [OUTPUT_NAME][i];
	}

	override setLines(shaders_collection_controller: ShadersCollectionController) {
		const sdf = ThreeToGl.float(this.variableForInput(INPUT_NAME.SDF));
		// const mat = ThreeToGl.integer(this.variableForInput(INPUT_NAME.MATERIAL));
		const materialNode = this.io.inputs.input(1);
		let matId: number | string = -1;
		if (materialNode && materialNode instanceof SDFMaterialGlNode) {
			matId = materialNode.materialIdName();
		}

		const sdfContext = this.glVarName(OUTPUT_NAME);

		const body_line = `SDFContext ${sdfContext} = SDFContext(${sdf}, ${matId}, ${matId}, 0.)`;
		shaders_collection_controller.addBodyLines(this, [body_line]);
	}
}
