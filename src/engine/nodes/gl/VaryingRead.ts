/**
 * this node works alongside [gl/varyingWrite](/docs/nodes/gl/varyingWrite) and they allow a finer grained control over
 * what is computed in the vertex or the fragment shader
 *
 *
 */

import {TypedGlNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {GlConnectionPointType} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {ShaderName} from '../utils/shaders/ShaderName';
import {VaryingGLDefinition} from './utils/GLDefinition';

const VARYING_NODE_AVAILABLE_GL_TYPES = [
	GlConnectionPointType.FLOAT,
	GlConnectionPointType.VEC2,
	GlConnectionPointType.VEC3,
	GlConnectionPointType.VEC4,
];

class VaryingReadGlParamsConfig extends NodeParamsConfig {
	name = ParamConfig.STRING('');
	type = ParamConfig.INTEGER(0, {
		menu: {
			entries: VARYING_NODE_AVAILABLE_GL_TYPES.map((name, i) => {
				return {name: name, value: i};
			}),
		},
	});
}
const ParamsConfig = new VaryingReadGlParamsConfig();
export class VaryingReadGlNode extends TypedGlNode<VaryingReadGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type(): Readonly<'varyingRead'> {
		return 'varyingRead';
	}
	static readonly OUTPUT_NAME = 'fragment';

	private _on_create_set_name_if_none_bound = this._on_create_set_name_if_none.bind(this);
	override initializeNode() {
		this.addPostDirtyHook('_setMatToRecompile', this._setMatToRecompile.bind(this));
		this.lifecycle.onAfterCreated(this._on_create_set_name_if_none_bound);
		this.io.connection_points.initializeNode();

		this.io.connection_points.set_output_name_function(() => {
			return this.outputName();
		});

		this.io.connection_points.set_expected_input_types_function(() => []);
		this.io.connection_points.set_expected_output_types_function(() => [
			VARYING_NODE_AVAILABLE_GL_TYPES[this.pv.type],
		]);
	}

	outputName() {
		return VaryingReadGlNode.OUTPUT_NAME;
	}

	override setLines(shaders_collection_controller: ShadersCollectionController) {
		if (shaders_collection_controller.current_shader_name == ShaderName.FRAGMENT) {
			const varying_name = this.pv.name;
			const definition = new VaryingGLDefinition(this, this.glType(), varying_name);

			// add fragment lines
			const out_value = this.glVarName(VaryingReadGlNode.OUTPUT_NAME);
			const body_line = `${this.glType()} ${out_value} = ${varying_name}`;
			shaders_collection_controller.addDefinitions(this, [definition]);
			shaders_collection_controller.addBodyLines(this, [body_line]);
		}
	}

	attributeName(): string {
		return this.pv.name.trim();
	}
	glType(): GlConnectionPointType {
		return this.io.outputs.namedOutputConnectionPoints()[0].type();
	}
	setGlType(type: GlConnectionPointType) {
		this.p.type.set(VARYING_NODE_AVAILABLE_GL_TYPES.indexOf(type));
	}

	//
	//
	// HOOKS
	//
	//
	private _on_create_set_name_if_none() {
		if (this.pv.name == '') {
			this.p.name.set(this.name());
		}
	}
}
