/**
 * Creates a constant
 *
 *
 */
import {TypedGlNode} from './_Base';
import {ThreeToGl} from '../../../core/ThreeToGl';
import {BaseParamType} from '../../params/_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {CoreType, isBooleanTrue} from '../../../core/Type';
import {PolyDictionary} from '../../../types/GlobalTypes';
import {GlConnectionPointType, GL_CONNECTION_POINT_TYPES} from '../utils/io/connections/Gl';

function typed_visible_options(type: GlConnectionPointType, otherParamVal: PolyDictionary<number | boolean> = {}) {
	const val = GL_CONNECTION_POINT_TYPES.indexOf(type);
	return {visibleIf: {type: val, ...otherParamVal}};
}

class ConstantGlParamsConfig extends NodeParamsConfig {
	type = ParamConfig.INTEGER(GL_CONNECTION_POINT_TYPES.indexOf(GlConnectionPointType.FLOAT), {
		menu: {
			entries: GL_CONNECTION_POINT_TYPES.map((name, i) => {
				return {name: name, value: i};
			}),
		},
	});
	bool = ParamConfig.BOOLEAN(0, typed_visible_options(GlConnectionPointType.BOOL));
	int = ParamConfig.INTEGER(0, typed_visible_options(GlConnectionPointType.INT));
	float = ParamConfig.FLOAT(0, typed_visible_options(GlConnectionPointType.FLOAT));
	vec2 = ParamConfig.VECTOR2([0, 0], typed_visible_options(GlConnectionPointType.VEC2));
	vec3 = ParamConfig.VECTOR3([0, 0, 0], typed_visible_options(GlConnectionPointType.VEC3, {asColor: false}));
	color = ParamConfig.COLOR([0, 0, 0], typed_visible_options(GlConnectionPointType.VEC3, {asColor: true}));
	vec4 = ParamConfig.VECTOR4([0, 0, 0, 0], typed_visible_options(GlConnectionPointType.VEC4));
	/** @param when using vec3, use toggle on it should be a color */
	asColor = ParamConfig.BOOLEAN(0, typed_visible_options(GlConnectionPointType.VEC3));
}
const ParamsConfig = new ConstantGlParamsConfig();
export class ConstantGlNode extends TypedGlNode<ConstantGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'constant';
	}
	static readonly OUTPUT_NAME = 'val';
	override initializeNode() {
		this.io.connection_points.set_output_name_function((index: number) => ConstantGlNode.OUTPUT_NAME);
		this.io.connection_points.set_expected_input_types_function(() => []);
		this.io.connection_points.set_expected_output_types_function(() => [this._currentConnectionType()]);
	}

	override setLines(shaders_collection_controller: ShadersCollectionController) {
		const param = this.currentParam();
		if (!param) {
			console.warn(`no param found for constant node for type '${this.pv.type}'`);
			return;
		}
		const value = this.currentValue();
		if (value == null) {
			console.warn(`no value found for constant node for type '${this.pv.type}'`);
			return;
		}

		const connection_type = this._currentConnectionType();
		const var_value = this._currentVarName();
		const body_line = `${connection_type} ${var_value} = ${value}`;
		shaders_collection_controller.addBodyLines(this, [body_line]);
	}

	private _currentConnectionType() {
		if (this.pv.type == null) {
			console.warn('constant gl node type if not valid');
		}
		const connection_type = GL_CONNECTION_POINT_TYPES[this.pv.type];
		if (connection_type == null) {
			console.warn('constant gl node type if not valid');
		}
		return connection_type;
	}

	currentParam(): BaseParamType {
		const type = GL_CONNECTION_POINT_TYPES[this.pv.type];
		switch (type) {
			case GlConnectionPointType.BOOL: {
				return this.p.bool;
			}
			case GlConnectionPointType.INT: {
				return this.p.int;
			}
			case GlConnectionPointType.FLOAT: {
				return this.p.float;
			}
			case GlConnectionPointType.VEC2: {
				return this.p.vec2;
			}
			case GlConnectionPointType.VEC3: {
				if (isBooleanTrue(this.pv.asColor)) {
					return this.p.color;
				} else {
					return this.p.vec3;
				}
			}
			case GlConnectionPointType.VEC4: {
				return this.p.vec4;
			}
		}
		// we should never run this
		return this.p.bool;
	}
	private _currentVarName(): string {
		return this.glVarName(ConstantGlNode.OUTPUT_NAME);
	}
	currentValue() {
		const param = this.currentParam();
		if (param) {
			let value = ThreeToGl.any(param.value);
			// ensure that it is an integer when needed
			// as ThreeToGl.any can only detect if this is a number for now
			// and therefore does not make the distinction between float and int
			if (param.name() == this.p.int.name() && CoreType.isNumber(param.value)) {
				value = ThreeToGl.integer(param.value);
			}
			return value;
		}
	}

	setGlType(type: GlConnectionPointType) {
		this.p.type.set(GL_CONNECTION_POINT_TYPES.indexOf(type));
	}
}
