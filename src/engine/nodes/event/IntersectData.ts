/**
 * Populates informations from an IntersectData into its parameters
 *
 * @remarks
 *
 * This node typically works with the event/raycast
 *
 */
import {TypedEventNode} from './_Base';
import {AttribType, ATTRIBUTE_TYPES, AttribTypeMenuEntries} from '../../../core/geometry/Constant';
import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';
import {Intersection} from 'three';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {EventContext} from '../../scene/utils/events/_BaseEventsController';
import {CoreObject} from '../../../core/geometry/Object';
import {CoreType} from '../../../core/Type';
import {TypeAssert} from '../../poly/Assert';
import {resolveIntersectGeometryAttribute} from '../../../core/geometry/intersect/CoreIntersect';

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
	override paramsConfig = ParamsConfig;

	static override type() {
		return 'intersectData';
	}
	static readonly INPUT_HIT = 'hit';
	static readonly INPUT_MISS = 'miss';

	override initializeNode() {
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
			attribValue = resolveIntersectGeometryAttribute(intersection, this.pv.attributeName, attribType);
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
}
