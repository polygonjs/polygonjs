import {CATEGORY_GL} from './Category';

import {FloatToIntGlNode, IntToFloatGlNode, IntToBoolGlNode, BoolToIntGlNode} from '../../../nodes/gl/_ConversionMisc';
import {FloatToVec2GlNode, FloatToVec3GlNode, FloatToVec4GlNode} from '../../../nodes/gl/_ConversionToVec';

import {
	Vec2ToFloatGlNode,
	Vec3ToFloatGlNode,
	Vec4ToFloatGlNode,
	Vec4ToVec3GlNode,
	Vec3ToVec4GlNode,
	Vec3ToVec2GlNode,
	Vec2ToVec3GlNode,
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
import {ClampGlNode, FaceforwardGlNode, SmoothstepGlNode} from '../../../nodes/gl/_Math_Arg3';

import {AddGlNode, DivideGlNode, MultGlNode, SubtractGlNode} from '../../../nodes/gl/_Math_Arg2Operation';

import {AndGlNode, OrGlNode} from '../../../nodes/gl/_Math_Arg2Boolean';
import {AccelerationGlNode} from '../../../nodes/gl/Acceleration';
import {AlignGlNode} from '../../../nodes/gl/Align';
import {AttributeGlNode} from '../../../nodes/gl/Attribute';
import {CartesianToPolarGlNode} from '../../../nodes/gl/CartesianToPolar';
import {ColorCorrectGlNode} from '../../../nodes/gl/ColorCorrect';
import {CompareGlNode} from '../../../nodes/gl/Compare';
import {ComplementGlNode} from '../../../nodes/gl/Complement';
import {ConstantGlNode} from '../../../nodes/gl/Constant';
import {CrossGlNode} from '../../../nodes/gl/Cross';
import {CycleGlNode} from '../../../nodes/gl/Cycle';
import {DiskGlNode} from '../../../nodes/gl/Disk';
import {DitherGlNode} from '../../../nodes/gl/Dither';
import {EasingGlNode} from '../../../nodes/gl/Easing';
import {FlockingGlNode} from '../../../nodes/gl/Flocking';
import {FitGlNode, FitTo01GlNode, FitFrom01GlNode, FitFrom01ToVarianceGlNode} from '../../../nodes/gl/Fit';
import {FogGlNode} from '../../../nodes/gl/Fog';
import {ForLoopGlNode} from '../../../nodes/gl/ForLoop';
import {FresnelGlNode} from '../../../nodes/gl/Fresnel';
import {GlobalsGlNode} from '../../../nodes/gl/Globals';
import {HsluvToRgbGlNode} from '../../../nodes/gl/HsluvToRgb';
import {HsvToRgbGlNode} from '../../../nodes/gl/HsvToRgb';
import {IfThenGlNode} from '../../../nodes/gl/IfThen';
import {InRangeGlNode} from '../../../nodes/gl/InRange';
import {IsInfOrNanGlNode} from '../../../nodes/gl/IsInfOrNan';
import {ImpostorUvGlNode} from '../../../nodes/gl/ImpostorUv';
import {InstanceTransformGlNode} from '../../../nodes/gl/InstanceTransform';
// import {LabToRgbGlNode} from '../../../nodes/gl/LabToRgb'; // TODO: still need work, not looking good
// import {LchToRgbGlNode} from '../../../nodes/gl/LchToRgb'; // TODO: still need work, not looking good
import {LengthGlNode} from '../../../nodes/gl/Length';
import {LuminanceGlNode} from '../../../nodes/gl/Luminance';
import {MaxLengthGlNode} from '../../../nodes/gl/MaxLength';
import {MixGlNode} from '../../../nodes/gl/Mix';
import {ModelViewMatrixMultGlNode} from '../../../nodes/gl/ModelViewMatrixMult';
import {MultAddGlNode} from '../../../nodes/gl/MultAdd';
import {MultScalarGlNode} from '../../../nodes/gl/MultScalar';
import {NegateGlNode} from '../../../nodes/gl/Negate';
import {NeighbourAttractGlNode} from '../../../nodes/gl/NeighbourAttract';
import {NeighbourDensityGlNode} from '../../../nodes/gl/NeighbourDensity';
import {NeighbourRepulseGlNode} from '../../../nodes/gl/NeighbourRepulse';
import {NoiseGlNode} from '../../../nodes/gl/Noise';
import {NullGlNode} from '../../../nodes/gl/Null';
import {OutputGlNode} from '../../../nodes/gl/Output';
import {ParamGlNode} from '../../../nodes/gl/Param';
import {OklabToRgbGlNode} from '../../../nodes/gl/OklabToRgb';
import {PolarToCartesianGlNode} from '../../../nodes/gl/PolarToCartesian';
import {QuatMultGlNode} from '../../../nodes/gl/QuatMult';
import {QuatFromAxisAngleGlNode} from '../../../nodes/gl/QuatFromAxisAngle';
import {QuatSlerpGlNode} from '../../../nodes/gl/QuatSlerp';
import {QuatToAngleGlNode} from '../../../nodes/gl/QuatToAngle';
import {QuatToAxisGlNode} from '../../../nodes/gl/QuatToAxis';
import {RampGlNode} from '../../../nodes/gl/Ramp';
import {RandomGlNode} from '../../../nodes/gl/Random';
import {RefractGlNode} from '../../../nodes/gl/Refract';
import {RgbToHsvGlNode} from '../../../nodes/gl/RgbToHsv';
import {RgbToOklabGlNode} from '../../../nodes/gl/RgbToOklab';
import {RotateGlNode} from '../../../nodes/gl/Rotate';
import {RoundGlNode} from '../../../nodes/gl/Round';
import {SDFBoxGlNode} from '../../../nodes/gl/SDFBox';
import {SDFBoxFrameGlNode} from '../../../nodes/gl/SDFBoxFrame';
import {SDFBoxRoundGlNode} from '../../../nodes/gl/SDFBoxRound';
import {SDFCapsuleGlNode} from '../../../nodes/gl/SDFCapsule';
import {SDFCapsuleVerticalGlNode} from '../../../nodes/gl/SDFCapsuleVertical';
import {SDFConeGlNode} from '../../../nodes/gl/SDFCone';
import {SDFConeRoundGlNode} from '../../../nodes/gl/SDFConeRound';
import {SDFContextGlNode} from '../../../nodes/gl/SDFContext';
import {SDFElongateGlNode} from '../../../nodes/gl/SDFElongate';
import {SDFFractalMandelbrotGlNode} from '../../../nodes/gl/SDFFractalMandelbrot';
import {SDFGradientGlNode} from '../../../nodes/gl/SDFGradient';
import {SDFIntersectGlNode} from '../../../nodes/gl/SDFIntersect';
import {SDFLinkGlNode} from '../../../nodes/gl/SDFLink';
import {SDFMaterialGlNode} from '../../../nodes/gl/SDFMaterial';
import {SDFMaxGlNode} from '../../../nodes/gl/SDFMax';
import {SDFMinGlNode} from '../../../nodes/gl/SDFMin';
import {SDFMirrorGlNode} from '../../../nodes/gl/SDFMirror';
import {SDFOctahedronGlNode} from '../../../nodes/gl/SDFOctahedron';
import {SDFOnionGlNode} from '../../../nodes/gl/SDFOnion';
import {SDFPlaneGlNode} from '../../../nodes/gl/SDFPlane';
import {SDFRepeatGlNode} from '../../../nodes/gl/SDFRepeat';
import {SDFRepeatPolarGlNode} from '../../../nodes/gl/SDFRepeatPolar';
import {SDFRhombusGlNode} from '../../../nodes/gl/SDFRhombus';
import {SDFSolidAngleGlNode} from '../../../nodes/gl/SDFSolidAngle';
import {SDFSphereGlNode} from '../../../nodes/gl/SDFSphere';
import {SDFSubtractGlNode} from '../../../nodes/gl/SDFSubtract';
import {SDFTorusGlNode} from '../../../nodes/gl/SDFTorus';
import {SDFTransformGlNode} from '../../../nodes/gl/SDFTransform';
import {SDFTwistGlNode} from '../../../nodes/gl/SDFTwist';
import {SDFUnionGlNode} from '../../../nodes/gl/SDFUnion';
import {SSSModelGlNode} from '../../../nodes/gl/SSSModel';
import {SphereGlNode} from '../../../nodes/gl/Sphere';
import {SubnetGlNode} from '../../../nodes/gl/Subnet';
import {SubnetInputGlNode} from '../../../nodes/gl/SubnetInput';
import {SubnetOutputGlNode} from '../../../nodes/gl/SubnetOutput';
import {SwitchGlNode} from '../../../nodes/gl/Switch';
import {TextureGlNode} from '../../../nodes/gl/Texture';
import {TileUvGlNode} from '../../../nodes/gl/TileUv';
import {ToWorldSpaceGlNode} from '../../../nodes/gl/ToWorldSpace';
import {TwoWaySwitchGlNode} from '../../../nodes/gl/TwoWaySwitch';
import {UvToOklabGlNode} from '../../../nodes/gl/UvToOklab';
import {VaryingWriteGlNode} from '../../../nodes/gl/VaryingWrite';
import {VaryingReadGlNode} from '../../../nodes/gl/VaryingRead';
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
	boolToInt: BoolToIntGlNode;
	cartesianToPolar: CartesianToPolarGlNode;
	ceil: CeilGlNode;
	clamp: ClampGlNode;
	colorCorrect: ColorCorrectGlNode;
	compare: CompareGlNode;
	complement: ComplementGlNode;
	constant: ConstantGlNode;
	cos: CosGlNode;
	cross: CrossGlNode;
	cycle: CycleGlNode;
	degrees: DegreesGlNode;
	disk: DiskGlNode;
	distance: DistanceGlNode;
	dither: DitherGlNode;
	divide: DivideGlNode;
	dot: DotGlNode;
	easing: EasingGlNode;
	exp: ExpGlNode;
	exp2: Exp2GlNode;
	faceForward: FaceforwardGlNode;
	fit: FitGlNode;
	fitTo01: FitTo01GlNode;
	fitFrom01: FitFrom01GlNode;
	fitFrom01ToVariance: FitFrom01ToVarianceGlNode;
	flocking: FlockingGlNode;
	floatToInt: FloatToIntGlNode;
	floatToVec2: FloatToVec2GlNode;
	floatToVec3: FloatToVec3GlNode;
	floatToVec4: FloatToVec4GlNode;
	floor: FloorGlNode;
	fract: FractGlNode;
	fresnel: FresnelGlNode;
	fog: FogGlNode;
	forLoop: ForLoopGlNode;
	globals: GlobalsGlNode;
	hsluvToRgb: HsluvToRgbGlNode;
	hsvToRgb: HsvToRgbGlNode;
	ifThen: IfThenGlNode;
	impostorUv: ImpostorUvGlNode;
	inRange: InRangeGlNode;
	intToBool: IntToBoolGlNode;
	intToFloat: IntToFloatGlNode;
	inverseSqrt: InverseSqrtGlNode;
	instanceTransform: InstanceTransformGlNode;
	isInfOrNan: IsInfOrNanGlNode;
	// lab_to_rgb: LabToRgbGlNode;
	// lch_to_rgb: LchToRgbGlNode;
	length: LengthGlNode;
	log: LogGlNode;
	log2: Log2GlNode;
	luminance: LuminanceGlNode;
	max: MaxGlNode;
	maxLength: MaxLengthGlNode;
	min: MinGlNode;
	mix: MixGlNode;
	mod: ModGlNode;
	modelViewMatrixMult: ModelViewMatrixMultGlNode;
	mult: MultGlNode;
	multAdd: MultAddGlNode;
	multScalar: MultScalarGlNode;
	negate: NegateGlNode;
	neighbourAttract: NeighbourAttractGlNode;
	neighbourDensity: NeighbourDensityGlNode;
	neighbourRepulse: NeighbourRepulseGlNode;
	noise: NoiseGlNode;
	normalize: NormalizeGlNode;
	null: NullGlNode;
	oklabToRgb: OklabToRgbGlNode;
	or: OrGlNode;
	output: OutputGlNode;
	param: ParamGlNode;
	polarToCartesian: PolarToCartesianGlNode;
	pow: PowGlNode;
	quatMult: QuatMultGlNode;
	quatFromAxisAngle: QuatFromAxisAngleGlNode;
	quatSlerp: QuatSlerpGlNode;
	quatToAngle: QuatToAngleGlNode;
	quatToAxis: QuatToAxisGlNode;
	radians: RadiansGlNode;
	ramp: RampGlNode;
	random: RandomGlNode;
	reflect: ReflectGlNode;
	refract: RefractGlNode;
	rgbToHsv: RgbToHsvGlNode;
	rotate: RotateGlNode;
	round: RoundGlNode;
	sign: SignGlNode;
	sin: SinGlNode;
	smoothstep: SmoothstepGlNode;
	sphere: SphereGlNode;
	sqrt: SqrtGlNode;
	SDFBox: SDFBoxGlNode;
	SDFBoxFrame: SDFBoxFrameGlNode;
	SDFBoxRound: SDFBoxRoundGlNode;
	SDFCapsule: SDFCapsuleGlNode;
	SDFCapsuleVertical: SDFCapsuleVerticalGlNode;
	SDFCone: SDFConeGlNode;
	SDFConeRound: SDFConeRoundGlNode;
	SDFContext: SDFContextGlNode;
	SDFElongate: SDFElongateGlNode;
	SDFFractalMandelbrot: SDFFractalMandelbrotGlNode;
	SDFGradient: SDFGradientGlNode;
	SDFIntersect: SDFIntersectGlNode;
	SDFLink: SDFLinkGlNode;
	SDFMaterial: SDFMaterialGlNode;
	SDFMax: SDFMaxGlNode;
	SDFMin: SDFMinGlNode;
	SDFMirror: SDFMirrorGlNode;
	SDFOctahedron: SDFOctahedronGlNode;
	SDFOnion: SDFOnionGlNode;
	SDFPlane: SDFPlaneGlNode;
	SDFRepeat: SDFRepeatGlNode;
	SDFRepeatPolar: SDFRepeatPolarGlNode;
	SDFRhombus: SDFRhombusGlNode;
	SDFSolidAngle: SDFSolidAngleGlNode;
	SDFSphere: SDFSphereGlNode;
	SDFSubtract: SDFSubtractGlNode;
	SDFTorus: SDFTorusGlNode;
	SDFTransform: SDFTransformGlNode;
	SDFTwist: SDFTwistGlNode;
	SDFUnion: SDFUnionGlNode;
	SSSModel: SSSModelGlNode;
	step: StepGlNode;
	subnet: SubnetGlNode;
	subnetInput: SubnetInputGlNode;
	subnetOutput: SubnetOutputGlNode;
	subtract: SubtractGlNode;
	switch: SwitchGlNode;
	tan: TanGlNode;
	texture: TextureGlNode;
	tileUv: TileUvGlNode;
	toWorldSpace: ToWorldSpaceGlNode;
	twoWaySwitch: TwoWaySwitchGlNode;
	uvToOklab: UvToOklabGlNode;
	varyingWrite: VaryingWriteGlNode;
	varyingRead: VaryingReadGlNode;
	vec2ToFloat: Vec2ToFloatGlNode;
	vec2ToVec3: Vec2ToVec3GlNode;
	vec3ToFloat: Vec3ToFloatGlNode;
	vec3ToVec2: Vec3ToVec2GlNode;
	vec3ToVec4: Vec3ToVec4GlNode;
	vec4ToFloat: Vec4ToFloatGlNode;
	vec4ToVec3: Vec4ToVec3GlNode;
	vectorAlign: VectorAlignGlNode;
	vectorAngle: VectorAngleGlNode;
}

import {NodeContext} from '../../NodeContext';
import {PolyEngine} from '../../../Poly';
import {CopType} from './types/Cop';
import {SopType} from './types/Sop';

const SUBNET_CHILD_OPTION = {
	only: [
		`${IfThenGlNode.context()}/${IfThenGlNode.type()}`,
		`${SubnetGlNode.context()}/${SubnetGlNode.type()}`,
		`${ForLoopGlNode.context()}/${ForLoopGlNode.type()}`,
		`${SDFGradientGlNode.context()}/${SDFGradientGlNode.type()}`,
	],
};
export class GlRegister {
	static run(poly: PolyEngine) {
		poly.registerNode(AbsGlNode, CATEGORY_GL.MATH);
		poly.registerNode(AccelerationGlNode, CATEGORY_GL.PHYSICS);
		poly.registerNode(AcosGlNode, CATEGORY_GL.TRIGO);
		poly.registerNode(AddGlNode, CATEGORY_GL.MATH);
		poly.registerNode(AlignGlNode, CATEGORY_GL.TRIGO);
		poly.registerNode(AndGlNode, CATEGORY_GL.LOGIC);
		poly.registerNode(AsinGlNode, CATEGORY_GL.TRIGO);
		poly.registerNode(AtanGlNode, CATEGORY_GL.TRIGO);
		poly.registerNode(AttributeGlNode, CATEGORY_GL.GLOBALS, {except: [`${NodeContext.COP}/${CopType.BUILDER}`]});
		poly.registerNode(BoolToIntGlNode, CATEGORY_GL.CONVERSION);
		poly.registerNode(CartesianToPolarGlNode, CATEGORY_GL.MATH);
		poly.registerNode(CeilGlNode, CATEGORY_GL.MATH);
		poly.registerNode(ClampGlNode, CATEGORY_GL.MATH);
		poly.registerNode(ColorCorrectGlNode, CATEGORY_GL.COLOR);
		poly.registerNode(CompareGlNode, CATEGORY_GL.LOGIC);
		poly.registerNode(ComplementGlNode, CATEGORY_GL.MATH);
		poly.registerNode(ConstantGlNode, CATEGORY_GL.GLOBALS);
		poly.registerNode(CosGlNode, CATEGORY_GL.TRIGO);
		poly.registerNode(CrossGlNode, CATEGORY_GL.GEOMETRY);
		poly.registerNode(CycleGlNode, CATEGORY_GL.MATH);
		poly.registerNode(DegreesGlNode, CATEGORY_GL.CONVERSION);
		poly.registerNode(DiskGlNode, CATEGORY_GL.GEOMETRY);
		poly.registerNode(DistanceGlNode, CATEGORY_GL.GEOMETRY);
		poly.registerNode(DitherGlNode, CATEGORY_GL.ADVANCED);
		poly.registerNode(DivideGlNode, CATEGORY_GL.MATH);
		poly.registerNode(DotGlNode, CATEGORY_GL.GEOMETRY);
		poly.registerNode(EasingGlNode, CATEGORY_GL.MATH);
		poly.registerNode(ExpGlNode, CATEGORY_GL.MATH);
		poly.registerNode(Exp2GlNode, CATEGORY_GL.MATH);
		poly.registerNode(FaceforwardGlNode, CATEGORY_GL.GEOMETRY);
		if (process.env.NODE_ENV == 'development') {
			const particlesOnlyOption = {
				only: [`${NodeContext.SOP}/${SopType.PARTICLES_SYSTEM_GPU}`],
			};
			poly.registerNode(FlockingGlNode, CATEGORY_GL.ADVANCED, particlesOnlyOption);
			poly.registerNode(NeighbourAttractGlNode, CATEGORY_GL.ADVANCED, particlesOnlyOption);
			poly.registerNode(NeighbourDensityGlNode, CATEGORY_GL.ADVANCED, particlesOnlyOption);
			poly.registerNode(NeighbourRepulseGlNode, CATEGORY_GL.ADVANCED, particlesOnlyOption);
		}
		poly.registerNode(FitGlNode, CATEGORY_GL.MATH);
		poly.registerNode(FitTo01GlNode, CATEGORY_GL.MATH);
		poly.registerNode(FitFrom01GlNode, CATEGORY_GL.MATH);
		poly.registerNode(FitFrom01ToVarianceGlNode, CATEGORY_GL.MATH);
		poly.registerNode(FloatToIntGlNode, CATEGORY_GL.CONVERSION);
		poly.registerNode(FloatToVec2GlNode, CATEGORY_GL.CONVERSION);
		poly.registerNode(FloatToVec3GlNode, CATEGORY_GL.CONVERSION);
		poly.registerNode(FloatToVec4GlNode, CATEGORY_GL.CONVERSION);
		poly.registerNode(FloorGlNode, CATEGORY_GL.MATH);
		poly.registerNode(FogGlNode, CATEGORY_GL.COLOR);
		poly.registerNode(ForLoopGlNode, CATEGORY_GL.LOGIC);
		poly.registerNode(FractGlNode, CATEGORY_GL.MATH);
		poly.registerNode(FresnelGlNode, CATEGORY_GL.ADVANCED);
		poly.registerNode(GlobalsGlNode, CATEGORY_GL.GLOBALS);
		poly.registerNode(HsluvToRgbGlNode, CATEGORY_GL.COLOR);
		poly.registerNode(HsvToRgbGlNode, CATEGORY_GL.COLOR);
		poly.registerNode(IfThenGlNode, CATEGORY_GL.LOGIC);
		poly.registerNode(IsInfOrNanGlNode, CATEGORY_GL.LOGIC);
		poly.registerNode(ImpostorUvGlNode, CATEGORY_GL.UTIL);
		poly.registerNode(InRangeGlNode, CATEGORY_GL.UTIL);
		poly.registerNode(IntToBoolGlNode, CATEGORY_GL.CONVERSION);
		poly.registerNode(IntToFloatGlNode, CATEGORY_GL.CONVERSION);
		poly.registerNode(InverseSqrtGlNode, CATEGORY_GL.MATH);
		poly.registerNode(InstanceTransformGlNode, CATEGORY_GL.GEOMETRY);
		// poly.registerNode(LabToRgbGlNode, CATEGORY_GL.COLOR);
		// poly.registerNode(LchToRgbGlNode, CATEGORY_GL.COLOR);
		poly.registerNode(LengthGlNode, CATEGORY_GL.GEOMETRY);
		poly.registerNode(LuminanceGlNode, CATEGORY_GL.COLOR);
		poly.registerNode(LogGlNode, CATEGORY_GL.MATH);
		poly.registerNode(Log2GlNode, CATEGORY_GL.MATH);
		poly.registerNode(MaxGlNode, CATEGORY_GL.MATH);
		poly.registerNode(MaxLengthGlNode, CATEGORY_GL.MATH);
		poly.registerNode(MinGlNode, CATEGORY_GL.MATH);
		poly.registerNode(MixGlNode, CATEGORY_GL.MATH);
		poly.registerNode(ModGlNode, CATEGORY_GL.MATH);
		poly.registerNode(ModelViewMatrixMultGlNode, CATEGORY_GL.MATH);
		poly.registerNode(MultGlNode, CATEGORY_GL.MATH);
		poly.registerNode(MultAddGlNode, CATEGORY_GL.MATH);
		poly.registerNode(MultScalarGlNode, CATEGORY_GL.MATH);
		poly.registerNode(NegateGlNode, CATEGORY_GL.MATH);
		poly.registerNode(NullGlNode, CATEGORY_GL.UTIL);
		poly.registerNode(NoiseGlNode, CATEGORY_GL.GEOMETRY);
		poly.registerNode(NormalizeGlNode, CATEGORY_GL.MATH);
		poly.registerNode(OklabToRgbGlNode, CATEGORY_GL.COLOR);
		poly.registerNode(OrGlNode, CATEGORY_GL.LOGIC);
		poly.registerNode(OutputGlNode, CATEGORY_GL.GLOBALS);
		poly.registerNode(ParamGlNode, CATEGORY_GL.GLOBALS);
		poly.registerNode(PolarToCartesianGlNode, CATEGORY_GL.MATH);
		poly.registerNode(PowGlNode, CATEGORY_GL.MATH);
		poly.registerNode(QuatMultGlNode, CATEGORY_GL.QUAT);
		poly.registerNode(QuatFromAxisAngleGlNode, CATEGORY_GL.QUAT);
		poly.registerNode(QuatSlerpGlNode, CATEGORY_GL.QUAT);
		poly.registerNode(QuatToAngleGlNode, CATEGORY_GL.QUAT);
		poly.registerNode(QuatToAxisGlNode, CATEGORY_GL.QUAT);
		poly.registerNode(RampGlNode, CATEGORY_GL.GLOBALS);
		poly.registerNode(RandomGlNode, CATEGORY_GL.GLOBALS);
		poly.registerNode(RadiansGlNode, CATEGORY_GL.CONVERSION);
		poly.registerNode(ReflectGlNode, CATEGORY_GL.GEOMETRY);
		poly.registerNode(RefractGlNode, CATEGORY_GL.GEOMETRY);
		poly.registerNode(RgbToHsvGlNode, CATEGORY_GL.COLOR);
		poly.registerNode(RgbToOklabGlNode, CATEGORY_GL.COLOR);
		poly.registerNode(RotateGlNode, CATEGORY_GL.GEOMETRY);
		poly.registerNode(RoundGlNode, CATEGORY_GL.MATH);
		poly.registerNode(SDFBoxGlNode, CATEGORY_GL.SDF_PRIMITIVES);
		poly.registerNode(SDFBoxFrameGlNode, CATEGORY_GL.SDF_PRIMITIVES);
		poly.registerNode(SDFBoxRoundGlNode, CATEGORY_GL.SDF_PRIMITIVES);
		poly.registerNode(SDFCapsuleGlNode, CATEGORY_GL.SDF_PRIMITIVES);
		poly.registerNode(SDFCapsuleVerticalGlNode, CATEGORY_GL.SDF_PRIMITIVES);
		poly.registerNode(SDFConeGlNode, CATEGORY_GL.SDF_PRIMITIVES);
		poly.registerNode(SDFConeRoundGlNode, CATEGORY_GL.SDF_PRIMITIVES);
		poly.registerNode(SDFContextGlNode, CATEGORY_GL.SDF_MODIFIERS);
		poly.registerNode(SDFElongateGlNode, CATEGORY_GL.SDF_MODIFIERS);
		poly.registerNode(SDFFractalMandelbrotGlNode, CATEGORY_GL.SDF_PRIMITIVES);
		poly.registerNode(SDFGradientGlNode, CATEGORY_GL.SDF_MODIFIERS);
		poly.registerNode(SDFIntersectGlNode, CATEGORY_GL.SDF_MODIFIERS);
		poly.registerNode(SDFLinkGlNode, CATEGORY_GL.SDF_PRIMITIVES);
		poly.registerNode(SDFMaterialGlNode, CATEGORY_GL.SDF_MODIFIERS);
		poly.registerNode(SDFMaxGlNode, CATEGORY_GL.SDF_MODIFIERS);
		poly.registerNode(SDFMinGlNode, CATEGORY_GL.SDF_MODIFIERS);
		poly.registerNode(SDFMirrorGlNode, CATEGORY_GL.SDF_MODIFIERS);
		poly.registerNode(SDFOctahedronGlNode, CATEGORY_GL.SDF_PRIMITIVES);
		poly.registerNode(SDFOnionGlNode, CATEGORY_GL.SDF_MODIFIERS);
		poly.registerNode(SDFPlaneGlNode, CATEGORY_GL.SDF_PRIMITIVES);
		poly.registerNode(SDFRepeatGlNode, CATEGORY_GL.SDF_MODIFIERS);
		poly.registerNode(SDFRepeatPolarGlNode, CATEGORY_GL.SDF_MODIFIERS);
		poly.registerNode(SDFRhombusGlNode, CATEGORY_GL.SDF_PRIMITIVES);
		poly.registerNode(SDFSolidAngleGlNode, CATEGORY_GL.SDF_PRIMITIVES);
		poly.registerNode(SDFSphereGlNode, CATEGORY_GL.SDF_PRIMITIVES);
		poly.registerNode(SDFSubtractGlNode, CATEGORY_GL.SDF_MODIFIERS);
		poly.registerNode(SDFTorusGlNode, CATEGORY_GL.SDF_PRIMITIVES);
		poly.registerNode(SDFTransformGlNode, CATEGORY_GL.SDF_MODIFIERS);
		poly.registerNode(SDFTwistGlNode, CATEGORY_GL.SDF_MODIFIERS);
		poly.registerNode(SDFUnionGlNode, CATEGORY_GL.SDF_MODIFIERS);
		poly.registerNode(SignGlNode, CATEGORY_GL.MATH);
		poly.registerNode(SinGlNode, CATEGORY_GL.TRIGO);
		poly.registerNode(SmoothstepGlNode, CATEGORY_GL.MATH);
		poly.registerNode(SphereGlNode, CATEGORY_GL.GEOMETRY);
		poly.registerNode(SqrtGlNode, CATEGORY_GL.MATH);
		poly.registerNode(SSSModelGlNode, CATEGORY_GL.LIGHTING);
		poly.registerNode(StepGlNode, CATEGORY_GL.GEOMETRY);
		poly.registerNode(SubnetGlNode, CATEGORY_GL.LOGIC);
		poly.registerNode(SubnetInputGlNode, CATEGORY_GL.LOGIC, SUBNET_CHILD_OPTION);
		poly.registerNode(SubnetOutputGlNode, CATEGORY_GL.LOGIC, SUBNET_CHILD_OPTION);
		poly.registerNode(SubtractGlNode, CATEGORY_GL.MATH);
		poly.registerNode(SwitchGlNode, CATEGORY_GL.LOGIC);
		poly.registerNode(TanGlNode, CATEGORY_GL.TRIGO);
		poly.registerNode(TextureGlNode, CATEGORY_GL.COLOR);
		poly.registerNode(TileUvGlNode, CATEGORY_GL.UTIL);
		poly.registerNode(ToWorldSpaceGlNode, CATEGORY_GL.GLOBALS);
		poly.registerNode(TwoWaySwitchGlNode, CATEGORY_GL.LOGIC);
		poly.registerNode(UvToOklabGlNode, CATEGORY_GL.COLOR);
		poly.registerNode(VaryingWriteGlNode, CATEGORY_GL.GLOBALS);
		poly.registerNode(VaryingReadGlNode, CATEGORY_GL.GLOBALS);
		poly.registerNode(Vec2ToFloatGlNode, CATEGORY_GL.CONVERSION);
		poly.registerNode(Vec2ToVec3GlNode, CATEGORY_GL.CONVERSION);
		poly.registerNode(Vec3ToFloatGlNode, CATEGORY_GL.CONVERSION);
		poly.registerNode(Vec3ToVec2GlNode, CATEGORY_GL.CONVERSION);
		poly.registerNode(Vec3ToVec4GlNode, CATEGORY_GL.CONVERSION);
		poly.registerNode(Vec4ToFloatGlNode, CATEGORY_GL.CONVERSION);
		poly.registerNode(Vec4ToVec3GlNode, CATEGORY_GL.CONVERSION);
		poly.registerNode(VectorAlignGlNode, CATEGORY_GL.GEOMETRY);
		poly.registerNode(VectorAngleGlNode, CATEGORY_GL.GEOMETRY);
	}
}
