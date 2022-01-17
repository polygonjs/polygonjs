import {TypedGlNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {GlConnectionPointType} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {ShaderName} from '../utils/shaders/ShaderName';
import {VaryingGLDefinition} from './utils/GLDefinition';
import {ThreeToGl} from '../../../core/ThreeToGl';

const VARYING_NODE_AVAILABLE_GL_TYPES = [
	GlConnectionPointType.FLOAT,
	GlConnectionPointType.VEC2,
	GlConnectionPointType.VEC3,
	GlConnectionPointType.VEC4,
];

class VaryingWriteGlParamsConfig extends NodeParamsConfig {
	name = ParamConfig.STRING('');
	type = ParamConfig.INTEGER(0, {
		menu: {
			entries: VARYING_NODE_AVAILABLE_GL_TYPES.map((name, i) => {
				return {name: name, value: i};
			}),
		},
	});
}
const ParamsConfig = new VaryingWriteGlParamsConfig();
export class VaryingWriteGlNode extends TypedGlNode<VaryingWriteGlParamsConfig> {
	paramsConfig = ParamsConfig;
	static type(): Readonly<'varyingWrite'> {
		return 'varyingWrite';
	}
	static readonly INPUT_NAME = 'vertex';

	private _on_create_set_name_if_none_bound = this._on_create_set_name_if_none.bind(this);
	initializeNode() {
		this.addPostDirtyHook('_set_mat_to_recompile', this._set_mat_to_recompile.bind(this));
		this.lifecycle.onCreate(this._on_create_set_name_if_none_bound);
		this.io.connection_points.initializeNode();

		this.io.connection_points.set_input_name_function(() => {
			return this.input_name;
		});

		this.io.connection_points.set_expected_input_types_function(() => [
			VARYING_NODE_AVAILABLE_GL_TYPES[this.pv.type],
		]);
		this.io.connection_points.set_expected_output_types_function(() => []);
	}

	get input_name() {
		return VaryingWriteGlNode.INPUT_NAME;
	}

	setLines(shaders_collection_controller: ShadersCollectionController) {
		if (shaders_collection_controller.current_shader_name == ShaderName.VERTEX) {
			const gl_type = this.gl_type();
			if (!gl_type) {
				return;
			}
			const varying_name = this.pv.name;
			const definition = new VaryingGLDefinition(this, gl_type, varying_name);

			// add vertex lines
			const input = ThreeToGl.any(this.variableForInput(VaryingWriteGlNode.INPUT_NAME));
			const vertex_body_line = `${varying_name} = ${input}`;
			shaders_collection_controller.addDefinitions(this, [definition], ShaderName.VERTEX);
			shaders_collection_controller.addBodyLines(this, [vertex_body_line], ShaderName.VERTEX);
		}
	}

	get attribute_name(): string {
		return this.pv.name.trim();
	}
	gl_type(): GlConnectionPointType | undefined {
		const connection_point = this.io.inputs.namedInputConnectionPoints()[0];
		if (connection_point) {
			return connection_point.type();
		}
	}
	set_gl_type(type: GlConnectionPointType) {
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
