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
import {GlobalsJsNode} from '../../../nodes/js/Globals';
import {OutputJsNode} from '../../../nodes/js/Output';
import {ParamJsNode} from '../../../nodes/js/Param';
import {SDFSphereJsNode} from '../../../nodes/js/SDFSphere';

export interface JsNodeChildrenMap {
	attribute: AttributeJsNode;
	globals: GlobalsJsNode;
	output: OutputJsNode;
	param: ParamJsNode;
	SDFSphere: SDFSphereJsNode;
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
		poly.registerNode(AttributeJsNode, CATEGORY_JS.GLOBALS);
		poly.registerNode(GlobalsJsNode, CATEGORY_JS.GLOBALS);
		poly.registerNode(OutputJsNode, CATEGORY_JS.GLOBALS);
		poly.registerNode(ParamJsNode, CATEGORY_JS.GLOBALS);
		poly.registerNode(SDFSphereJsNode, CATEGORY_JS.SDF);
		poly.registerNode(Vec2ToFloatJsNode, CATEGORY_JS.CONVERSION);
		poly.registerNode(Vec2ToVec3JsNode, CATEGORY_JS.CONVERSION);
		poly.registerNode(Vec3ToFloatJsNode, CATEGORY_JS.CONVERSION);
		poly.registerNode(Vec3ToVec2JsNode, CATEGORY_JS.CONVERSION);
		poly.registerNode(Vec3ToVec4JsNode, CATEGORY_JS.CONVERSION);
		poly.registerNode(Vec4ToFloatJsNode, CATEGORY_JS.CONVERSION);
		poly.registerNode(Vec4ToVec3JsNode, CATEGORY_JS.CONVERSION);
	}
}
