import {CATEGORY_GL} from './Category';

import {FloatToIntGlNode, IntToFloatGlNode} from '../../../nodes/gl/_ConversionMisc';
import {FloatToVec2GlNode, FloatToVec3GlNode, FloatToVec4GlNode} from '../../../nodes/gl/_ConversionToVec';

import {
	Vec2ToFloatGlNode,
	Vec3ToFloatGlNode,
	Vec4ToFloatGlNode,
	Vec4ToVectorGlNode,
} from '../../../nodes/gl/_ConversionVecTo';

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
} from '../../../nodes/gl/_Math_Arg1';

import {
	DistanceGlNode,
	DotGlNode,
	MaxGlNode,
	MinGlNode,
	ModGlNode,
	PowGlNode,
	ReflectGlNode,
	StepGlNode,
} from '../../../nodes/gl/_Math_Arg2';
import {ClampGlNode, FaceforwardGlNode, SmoothStepGlNode} from '../../../nodes/gl/_Math_Arg3';

import {AddGlNode, DivideGlNode, MultGlNode, SubstractGlNode} from '../../../nodes/gl/_Math_Arg2Operation';

import {AndGlNode, OrGlNode} from '../../../nodes/gl/_Math_Arg2Boolean';
import {AccelerationGlNode} from '../../../nodes/gl/Acceleration';
import {AlignGlNode} from '../../../nodes/gl/Align';
import {AttributeGlNode} from '../../../nodes/gl/Attribute';
import {ColorCorrectGlNode} from '../../../nodes/gl/ColorCorrect';
import {CompareGlNode} from '../../../nodes/gl/Compare';
import {ComplementGlNode} from '../../../nodes/gl/Complement';
import {ConstantGlNode} from '../../../nodes/gl/Constant';
import {CrossGlNode} from '../../../nodes/gl/Cross';
import {CycleGlNode} from '../../../nodes/gl/Cycle';
import {DiskGlNode} from '../../../nodes/gl/Disk';
import {EasingGlNode} from '../../../nodes/gl/Easing';
import {FitGlNode} from '../../../nodes/gl/Fit';
import {Fit01GlNode} from '../../../nodes/gl/Fit01';
import {ForLoopGlNode} from '../../../nodes/gl/ForLoop';
import {GlobalsGlNode} from '../../../nodes/gl/Globals';
import {HsluvToRgbGlNode} from '../../../nodes/gl/HsluvToRgb';
import {HsvToRgbGlNode} from '../../../nodes/gl/HsvToRgb';
import {IfThenGlNode} from '../../../nodes/gl/IfThen';
import {InstanceTransformGlNode} from '../../../nodes/gl/InstanceTransform';
// import {LabToRgbGlNode} from '../../../nodes/gl/LabToRgb'; // TODO: still need work, not looking good
// import {LchToRgbGlNode} from '../../../nodes/gl/LchToRgb'; // TODO: still need work, not looking good
import {LengthGlNode} from '../../../nodes/gl/Length';
import {LuminanceGlNode} from '../../../nodes/gl/Luminance';
import {MixGlNode} from '../../../nodes/gl/Mix';
import {MultAddGlNode} from '../../../nodes/gl/MultAdd';
import {NegateGlNode} from '../../../nodes/gl/Negate';
import {NoiseGlNode} from '../../../nodes/gl/Noise';
import {NullGlNode} from '../../../nodes/gl/Null';
import {OutputGlNode} from '../../../nodes/gl/Output';
import {ParamGlNode} from '../../../nodes/gl/Param';
import {RefractGlNode} from '../../../nodes/gl/Refract';
import {QuatMultGlNode} from '../../../nodes/gl/QuatMult';
import {QuatFromAxisAngleGlNode} from '../../../nodes/gl/QuatFromAxisAngle';
import {QuatToAngleGlNode} from '../../../nodes/gl/QuatToAngle';
import {QuatToAxisGlNode} from '../../../nodes/gl/QuatToAxis';
import {RampGlNode} from '../../../nodes/gl/Ramp';
import {RandomGlNode} from '../../../nodes/gl/Random';
import {RgbToHsvGlNode} from '../../../nodes/gl/RgbToHsv';
import {RotateGlNode} from '../../../nodes/gl/Rotate';
import {RoundGlNode} from '../../../nodes/gl/Round';
import {SubnetGlNode} from '../../../nodes/gl/Subnet';
import {SubnetInputGlNode} from '../../../nodes/gl/SubnetInput';
import {SubnetOutputGlNode} from '../../../nodes/gl/SubnetOutput';
import {SwitchGlNode} from '../../../nodes/gl/Switch';
import {TextureGlNode} from '../../../nodes/gl/Texture';
import {TwoWaySwitchGlNode} from '../../../nodes/gl/TwoWaySwitch';
import {VectorAlignGlNode} from '../../../nodes/gl/VectorAlign';
import {VectorAngleGlNode} from '../../../nodes/gl/VectorAngle';

export interface GlNodeChildrenMap {
	abs: AbsGlNode;
	acceleration: AccelerationGlNode;
	acos: AcosGlNode;
	add: AddGlNode;
	align: AlignGlNode;
	and: AndGlNode;
	asin: AsinGlNode;
	atan: AtanGlNode;
	attribute: AttributeGlNode;
	ceil: CeilGlNode;
	clamp: ClampGlNode;
	color_correct: ColorCorrectGlNode;
	compare: CompareGlNode;
	complement: ComplementGlNode;
	constant: ConstantGlNode;
	cos: CosGlNode;
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
	face_forward: FaceforwardGlNode;
	fit: FitGlNode;
	fit01: Fit01GlNode;
	float_to_int: FloatToIntGlNode;
	float_to_vec2: FloatToVec2GlNode;
	float_to_vec3: FloatToVec3GlNode;
	float_to_vec4: FloatToVec4GlNode;
	floor: FloorGlNode;
	fract: FractGlNode;
	for_loop: ForLoopGlNode;
	globals: GlobalsGlNode;
	hsluv_to_rgb: HsluvToRgbGlNode;
	hsv_to_rgb: HsvToRgbGlNode;
	if_then: IfThenGlNode;
	int_to_float: FloatToIntGlNode;
	inverse_sqrt: InverseSqrtGlNode;
	instance_transform: InstanceTransformGlNode;
	// lab_to_rgb: LabToRgbGlNode;
	// lch_to_rgb: LchToRgbGlNode;
	length: LengthGlNode;
	log: LogGlNode;
	log2: Log2GlNode;
	luminance: LuminanceGlNode;
	max: MaxGlNode;
	min: MinGlNode;
	mix: MixGlNode;
	mod: ModGlNode;
	mult: MultGlNode;
	mult_add: MultAddGlNode;
	negate: NegateGlNode;
	noise: NoiseGlNode;
	normalize: NormalizeGlNode;
	null: NullGlNode;
	or: OrGlNode;
	output: OutputGlNode;
	param: ParamGlNode;
	pow: PowGlNode;
	quat_mult: QuatMultGlNode;
	quat_from_axis_angle: QuatFromAxisAngleGlNode;
	quat_to_angle: QuatToAngleGlNode;
	quat_to_axis: QuatToAxisGlNode;
	radians: RadiansGlNode;
	ramp: RampGlNode;
	random: RandomGlNode;
	reflect: ReflectGlNode;
	refract: RefractGlNode;
	rgb_to_hsv: RgbToHsvGlNode;
	rotate: RotateGlNode;
	round: RoundGlNode;
	sign: SignGlNode;
	sin: SinGlNode;
	smooth_step: SmoothStepGlNode;
	sqrt: SqrtGlNode;
	step: StepGlNode;
	subnet: SubnetGlNode;
	subnet_input: SubnetInputGlNode;
	subnet_output: SubnetOutputGlNode;
	substract: SubstractGlNode;
	switch: SwitchGlNode;
	tan: TanGlNode;
	texture: TextureGlNode;
	two_way_switch: TwoWaySwitchGlNode;
	vec2_to_float: Vec2ToFloatGlNode;
	vec3_to_float: Vec3ToFloatGlNode;
	vec4_to_float: Vec4ToFloatGlNode;
	vec4_to_vector: Vec4ToVectorGlNode;
	vector_align: VectorAlignGlNode;
	vector_angle: VectorAngleGlNode;
}

import {NodeContext} from '../../NodeContext';
import {Poly} from '../../../Poly';

const SUBNET_CHILD_OPTION = {
	only: [
		`${IfThenGlNode.node_context()}/${IfThenGlNode.type()}`,
		`${SubnetGlNode.node_context()}/${SubnetGlNode.type()}`,
		`${ForLoopGlNode.node_context()}/${ForLoopGlNode.type()}`,
	],
};
export class GlRegister {
	static run(poly: Poly) {
		poly.register_node(AbsGlNode, CATEGORY_GL.MATH);
		poly.register_node(AccelerationGlNode, CATEGORY_GL.PHYSICS);
		poly.register_node(AcosGlNode, CATEGORY_GL.TRIGO);
		poly.register_node(AddGlNode, CATEGORY_GL.MATH);
		poly.register_node(AlignGlNode, CATEGORY_GL.TRIGO);
		poly.register_node(AndGlNode, CATEGORY_GL.LOGIC);
		poly.register_node(AsinGlNode, CATEGORY_GL.TRIGO);
		poly.register_node(AtanGlNode, CATEGORY_GL.TRIGO);
		poly.register_node(AttributeGlNode, CATEGORY_GL.GLOBALS, {except: [`${NodeContext.COP}/builder`]});
		poly.register_node(CeilGlNode, CATEGORY_GL.MATH);
		poly.register_node(ClampGlNode, CATEGORY_GL.MATH);
		poly.register_node(ColorCorrectGlNode, CATEGORY_GL.COLOR);
		poly.register_node(CompareGlNode, CATEGORY_GL.LOGIC);
		poly.register_node(ComplementGlNode, CATEGORY_GL.MATH);
		poly.register_node(ConstantGlNode, CATEGORY_GL.GLOBALS);
		poly.register_node(CosGlNode, CATEGORY_GL.TRIGO);
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
		poly.register_node(FaceforwardGlNode, CATEGORY_GL.GEOMETRY);
		poly.register_node(FitGlNode, CATEGORY_GL.MATH);
		poly.register_node(Fit01GlNode, CATEGORY_GL.MATH);
		poly.register_node(FloatToIntGlNode, CATEGORY_GL.CONVERSION);
		poly.register_node(FloatToVec2GlNode, CATEGORY_GL.CONVERSION);
		poly.register_node(FloatToVec3GlNode, CATEGORY_GL.CONVERSION);
		poly.register_node(FloatToVec4GlNode, CATEGORY_GL.CONVERSION);
		poly.register_node(FloorGlNode, CATEGORY_GL.MATH);
		poly.register_node(FractGlNode, CATEGORY_GL.MATH);
		poly.register_node(ForLoopGlNode, CATEGORY_GL.LOGIC);
		poly.register_node(GlobalsGlNode, CATEGORY_GL.GLOBALS);
		poly.register_node(HsluvToRgbGlNode, CATEGORY_GL.COLOR);
		poly.register_node(HsvToRgbGlNode, CATEGORY_GL.COLOR);
		poly.register_node(IfThenGlNode, CATEGORY_GL.LOGIC);
		poly.register_node(IntToFloatGlNode, CATEGORY_GL.CONVERSION);
		poly.register_node(InverseSqrtGlNode, CATEGORY_GL.MATH);
		poly.register_node(InstanceTransformGlNode, CATEGORY_GL.GEOMETRY);
		// poly.register_node(LabToRgbGlNode, CATEGORY_GL.COLOR);
		// poly.register_node(LchToRgbGlNode, CATEGORY_GL.COLOR);
		poly.register_node(LengthGlNode, CATEGORY_GL.GEOMETRY);
		poly.register_node(LuminanceGlNode, CATEGORY_GL.COLOR);
		poly.register_node(NegateGlNode, CATEGORY_GL.MATH);
		poly.register_node(LogGlNode, CATEGORY_GL.MATH);
		poly.register_node(Log2GlNode, CATEGORY_GL.MATH);
		poly.register_node(MaxGlNode, CATEGORY_GL.MATH);
		poly.register_node(MinGlNode, CATEGORY_GL.MATH);
		poly.register_node(ModGlNode, CATEGORY_GL.MATH);
		poly.register_node(MixGlNode, CATEGORY_GL.MATH);
		poly.register_node(MultGlNode, CATEGORY_GL.MATH);
		poly.register_node(MultAddGlNode, CATEGORY_GL.MATH);
		poly.register_node(NullGlNode, CATEGORY_GL.UTIL);
		poly.register_node(NoiseGlNode, CATEGORY_GL.GEOMETRY);
		poly.register_node(NormalizeGlNode, CATEGORY_GL.MATH);
		poly.register_node(OrGlNode, CATEGORY_GL.LOGIC);
		poly.register_node(OutputGlNode, CATEGORY_GL.GLOBALS);
		poly.register_node(ParamGlNode, CATEGORY_GL.GLOBALS);
		poly.register_node(PowGlNode, CATEGORY_GL.MATH);
		poly.register_node(QuatMultGlNode, CATEGORY_GL.QUAT);
		poly.register_node(QuatFromAxisAngleGlNode, CATEGORY_GL.QUAT);
		poly.register_node(QuatToAngleGlNode, CATEGORY_GL.QUAT);
		poly.register_node(QuatToAxisGlNode, CATEGORY_GL.QUAT);
		poly.register_node(RampGlNode, CATEGORY_GL.GLOBALS);
		poly.register_node(RandomGlNode, CATEGORY_GL.GLOBALS);
		poly.register_node(RadiansGlNode, CATEGORY_GL.CONVERSION);
		poly.register_node(ReflectGlNode, CATEGORY_GL.GEOMETRY);
		poly.register_node(RefractGlNode, CATEGORY_GL.GEOMETRY);
		poly.register_node(RgbToHsvGlNode, CATEGORY_GL.COLOR);
		poly.register_node(RotateGlNode, CATEGORY_GL.GEOMETRY);
		poly.register_node(RoundGlNode, CATEGORY_GL.MATH);
		poly.register_node(SignGlNode, CATEGORY_GL.MATH);
		poly.register_node(SinGlNode, CATEGORY_GL.TRIGO);
		poly.register_node(SmoothStepGlNode, CATEGORY_GL.MATH);
		poly.register_node(SqrtGlNode, CATEGORY_GL.MATH);
		poly.register_node(StepGlNode, CATEGORY_GL.GEOMETRY);
		poly.register_node(SubnetGlNode, CATEGORY_GL.LOGIC);
		poly.register_node(SubnetInputGlNode, CATEGORY_GL.LOGIC, SUBNET_CHILD_OPTION);
		poly.register_node(SubnetOutputGlNode, CATEGORY_GL.LOGIC, SUBNET_CHILD_OPTION);
		poly.register_node(SubstractGlNode, CATEGORY_GL.MATH);
		poly.register_node(SwitchGlNode, CATEGORY_GL.LOGIC);
		poly.register_node(TanGlNode, CATEGORY_GL.TRIGO);
		poly.register_node(TextureGlNode, CATEGORY_GL.COLOR);
		poly.register_node(TwoWaySwitchGlNode, CATEGORY_GL.TRIGO);
		poly.register_node(Vec2ToFloatGlNode, CATEGORY_GL.CONVERSION);
		poly.register_node(Vec3ToFloatGlNode, CATEGORY_GL.CONVERSION);
		poly.register_node(Vec4ToFloatGlNode, CATEGORY_GL.CONVERSION);
		poly.register_node(Vec4ToVectorGlNode, CATEGORY_GL.CONVERSION);
		poly.register_node(VectorAlignGlNode, CATEGORY_GL.GEOMETRY);
		poly.register_node(VectorAngleGlNode, CATEGORY_GL.GEOMETRY);
	}
}
