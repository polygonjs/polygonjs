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
} from '../../nodes/gl/_Math_Arg1';

import {
	DistanceGlNode,
	DotGlNode,
	MaxGlNode,
	MinGlNode,
	ModGlNode,
	PowGlNode,
	ReflectGlNode,
	StepGlNode,
} from '../../nodes/gl/_Math_Arg2';

import {AndGlNode, OrGlNode} from '../../nodes/gl/_Math_Arg2Boolean';
import {AlignGlNode} from '../../nodes/gl/Align';
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
import {RefractGlNode} from '../../nodes/gl/Refract';
import {QuatMultGlNode} from '../../nodes/gl/QuatMult';
import {QuatFromAxisAngleGlNode} from '../../nodes/gl/QuatFromAxisAngle';
import {QuatToAngleGlNode} from '../../nodes/gl/QuatToAngle';
import {QuatToAxisGlNode} from '../../nodes/gl/QuatToAxis';

export interface GlNodeChildrenMap {
	abs: AbsGlNode;
	acos: AcosGlNode;
	align: AlignGlNode;
	and: AndGlNode;
	asin: AsinGlNode;
	atan: AtanGlNode;
	attribute: AttributeGlNode;
	ceil: CeilGlNode;
	constant: ConstantGlNode;
	cos: CosGlNode;
	complement: ComplementGlNode;
	degrees: DegreesGlNode;
	distance: DistanceGlNode;
	dot: DotGlNode;
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
	max: MaxGlNode;
	min: MinGlNode;
	mod: ModGlNode;
	negate: NegateGlNode;
	normalize: NormalizeGlNode;
	null: NullGlNode;
	radians: RadiansGlNode;
	or: OrGlNode;
	output: OutputGlNode;
	param: ParamGlNode;
	pow: PowGlNode;
	reflect: ReflectGlNode;
	refract: RefractGlNode;
	sign: SignGlNode;
	sin: SinGlNode;
	sqrt: SqrtGlNode;
	step: StepGlNode;
	tan: TanGlNode;
	quat_mult: QuatMultGlNode;
	quat_from_axis_angle: QuatFromAxisAngleGlNode;
	quat_to_angle: QuatToAngleGlNode;
	quat_to_axis: QuatToAxisGlNode;
}

import {Poly} from '../../Poly';
export class GlRegister {
	static run(poly: Poly) {
		poly.register_node(AbsGlNode, CATEGORY_GL.MATH);
		poly.register_node(AcosGlNode, CATEGORY_GL.TRIGO);
		poly.register_node(AlignGlNode, CATEGORY_GL.TRIGO);
		poly.register_node(AndGlNode, CATEGORY_GL.LOGIC);
		poly.register_node(AsinGlNode, CATEGORY_GL.TRIGO);
		poly.register_node(AtanGlNode, CATEGORY_GL.TRIGO);
		poly.register_node(AttributeGlNode, CATEGORY_GL.GLOBALS);
		poly.register_node(CeilGlNode, CATEGORY_GL.MATH);
		poly.register_node(CosGlNode, CATEGORY_GL.TRIGO);
		poly.register_node(ConstantGlNode, CATEGORY_GL.GLOBALS);
		poly.register_node(ComplementGlNode, CATEGORY_GL.MATH);
		poly.register_node(DegreesGlNode, CATEGORY_GL.CONVERSION);
		poly.register_node(DistanceGlNode, CATEGORY_GL.GEOMETRY);
		poly.register_node(DotGlNode, CATEGORY_GL.GEOMETRY);
		poly.register_node(ExpGlNode, CATEGORY_GL.MATH);
		poly.register_node(Exp2GlNode, CATEGORY_GL.MATH);
		poly.register_node(FloatToVec3GlNode, CATEGORY_GL.CONVERSION);
		poly.register_node(FloorGlNode, CATEGORY_GL.MATH);
		poly.register_node(FractGlNode, CATEGORY_GL.MATH);
		poly.register_node(GlobalsGlNode, CATEGORY_GL.GLOBALS);
		poly.register_node(InverseSqrtGlNode, CATEGORY_GL.MATH);
		poly.register_node(LengthGlNode, CATEGORY_GL.GEOMETRY);
		poly.register_node(NegateGlNode, CATEGORY_GL.MATH);
		poly.register_node(LogGlNode, CATEGORY_GL.MATH);
		poly.register_node(Log2GlNode, CATEGORY_GL.MATH);
		poly.register_node(MaxGlNode, CATEGORY_GL.MATH);
		poly.register_node(MinGlNode, CATEGORY_GL.MATH);
		poly.register_node(ModGlNode, CATEGORY_GL.MATH);
		poly.register_node(NullGlNode, CATEGORY_GL.UTIL);
		poly.register_node(NormalizeGlNode, CATEGORY_GL.MATH);
		poly.register_node(OrGlNode, CATEGORY_GL.LOGIC);
		poly.register_node(OutputGlNode, CATEGORY_GL.GLOBALS);
		poly.register_node(ParamGlNode, CATEGORY_GL.GLOBALS);
		poly.register_node(PowGlNode, CATEGORY_GL.MATH);
		poly.register_node(QuatMultGlNode, CATEGORY_GL.QUAT);
		poly.register_node(QuatFromAxisAngleGlNode, CATEGORY_GL.QUAT);
		poly.register_node(QuatToAngleGlNode, CATEGORY_GL.QUAT);
		poly.register_node(QuatToAxisGlNode, CATEGORY_GL.QUAT);
		poly.register_node(RadiansGlNode, CATEGORY_GL.CONVERSION);
		poly.register_node(ReflectGlNode, CATEGORY_GL.GEOMETRY);
		poly.register_node(RefractGlNode, CATEGORY_GL.GEOMETRY);
		poly.register_node(SignGlNode, CATEGORY_GL.MATH);
		poly.register_node(SinGlNode, CATEGORY_GL.TRIGO);
		poly.register_node(StepGlNode, CATEGORY_GL.GEOMETRY);
		poly.register_node(SqrtGlNode, CATEGORY_GL.MATH);
		poly.register_node(TanGlNode, CATEGORY_GL.TRIGO);
	}
}
