/**
 * Allows to create a uniform which can be modified from the material params panel
 *
 *
 */
import {TypedGlNode} from './_Base';
import {
	GL_CONNECTION_POINT_TYPES,
	// GlConnectionPoint,
	GlConnectionPointType,
	GlConnectionPointInitValueMap,
	GlConnectionPointTypeToParamTypeMap,
} from '../utils/io/connections/Gl';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ParamType} from '../../poly/ParamType';
import {UniformGLDefinition} from './utils/GLDefinition';
import {ParamConfigsController} from '../utils/code/controllers/ParamConfigsController';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
// import {GlConnectionsController} from './utils/GLConnectionsController';
import {GlParamConfig} from './code/utils/ParamConfig';
import {CoreType} from '../../../core/Type';
class ParamGlParamsConfig extends NodeParamsConfig {
	name = ParamConfig.STRING('param1');
	type = ParamConfig.INTEGER(GL_CONNECTION_POINT_TYPES.indexOf(GlConnectionPointType.FLOAT), {
		menu: {
			entries: GL_CONNECTION_POINT_TYPES.map((name, i) => {
				return {name: name, value: i};
			}),
		},
	});
	asColor = ParamConfig.BOOLEAN(0, {
		visibleIf: {type: GL_CONNECTION_POINT_TYPES.indexOf(GlConnectionPointType.VEC3)},
	});
}
const ParamsConfig = new ParamGlParamsConfig();

export class ParamGlNode extends TypedGlNode<ParamGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type(): Readonly<'param'> {
		return 'param';
	}
	// protected _allow_inputs_created_from_params: boolean = false;
	override initializeNode() {
		this.addPostDirtyHook('_setMatToRecompile', this._setMatToRecompile.bind(this));
		this.lifecycle.onAfterAdded(this._setMatToRecompile.bind(this));
		this.lifecycle.onBeforeDeleted(this._setMatToRecompile.bind(this));
		this.io.connection_points.initializeNode();

		this.io.connection_points.set_expected_input_types_function(() => []);
		this.io.connection_points.set_expected_output_types_function(() => [GL_CONNECTION_POINT_TYPES[this.pv.type]]);
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const glType = GL_CONNECTION_POINT_TYPES[this.pv.type];
		const uniformName = this.uniformName();

		const output_connection_point = this.io.outputs.namedOutputConnectionPoints()[0];
		if (output_connection_point) {
			// a body is needed for each node,
			// otherwise, if there are 2 params referencing the same uniform
			// that creates conflicts
			const output_name = output_connection_point.name();
			const out = this.glVarName(output_name);

			const bodyLine = `${glType} ${out} = ${uniformName}`;
			shadersCollectionController.addBodyLines(this, [bodyLine]);
		}

		const definition = new UniformGLDefinition(this, glType, uniformName);
		shadersCollectionController.addDefinitions(this, [definition]);
	}
	override paramsGenerating() {
		return true;
	}
	override setParamConfigs() {
		const gl_type = GL_CONNECTION_POINT_TYPES[this.pv.type];
		const default_value = GlConnectionPointInitValueMap[gl_type];
		let param_type = GlConnectionPointTypeToParamTypeMap[gl_type];

		this._param_configs_controller = this._param_configs_controller || new ParamConfigsController();
		this._param_configs_controller.reset();

		if (
			param_type == ParamType.VECTOR3 &&
			this.p.asColor.value &&
			CoreType.isArray(default_value) &&
			default_value.length == 3
		) {
			const param_config = new GlParamConfig(ParamType.COLOR, this.pv.name, default_value, this.uniformName());
			this._param_configs_controller.push(param_config);
		} else {
			const param_config = new GlParamConfig(param_type, this.pv.name, default_value, this.uniformName());
			this._param_configs_controller.push(param_config);
		}
	}
	// override glVarName(name?: string) {
	// 	if (name) {
	// 		return super.glVarName(name);
	// 	}
	// 	return `v_POLY_param_${this.pv.name}`;
	// }
	uniformName() {
		return `v_POLY_param_${this.pv.name}`;
		// const output_connection_point = this.io.outputs.namedOutputConnectionPoints()[0];
		// const var_name = this.glVarName(/*output_connection_point.name()*/);
		// return var_name;
	}
	setGlType(type: GlConnectionPointType) {
		const index = GL_CONNECTION_POINT_TYPES.indexOf(type);
		this.p.type.set(index);
	}
}
