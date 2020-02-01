import {BaseNodeType} from '../_Base';
import {_Math} from 'three/src/math/Math';

// TODO: simplify GLDataType into one enum
// http://learnwebgl.brown37.net/12_shader_language/glsl_data_types.html
export enum GLDataType {
	BOOL = 'bool',
	BVEC2 = 'bvec2',
	BVEC3 = 'bvec3',
	BVEC4 = 'bvec4',
	INT = 'int',
	IVEC2 = 'ivec2',
	IVEC3 = 'ivec3',
	IVEC4 = 'ivec4',
	FLOAT = 'float',
	VEC2 = 'vec2',
	VEC3 = 'vec3',
	VEC4 = 'vec4',
	// matrices to be used later
	// MAT2 = 'mat2',
	// MAT3 = 'mat3',
	// MAT4 = 'mat4',
}
export const GLDataTypes: Array<GLDataType> = [
	GLDataType.BOOL,
	GLDataType.BVEC2,
	GLDataType.BVEC3,
	GLDataType.BVEC4,
	GLDataType.INT,
	GLDataType.IVEC2,
	GLDataType.IVEC3,
	GLDataType.IVEC4,
	GLDataType.FLOAT,
	GLDataType.VEC2,
	GLDataType.VEC3,
	GLDataType.VEC4,
];

export enum ConnectionType {
	GEOMETRY = 'geometry',
	MATRIX = 'matrix',
	INT = 'int',
	FLOAT = 'float',
	BOOL = 'bool',
	VEC2 = 'vec2',
	VEC3 = 'vec3',
	VEC4 = 'vec4',
	MAT3 = 'mat3',
	RGB = 'rgb',
	RGBA = 'rgba',
}

interface DisconnectionOptions {
	set_input?: boolean;
}

export class NodeConnection {
	private _uuid: string;

	constructor(
		private _node_src: BaseNodeType,
		private _node_dest: BaseNodeType,
		private _output_index: number = 0,
		private _input_index: number = 0
	) {
		this._uuid = _Math.generateUUID();

		this._node_src.io.connections.add_output_connection(this);
		this._node_dest.io.connections.add_input_connection(this);
	}
	get uuid() {
		return this._uuid;
	}

	get node_src() {
		return this._node_src;
	}
	get node_dest() {
		return this._node_dest;
	}
	get output_index() {
		return this._output_index;
	}
	get input_index() {
		return this._input_index;
	}

	disconnect(options: DisconnectionOptions = {}) {
		this._node_src.io.connections.remove_output_connection(this);
		this._node_dest.io.connections.remove_input_connection(this);

		if (options['set_input'] === true) {
			this._node_dest.io.inputs.set_input(this._input_index, null);
		}
	}
}
