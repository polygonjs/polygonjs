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

import {AttributeJsNode} from '../../../nodes/js/Attribute';
import {ConstantJsNode} from '../../../nodes/js/Constant';
import {GlobalsJsNode} from '../../../nodes/js/Globals';
import {OutputJsNode} from '../../../nodes/js/Output';
import {ParamJsNode} from '../../../nodes/js/Param';
import {SDF2DRoundedXJsNode} from '../../../nodes/js/SDF2DRoundedX';
import {SDFBoxJsNode} from '../../../nodes/js/SDFBox';
import {SDFIntersectJsNode} from '../../../nodes/js/SDFIntersect';
import {SDFRevolutionJsNode} from '../../../nodes/js/SDFRevolution';
import {SDFSphereJsNode} from '../../../nodes/js/SDFSphere';
import {SDFSubtractJsNode} from '../../../nodes/js/SDFSubtract';
import {SDFUnionJsNode} from '../../../nodes/js/SDFUnion';

export interface JsNodeChildrenMap {
	attribute: AttributeJsNode;
	constant: ConstantJsNode;
	globals: GlobalsJsNode;
	output: OutputJsNode;
	param: ParamJsNode;
	SDF2DRoundedX: SDF2DRoundedXJsNode;
	SDFBox: SDFBoxJsNode;
	SDFIntersect: SDFIntersectJsNode;
	SDFRevolution: SDFRevolutionJsNode;
	SDFSphere: SDFSphereJsNode;
	SDFSubtract: SDFSubtractJsNode;
	SDFUnion: SDFUnionJsNode;
	vec2ToFloat: Vec2ToFloatJsNode;
	vec2ToVec3: Vec2ToVec3JsNode;
	vec3ToFloat: Vec3ToFloatJsNode;
	vec3ToVec2: Vec3ToVec2JsNode;
	vec3ToVec4: Vec3ToVec4JsNode;
	vec4ToFloat: Vec4ToFloatJsNode;
	vec4ToVec3: Vec4ToVec3JsNode;
}

import {PolyEngine} from '../../../Poly';
export class JsRegister {
	static run(poly: PolyEngine) {
		// poly.registerNode(AttributeJsNode, CATEGORY_JS.GLOBALS);
		poly.registerNode(ConstantJsNode, CATEGORY_JS.GLOBALS);
		poly.registerNode(GlobalsJsNode, CATEGORY_JS.GLOBALS);
		poly.registerNode(OutputJsNode, CATEGORY_JS.GLOBALS);
		poly.registerNode(ParamJsNode, CATEGORY_JS.GLOBALS);
		poly.registerNode(SDF2DRoundedXJsNode, CATEGORY_JS.SDF_PRIMITIVES_2D);
		poly.registerNode(SDFBoxJsNode, CATEGORY_JS.SDF_PRIMITIVES);
		poly.registerNode(SDFIntersectJsNode, CATEGORY_JS.SDF_MODIFIERS);
		poly.registerNode(SDFRevolutionJsNode, CATEGORY_JS.SDF_MODIFIERS);
		poly.registerNode(SDFSphereJsNode, CATEGORY_JS.SDF_PRIMITIVES);
		poly.registerNode(SDFSubtractJsNode, CATEGORY_JS.SDF_MODIFIERS);
		poly.registerNode(SDFUnionJsNode, CATEGORY_JS.SDF_MODIFIERS);
		poly.registerNode(Vec2ToFloatJsNode, CATEGORY_JS.CONVERSION);
		poly.registerNode(Vec2ToVec3JsNode, CATEGORY_JS.CONVERSION);
		poly.registerNode(Vec3ToFloatJsNode, CATEGORY_JS.CONVERSION);
		poly.registerNode(Vec3ToVec2JsNode, CATEGORY_JS.CONVERSION);
		poly.registerNode(Vec3ToVec4JsNode, CATEGORY_JS.CONVERSION);
		poly.registerNode(Vec4ToFloatJsNode, CATEGORY_JS.CONVERSION);
		poly.registerNode(Vec4ToVec3JsNode, CATEGORY_JS.CONVERSION);
	}
}
