import {CATEGORY_GL} from './Category';

import {
	AbsGlNode,
	AcosGlNode,
	AsinGlNode,
	AtanGlNode,
	CeilGlNode,
	CosGlNode,
	DegreesGlNode,
	ExpGlNode,
	Exp2GlNode,
	FloorGlNode,
	FractGlNode,
	InverseSqrtGlNode,
	LogGlNode,
	Log2GlNode,
	NormalizeGlNode,
	RadiansGlNode,
	SignGlNode,
	SinGlNode,
	SqrtGlNode,
	TanGlNode,
} from '../../nodes/gl/_Math';
import {AttributeGlNode} from '../../nodes/gl/Attribute';
import {ConstantGlNode} from '../../nodes/gl/Constant';
import {ComplementGlNode} from '../../nodes/gl/Complement';
import {FloatToVec3GlNode} from '../../nodes/gl/FloatToVec3';
import {GlobalsGlNode} from '../../nodes/gl/Globals';
import {LengthGlNode} from '../../nodes/gl/Length';
import {NegateGlNode} from '../../nodes/gl/Negate';
import {NullGlNode} from '../../nodes/gl/Null';
import {OutputGlNode} from '../../nodes/gl/Output';
import {ParamGlNode} from '../../nodes/gl/Param';
import {QuatMultGlNode} from '../../nodes/gl/QuatMult';
import {QuatToAngleGlNode} from '../../nodes/gl/QuatToAngle';
import {QuatToAxisGlNode} from '../../nodes/gl/QuatToAxis';

export interface GlNodeChildrenMap {
	abs: AbsGlNode;
	acos: AcosGlNode;
	asin: AsinGlNode;
	atan: AtanGlNode;
	attribute: AttributeGlNode;
	ceil: CeilGlNode;
	constant: ConstantGlNode;
	cos: CosGlNode;
	complement: ComplementGlNode;
	degrees: DegreesGlNode;
	exp: ExpGlNode;
	exp2: Exp2GlNode;
	float_to_vec3: FloatToVec3GlNode;
	floor: FloorGlNode;
	fract: FractGlNode;
	inverse_sqrt: InverseSqrtGlNode;
	length: LengthGlNode;
	log: LogGlNode;
	log2: Log2GlNode;
	globals: GlobalsGlNode;
	negate: NegateGlNode;
	normalize: NormalizeGlNode;
	null: NullGlNode;
	radians: RadiansGlNode;
	output: OutputGlNode;
	param: ParamGlNode;
	sign: SignGlNode;
	sin: SinGlNode;
	sqrt: SqrtGlNode;
	tan: TanGlNode;
	quat_mult: QuatMultGlNode;
	quat_to_angle: QuatToAngleGlNode;
	quat_to_axis: QuatToAxisGlNode;
}

import {Poly} from '../../Poly';
export class GlRegister {
	static run(poly: Poly) {
		const math1_nodes = [
			AbsGlNode,
			AcosGlNode,
			AsinGlNode,
			AtanGlNode,
			CeilGlNode,
			CosGlNode,
			DegreesGlNode,
			ExpGlNode,
			Exp2GlNode,
			FloorGlNode,
			FractGlNode,
			InverseSqrtGlNode,
			LogGlNode,
			Log2GlNode,
			NormalizeGlNode,
			RadiansGlNode,
			SignGlNode,
			SinGlNode,
			SqrtGlNode,
			TanGlNode,
		];
		for (let node of math1_nodes) {
			poly.register_node(node, CATEGORY_GL.MATH);
		}
		const math1b_nodes = [
			LengthGlNode,
			NegateGlNode,
			NullGlNode,
			QuatMultGlNode,
			QuatToAngleGlNode,
			QuatToAxisGlNode,
		];
		for (let node of math1b_nodes) {
			poly.register_node(node, CATEGORY_GL.MATH);
		}

		poly.register_node(AttributeGlNode, CATEGORY_GL.GLOBALS);
		poly.register_node(ConstantGlNode, CATEGORY_GL.GLOBALS);
		poly.register_node(ComplementGlNode, CATEGORY_GL.MATH);
		poly.register_node(FloatToVec3GlNode, CATEGORY_GL.CONVERSION);
		poly.register_node(GlobalsGlNode, CATEGORY_GL.GLOBALS);
		poly.register_node(OutputGlNode, CATEGORY_GL.GLOBALS);
		poly.register_node(ParamGlNode, CATEGORY_GL.GLOBALS);
	}
}
