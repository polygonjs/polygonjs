import {CATEGORY_GL} from './Category';

import {FloatToIntGlNode, IntToFloatGlNode} from '../../nodes/gl/_ConversionMisc';
import {FloatToVec2GlNode, FloatToVec3GlNode, FloatToVec4GlNode} from '../../nodes/gl/_ConversionToVec';

import {
	Vec2ToFloatGlNode,
	Vec3ToFloatGlNode,
	Vec4ToFloatGlNode,
	Vec4ToVectorGlNode,
} from '../../nodes/gl/_ConversionVecTo';

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

import {AddGlNode, DivideGlNode, MultGlNode, SubstractGlNode} from '../../nodes/gl/_Math_Arg2Operation';

import {AndGlNode, OrGlNode} from '../../nodes/gl/_Math_Arg2Boolean';
import {AlignGlNode} from '../../nodes/gl/Align';
import {AttributeGlNode} from '../../nodes/gl/Attribute';
import {ConstantGlNode} from '../../nodes/gl/Constant';
import {ComplementGlNode} from '../../nodes/gl/Complement';
import {CrossGlNode} from '../../nodes/gl/Cross';
import {CycleGlNode} from '../../nodes/gl/Cycle';
import {DiskGlNode} from '../../nodes/gl/Disk';
import {EasingGlNode} from '../../nodes/gl/Easing';
import {GlobalsGlNode} from '../../nodes/gl/Globals';
import {LengthGlNode} from '../../nodes/gl/Length';
import {MixGlNode} from '../../nodes/gl/Mix';
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
	add: AddGlNode;
	align: AlignGlNode;
	and: AndGlNode;
	asin: AsinGlNode;
	atan: AtanGlNode;
	attribute: AttributeGlNode;
	ceil: CeilGlNode;
	constant: ConstantGlNode;
	cos: CosGlNode;
	complement: ComplementGlNode;
	cross: CrossGlNode;
	cycle: CycleGlNode;
	degrees: DegreesGlNode;
	disk: DiskGlNode;
	distance: DistanceGlNode;
	divide: DivideGlNode;
	dot: DotGlNode;
	easing: EasingGlNode;
	exp: ExpGlNode;
	exp2: Exp2GlNode;
	float_to_int: FloatToIntGlNode;
	float_to_vec2: FloatToVec2GlNode;
	float_to_vec3: FloatToVec3GlNode;
	float_to_vec4: FloatToVec4GlNode;
	floor: FloorGlNode;
	fract: FractGlNode;
	int_to_float: FloatToIntGlNode;
	inverse_sqrt: InverseSqrtGlNode;
	length: LengthGlNode;
	log: LogGlNode;
	log2: Log2GlNode;
	globals: GlobalsGlNode;
	max: MaxGlNode;
	min: MinGlNode;
	mix: MixGlNode;
	mod: ModGlNode;
	mult: MultGlNode;
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
	substract: SubstractGlNode;
	tan: TanGlNode;
	quat_mult: QuatMultGlNode;
	quat_from_axis_angle: QuatFromAxisAngleGlNode;
	quat_to_angle: QuatToAngleGlNode;
	quat_to_axis: QuatToAxisGlNode;
	vec2_to_float: Vec2ToFloatGlNode;
	vec3_to_float: Vec3ToFloatGlNode;
	vec4_to_float: Vec4ToFloatGlNode;
	vec4_to_vector: Vec4ToVectorGlNode;
}

import {Poly} from '../../Poly';
export class GlRegister {
	static run(poly: Poly) {
		poly.register_node(AbsGlNode, CATEGORY_GL.MATH);
		poly.register_node(AcosGlNode, CATEGORY_GL.TRIGO);
		poly.register_node(AddGlNode, CATEGORY_GL.MATH);
		poly.register_node(AlignGlNode, CATEGORY_GL.TRIGO);
		poly.register_node(AndGlNode, CATEGORY_GL.LOGIC);
		poly.register_node(AsinGlNode, CATEGORY_GL.TRIGO);
		poly.register_node(AtanGlNode, CATEGORY_GL.TRIGO);
		poly.register_node(AttributeGlNode, CATEGORY_GL.GLOBALS);
		poly.register_node(CeilGlNode, CATEGORY_GL.MATH);
		poly.register_node(CosGlNode, CATEGORY_GL.TRIGO);
		poly.register_node(ConstantGlNode, CATEGORY_GL.GLOBALS);
		poly.register_node(ComplementGlNode, CATEGORY_GL.MATH);
		poly.register_node(CrossGlNode, CATEGORY_GL.GEOMETRY);
		poly.register_node(CycleGlNode, CATEGORY_GL.MATH);
		poly.register_node(DegreesGlNode, CATEGORY_GL.CONVERSION);
		poly.register_node(DiskGlNode, CATEGORY_GL.GEOMETRY);
		poly.register_node(DistanceGlNode, CATEGORY_GL.GEOMETRY);
		poly.register_node(DivideGlNode, CATEGORY_GL.MATH);
		poly.register_node(DotGlNode, CATEGORY_GL.GEOMETRY);
		poly.register_node(EasingGlNode, CATEGORY_GL.MATH);
		poly.register_node(ExpGlNode, CATEGORY_GL.MATH);
		poly.register_node(Exp2GlNode, CATEGORY_GL.MATH);
		poly.register_node(FloatToIntGlNode, CATEGORY_GL.CONVERSION);
		poly.register_node(FloatToVec2GlNode, CATEGORY_GL.CONVERSION);
		poly.register_node(FloatToVec3GlNode, CATEGORY_GL.CONVERSION);
		poly.register_node(FloatToVec4GlNode, CATEGORY_GL.CONVERSION);
		poly.register_node(FloorGlNode, CATEGORY_GL.MATH);
		poly.register_node(FractGlNode, CATEGORY_GL.MATH);
		poly.register_node(GlobalsGlNode, CATEGORY_GL.GLOBALS);
		poly.register_node(IntToFloatGlNode, CATEGORY_GL.CONVERSION);
		poly.register_node(InverseSqrtGlNode, CATEGORY_GL.MATH);
		poly.register_node(LengthGlNode, CATEGORY_GL.GEOMETRY);
		poly.register_node(NegateGlNode, CATEGORY_GL.MATH);
		poly.register_node(LogGlNode, CATEGORY_GL.MATH);
		poly.register_node(Log2GlNode, CATEGORY_GL.MATH);
		poly.register_node(MaxGlNode, CATEGORY_GL.MATH);
		poly.register_node(MinGlNode, CATEGORY_GL.MATH);
		poly.register_node(ModGlNode, CATEGORY_GL.MATH);
		poly.register_node(MixGlNode, CATEGORY_GL.MATH);
		poly.register_node(MultGlNode, CATEGORY_GL.MATH);
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
		poly.register_node(SqrtGlNode, CATEGORY_GL.MATH);
		poly.register_node(StepGlNode, CATEGORY_GL.GEOMETRY);
		poly.register_node(SubstractGlNode, CATEGORY_GL.MATH);
		poly.register_node(TanGlNode, CATEGORY_GL.TRIGO);
		poly.register_node(Vec2ToFloatGlNode, CATEGORY_GL.CONVERSION);
		poly.register_node(Vec3ToFloatGlNode, CATEGORY_GL.CONVERSION);
		poly.register_node(Vec4ToFloatGlNode, CATEGORY_GL.CONVERSION);
		poly.register_node(Vec4ToVectorGlNode, CATEGORY_GL.CONVERSION);
	}
}
