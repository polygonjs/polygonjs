/**
 * Populates informations from an IntersectData into its parameters
 *
 * @remarks
 *
 * This node typically works with the event/raycast
 *
 */
import {TypedEventNode} from './_Base';
import {
	AttribType,
	ATTRIBUTE_TYPES,
	AttribTypeMenuEntries,
	objectTypeFromConstructor,
	ObjectType,
} from '../../../core/geometry/Constant';
import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';
import {Intersection} from 'three/src/core/Raycaster';
import {Vector3} from 'three/src/math/Vector3';
import {Vector2} from 'three/src/math/Vector2';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {EventContext} from '../../scene/utils/events/_BaseEventsController';
import {CoreObject} from '../../../core/geometry/Object';
import {CoreType} from '../../../core/Type';
import {BufferAttribute} from 'three/src/core/BufferAttribute';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {Mesh} from 'three/src/objects/Mesh';
import {Triangle} from 'three/src/math/Triangle';
import {CoreGeometry} from '../../../core/geometry/Geometry';
import {TypeAssert} from '../../poly/Assert';
import {Points} from 'three/src/objects/Points';

export enum TargetType {
	SCENE_GRAPH = 'scene graph',
	NODE = 'node',
}
export const TARGET_TYPES: TargetType[] = [TargetType.SCENE_GRAPH, TargetType.NODE];

class IntersectDataParamsConfig extends NodeParamsConfig {
	/** @param geometry vertex attribute to read */
	attributeName = ParamConfig.STRING('id', {
		cook: false,
	});
	/** @param type of attribute */
	attributeType = ParamConfig.INTEGER(ATTRIBUTE_TYPES.indexOf(AttribType.NUMERIC), {
		menu: {
			entries: AttribTypeMenuEntries,
		},
	});
	/** @param attribute value for float */
	attributeValue1 = ParamConfig.FLOAT(0, {
		cook: false,
		visibleIf: {
			attributeType: ATTRIBUTE_TYPES.indexOf(AttribType.NUMERIC),
		},
	});
	/** @param attribute value that attributeValue1 is set to when no object is intersected */
	resetValue1 = ParamConfig.FLOAT(-1, {
		cook: false,
		visibleIf: {
			attributeType: ATTRIBUTE_TYPES.indexOf(AttribType.NUMERIC),
		},
	});
	/** @param attribute value for string */
	attributeValues = ParamConfig.STRING('', {
		visibleIf: {
			attributeType: ATTRIBUTE_TYPES.indexOf(AttribType.STRING),
		},
	});
	/** @param attribute value that attributeValues is set to when no object is intersected */
	resetValues = ParamConfig.STRING('', {
		visibleIf: {
			attributeType: ATTRIBUTE_TYPES.indexOf(AttribType.STRING),
		},
	});
}
const ParamsConfig = new IntersectDataParamsConfig();

export class IntersectDataEventNode extends TypedEventNode<IntersectDataParamsConfig> {
	paramsConfig = ParamsConfig;

	static type() {
		return 'intersectData';
	}
	static readonly INPUT_HIT = 'hit';
	static readonly INPUT_MISS = 'miss';

	initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new EventConnectionPoint(
				IntersectDataEventNode.INPUT_HIT,
				EventConnectionPointType.BASE,
				this._processHit.bind(this)
			),
			new EventConnectionPoint(
				IntersectDataEventNode.INPUT_MISS,
				EventConnectionPointType.BASE,
				this._processMiss.bind(this)
			),
		]);
	}

	private _processHit(context: EventContext<Event>) {
		const intersect = context.value?.intersect;
		if (!intersect) {
			return;
		}
		this._resolveIntersectAttribute(intersect);
	}
	private _processMiss(context: EventContext<Event>) {
		const attribType = ATTRIBUTE_TYPES[this.pv.attributeType];
		switch (attribType) {
			case AttribType.NUMERIC: {
				this.p.attributeValue1.set(this.pv.resetValue1);
				return;
			}
			case AttribType.STRING: {
				this.p.attributeValues.set(this.pv.resetValues);
				return;
			}
		}
		TypeAssert.unreachable(attribType);
	}

	private _resolveIntersectAttribute(intersection: Intersection) {
		const attribType = ATTRIBUTE_TYPES[this.pv.attributeType];
		let attribValue = IntersectDataEventNode.resolveObjectAttribute(intersection, this.pv.attributeName);
		if (attribValue == null) {
			attribValue = IntersectDataEventNode.resolveGeometryAttribute(
				intersection,
				this.pv.attributeName,
				attribType
			);
		}
		if (attribValue != null) {
			switch (attribType) {
				case AttribType.NUMERIC: {
					this.p.attributeValue1.set(attribValue);
					return;
				}
				case AttribType.STRING: {
					if (CoreType.isString(attribValue)) {
						this.p.attributeValues.set(attribValue);
					}
					return;
				}
			}
			TypeAssert.unreachable(attribType);
		}
	}

	static resolveObjectAttribute(intersection: Intersection, attribName: string) {
		const value = CoreObject.attribValue(intersection.object, attribName);
		if (value == null) {
			return;
		}
		if (CoreType.isNumber(value) || CoreType.isString(value)) {
			return value;
		}
		if (CoreType.isArray(value)) {
			return value[0];
		}
		if (CoreType.isVector(value)) {
			return value.x;
		}
	}
	static resolveGeometryAttribute(intersection: Intersection, attribName: string, attribType: AttribType) {
		const objectType = objectTypeFromConstructor(intersection.object.constructor);
		switch (objectType) {
			case ObjectType.MESH:
				return this.resolveGeometryAttributeForMesh(intersection, attribName, attribType);
			case ObjectType.POINTS:
				return this.resolveGeometryAttributeForPoint(intersection, attribName, attribType);
		}
		// TODO: have the raycast cpu controller work with all object types
		// TypeAssert.unreachable(object_type)
	}

	private static _vA = new Vector3();
	private static _vB = new Vector3();
	private static _vC = new Vector3();
	private static _uvA = new Vector2();
	private static _uvB = new Vector2();
	private static _uvC = new Vector2();
	private static _hitUV = new Vector2();
	static resolveGeometryAttributeForMesh(intersection: Intersection, attribName: string, attribType: AttribType) {
		const geometry = (intersection.object as Mesh).geometry as BufferGeometry;
		if (geometry) {
			const attribute = geometry.getAttribute(attribName) as BufferAttribute;
			if (attribute) {
				switch (attribType) {
					case AttribType.NUMERIC: {
						const position = geometry.getAttribute('position') as BufferAttribute;
						if (intersection.face) {
							this._vA.fromBufferAttribute(position, intersection.face.a);
							this._vB.fromBufferAttribute(position, intersection.face.b);
							this._vC.fromBufferAttribute(position, intersection.face.c);
							this._uvA.fromBufferAttribute(attribute, intersection.face.a);
							this._uvB.fromBufferAttribute(attribute, intersection.face.b);
							this._uvC.fromBufferAttribute(attribute, intersection.face.c);
							intersection.uv = Triangle.getUV(
								intersection.point,
								this._vA,
								this._vB,
								this._vC,
								this._uvA,
								this._uvB,
								this._uvC,
								this._hitUV
							);
							return this._hitUV.x;
						}
						return;
					}
					case AttribType.STRING: {
						const core_geometry = new CoreGeometry(geometry);
						const core_point = core_geometry.points()[0];
						if (core_point) {
							return core_point.stringAttribValue(attribName);
						}
						return;
					}
				}
				TypeAssert.unreachable(attribType);
			}
		}
	}
	static resolveGeometryAttributeForPoint(intersection: Intersection, attribName: string, attribType: AttribType) {
		const geometry = (intersection.object as Points).geometry as BufferGeometry;
		if (geometry && intersection.index != null) {
			switch (attribType) {
				case AttribType.NUMERIC: {
					const attribute = geometry.getAttribute(attribName);
					if (attribute) {
						return attribute.array[intersection.index];
					}
					return;
				}
				case AttribType.STRING: {
					const core_geometry = new CoreGeometry(geometry);
					const core_point = core_geometry.points()[intersection.index];
					if (core_point) {
						return core_point.stringAttribValue(attribName);
					}
					return;
				}
			}
			TypeAssert.unreachable(attribType);
		}
	}
}
