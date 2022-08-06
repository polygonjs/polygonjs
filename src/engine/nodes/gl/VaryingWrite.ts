import {GlType} from './../../poly/registers/nodes/types/Gl';
/**
 * this node works alongside [gl/varyingRead](/docs/nodes/gl/varyingRead) and they allow a finer grained control over
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
	override paramsConfig = ParamsConfig;
	static override type(): Readonly<GlType.VARYING_WRITE> {
		return GlType.VARYING_WRITE;
	}
	static readonly INPUT_NAME = 'vertex';

	override initializeNode() {
		this.addPostDirtyHook('_setMatToRecompile', this._setMatToRecompile.bind(this));
		this.io.connection_points.initializeNode();

		this.io.connection_points.set_input_name_function(() => {
			return this.inputName();
		});

		this.io.connection_points.set_expected_input_types_function(() => [
			VARYING_NODE_AVAILABLE_GL_TYPES[this.pv.type],
		]);
		this.io.connection_points.set_expected_output_types_function(() => []);
	}

	inputName() {
		return VaryingWriteGlNode.INPUT_NAME;
	}

	override setLines(shaders_collection_controller: ShadersCollectionController) {
		if (shaders_collection_controller.currentShaderName() == ShaderName.VERTEX) {
			const glType = this.glType();
			if (!glType) {
				return;
			}
			const varyingName = this.pv.name;
			const definition = new VaryingGLDefinition(this, glType, varyingName);

			// add vertex lines
			const input = ThreeToGl.any(this.variableForInput(VaryingWriteGlNode.INPUT_NAME));
			const vertexBodyLine = `${varyingName} = ${input}`;
			shaders_collection_controller.addDefinitions(this, [definition], ShaderName.VERTEX);
			shaders_collection_controller.addBodyLines(this, [vertexBodyLine], ShaderName.VERTEX);
		}
	}

	attributeName(): string {
		return this.pv.name.trim();
	}
	glType(): GlConnectionPointType | undefined {
		const connection_point = this.io.inputs.namedInputConnectionPoints()[0];
		if (connection_point) {
			return connection_point.type();
		}
	}
	setGlType(type: GlConnectionPointType) {
		this.p.type.set(VARYING_NODE_AVAILABLE_GL_TYPES.indexOf(type));
	}
}
