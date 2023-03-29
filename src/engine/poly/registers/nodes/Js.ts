import {CATEGORY_JS} from './Category';

import {
	Vec2ToFloatJsNode,
	Vec3ToFloatJsNode,
	Vec4ToFloatJsNode,
	Vec4ToVec3JsNode,
	Vec3ToVec4JsNode,
	Vec3ToVec2JsNode,
	Vec2ToVec3JsNode,
} from '../../../nodes/js/_ConversionVecTo';

import {AddJsNode} from '../../../nodes/js/Add';
import {AttributeJsNode} from '../../../nodes/js/Attribute';
import {ConstantJsNode} from '../../../nodes/js/Constant';
import {CursorJsNode} from '../../../nodes/js/Cursor';
import {DivideJsNode} from '../../../nodes/js/Divide';
import {FloatToVec3JsNode} from '../../../nodes/js/FloatToVec3';
import {GetObjectJsNode} from '../../../nodes/js/GetObject';
import {GetObjectPropertyJsNode} from '../../../nodes/js/GetObjectProperty';
import {GetParentJsNode} from '../../../nodes/js/GetParent';
import {GlobalsJsNode} from '../../../nodes/js/Globals';
import {MultJsNode} from '../../../nodes/js/Mult';
import {OnManualTriggerJsNode} from '../../../nodes/js/OnManualTrigger';
import {OnObjectClickJsNode} from '../../../nodes/js/OnObjectClick';
import {OnObjectHoverJsNode} from '../../../nodes/js/OnObjectHover';
import {OnTickJsNode} from '../../../nodes/js/OnTick';
import {OutputJsNode} from '../../../nodes/js/Output';
import {ParamJsNode} from '../../../nodes/js/Param';
import {PlaneJsNode} from '../../../nodes/js/Plane';
import {RayFromCursorJsNode} from '../../../nodes/js/RayFromCursor';
import {RayIntersectPlaneJsNode} from '../../../nodes/js/RayIntersectPlane';
import {SDF2DRoundedXJsNode} from '../../../nodes/js/SDF2DRoundedX';
import {SDFBoxJsNode} from '../../../nodes/js/SDFBox';
import {SDFIntersectJsNode} from '../../../nodes/js/SDFIntersect';
import {SDFRevolutionJsNode} from '../../../nodes/js/SDFRevolution';
import {SDFSphereJsNode} from '../../../nodes/js/SDFSphere';
import {SDFSubtractJsNode} from '../../../nodes/js/SDFSubtract';
import {SDFUnionJsNode} from '../../../nodes/js/SDFUnion';
import {SetObjectLookAtJsNode} from '../../../nodes/js/SetObjectLookAt';
import {SetObjectPositionJsNode} from '../../../nodes/js/SetObjectPosition';
import {SetObjectScaleJsNode} from '../../../nodes/js/SetObjectScale';
import {SinJsNode} from '../../../nodes/js/Sin';
import {SubtractJsNode} from '../../../nodes/js/Subtract';
import {TwoWaySwitchJsNode} from '../../../nodes/js/TwoWaySwitch';

export interface JsNodeChildrenMap {
	add: AddJsNode;
	attribute: AttributeJsNode;
	cursor: CursorJsNode;
	constant: ConstantJsNode;
	divide: DivideJsNode;
	floatToVec3: FloatToVec3JsNode;
	getObject: GetObjectJsNode;
	getObjectProperty: GetObjectPropertyJsNode;
	getParent: GetParentJsNode;
	globals: GlobalsJsNode;
	mult: MultJsNode;
	onManualTrigger: OnManualTriggerJsNode;
	onObjectClick: OnObjectClickJsNode;
	onObjectHover: OnObjectHoverJsNode;
	onTick: OnTickJsNode;
	output: OutputJsNode;
	param: ParamJsNode;
	plane: PlaneJsNode;
	rayFromCursor: RayFromCursorJsNode;
	rayIntersectPlane: RayIntersectPlaneJsNode;
	SDF2DRoundedX: SDF2DRoundedXJsNode;
	SDFBox: SDFBoxJsNode;
	SDFIntersect: SDFIntersectJsNode;
	SDFRevolution: SDFRevolutionJsNode;
	SDFSphere: SDFSphereJsNode;
	SDFSubtract: SDFSubtractJsNode;
	SDFUnion: SDFUnionJsNode;
	setObjectLookAt: SetObjectLookAtJsNode;
	setObjectPosition: SetObjectPositionJsNode;
	setObjectScale: SetObjectScaleJsNode;
	sin: SinJsNode;
	subtract: SubtractJsNode;
	twoWaySwitch: TwoWaySwitchJsNode;
	vec2ToFloat: Vec2ToFloatJsNode;
	vec2ToVec3: Vec2ToVec3JsNode;
	vec3ToFloat: Vec3ToFloatJsNode;
	vec3ToVec2: Vec3ToVec2JsNode;
	vec3ToVec4: Vec3ToVec4JsNode;
	vec4ToFloat: Vec4ToFloatJsNode;
	vec4ToVec3: Vec4ToVec3JsNode;
}

import {PolyEngine} from '../../../Poly';
import {SopType} from './types/Sop';
import {NodeContext} from '../../NodeContext';
const sopType = (type: SopType) => `${NodeContext.SOP}/${type}`;
const ONLY_WITH_GLOBALS = {only: [sopType(SopType.SDF_BUILDER)]};
const ONLY_ACTOR = {only: [sopType(SopType.ACTOR_JS)]};
export class JsRegister {
	static run(poly: PolyEngine) {
		// poly.registerNode(AttributeJsNode, CATEGORY_JS.GLOBALS);
		poly.registerNode(AddJsNode, CATEGORY_JS.MATH);
		poly.registerNode(ConstantJsNode, CATEGORY_JS.GLOBALS);
		poly.registerNode(CursorJsNode, CATEGORY_JS.INPUTS, ONLY_ACTOR);
		poly.registerNode(FloatToVec3JsNode, CATEGORY_JS.CONVERSION);
		poly.registerNode(DivideJsNode, CATEGORY_JS.MATH);
		poly.registerNode(GetObjectJsNode, CATEGORY_JS.GET, ONLY_ACTOR);
		poly.registerNode(GetObjectPropertyJsNode, CATEGORY_JS.GET, ONLY_ACTOR);
		poly.registerNode(GetParentJsNode, CATEGORY_JS.GET, ONLY_ACTOR);
		poly.registerNode(GlobalsJsNode, CATEGORY_JS.GLOBALS, ONLY_WITH_GLOBALS);
		poly.registerNode(MultJsNode, CATEGORY_JS.MATH);
		poly.registerNode(OnManualTriggerJsNode, CATEGORY_JS.EVENTS, ONLY_ACTOR);
		poly.registerNode(OnObjectClickJsNode, CATEGORY_JS.EVENTS, ONLY_ACTOR);
		poly.registerNode(OnObjectHoverJsNode, CATEGORY_JS.EVENTS, ONLY_ACTOR);
		poly.registerNode(OnTickJsNode, CATEGORY_JS.EVENTS, ONLY_ACTOR);
		poly.registerNode(OutputJsNode, CATEGORY_JS.GLOBALS, ONLY_WITH_GLOBALS);
		poly.registerNode(ParamJsNode, CATEGORY_JS.GLOBALS);
		poly.registerNode(PlaneJsNode, CATEGORY_JS.MATH);
		poly.registerNode(RayFromCursorJsNode, CATEGORY_JS.INPUTS);
		poly.registerNode(RayIntersectPlaneJsNode, CATEGORY_JS.MATH);
		poly.registerNode(SDF2DRoundedXJsNode, CATEGORY_JS.SDF_PRIMITIVES_2D);
		poly.registerNode(SDFBoxJsNode, CATEGORY_JS.SDF_PRIMITIVES);
		poly.registerNode(SDFIntersectJsNode, CATEGORY_JS.SDF_MODIFIERS);
		poly.registerNode(SDFRevolutionJsNode, CATEGORY_JS.SDF_MODIFIERS);
		poly.registerNode(SDFSphereJsNode, CATEGORY_JS.SDF_PRIMITIVES);
		poly.registerNode(SDFSubtractJsNode, CATEGORY_JS.SDF_MODIFIERS);
		poly.registerNode(SDFUnionJsNode, CATEGORY_JS.SDF_MODIFIERS);
		poly.registerNode(SetObjectLookAtJsNode, CATEGORY_JS.ACTION);
		poly.registerNode(SetObjectPositionJsNode, CATEGORY_JS.ACTION);
		poly.registerNode(SetObjectScaleJsNode, CATEGORY_JS.ACTION);
		poly.registerNode(SinJsNode, CATEGORY_JS.MATH);
		poly.registerNode(SubtractJsNode, CATEGORY_JS.MATH);
		poly.registerNode(TwoWaySwitchJsNode, CATEGORY_JS.LOGIC);
		poly.registerNode(Vec2ToFloatJsNode, CATEGORY_JS.CONVERSION);
		poly.registerNode(Vec2ToVec3JsNode, CATEGORY_JS.CONVERSION);
		poly.registerNode(Vec3ToFloatJsNode, CATEGORY_JS.CONVERSION);
		poly.registerNode(Vec3ToVec2JsNode, CATEGORY_JS.CONVERSION);
		poly.registerNode(Vec3ToVec4JsNode, CATEGORY_JS.CONVERSION);
		poly.registerNode(Vec4ToFloatJsNode, CATEGORY_JS.CONVERSION);
		poly.registerNode(Vec4ToVec3JsNode, CATEGORY_JS.CONVERSION);
	}
}
