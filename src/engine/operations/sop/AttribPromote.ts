import {TypeAssert} from './../../poly/Assert';
import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {AttribClass, ATTRIBUTE_CLASSES} from '../../../core/geometry/Constant';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {coreObjectInstanceFactory} from '../../../core/geometry/CoreObjectFactory';
import {CoreObjectType} from '../../../core/geometry/ObjectContent';
import {filterObjectsFromCoreGroup} from '../../../core/geometry/Mask';
import {CoreEntity} from '../../../core/geometry/CoreEntity';
import {ENTITY_CLASS_FACTORY} from '../../../core/geometry/CoreObjectFactory';
import {arrayMin, arrayMax, ArrayToItemFunction} from '../../../core/ArrayUtils';
import {AttribValue} from '../../../types/GlobalTypes';
import {isNumber, isString, isBoolean} from '../../../core/Type';
import {Vector2, Vector3, Vector4, Color} from 'three';
const _v2 = new Vector2();
const _v3 = new Vector3();
const _v4 = new Vector4();
const _c = new Color();

interface AttribPromoteSopParams extends DefaultOperationParams {
	group: string;
	classFrom: number;
	classTo: number;
	mode: number;
	name: string;
}

export enum AttribPromoteMode {
	MIN = 'min',
	MAX = 'max',
	FIRST_FOUND = 'first found',
}
export const ATTRIB_PROMOTE_MODES: AttribPromoteMode[] = [
	AttribPromoteMode.MIN,
	AttribPromoteMode.MAX,
	AttribPromoteMode.FIRST_FOUND,
];

export class AttribPromoteSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: AttribPromoteSopParams = {
		group: '',
		classFrom: ATTRIBUTE_CLASSES.indexOf(AttribClass.POINT),
		classTo: ATTRIBUTE_CLASSES.indexOf(AttribClass.OBJECT),
		mode: ATTRIB_PROMOTE_MODES.indexOf(AttribPromoteMode.FIRST_FOUND),
		name: '',
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<'attribPromote'> {
		return 'attribPromote';
	}

	override cook(inputCoreGroups: CoreGroup[], params: AttribPromoteSopParams) {
		const coreGroup = inputCoreGroups[0];

		const classFrom = ATTRIBUTE_CLASSES[params.classFrom];
		const classTo = ATTRIBUTE_CLASSES[params.classTo];
		const mode = ATTRIB_PROMOTE_MODES[params.mode];

		const objects = filterObjectsFromCoreGroup(coreGroup, params);
		for (const object of objects) {
			const factoryFrom = ENTITY_CLASS_FACTORY[classFrom];
			const factoryTo = ENTITY_CLASS_FACTORY[classTo];
			const attribNames = factoryFrom
				? factoryFrom(object).attributeNamesMatchingMask(object, params.name)
				: coreGroup.attributeNamesMatchingMask(params.name);

			// add attribute if it does not exist on the dest entities
			for (const attribName of attribNames) {
				const hasAttribute = factoryTo
					? factoryTo(object).hasAttribute(object, attribName)
					: coreGroup.hasAttribute(attribName);
				if (!hasAttribute) {
					const srcAttribSize: number | null = factoryFrom
						? factoryFrom(object).attribSize(object, attribName)
						: coreGroup.attribSize(attribName);
					if (srcAttribSize != null) {
						if (factoryTo) {
							factoryTo(object).addNumericAttribute(object, attribName, srcAttribSize);
						} else {
							coreGroup.addNumericAttribute(attribName, srcAttribSize);
						}
					}
				}
			}

			// promote attribute
			const destEntities: CoreEntity[] = [];
			const srcEntities: CoreEntity[] = [];
			coreObjectInstanceFactory(object).relatedEntities(classTo, coreGroup, destEntities);
			for (const destEntity of destEntities) {
				destEntity.relatedEntities(classFrom, coreGroup, srcEntities);
				for (const attribName of attribNames) {
					this._promoteAttribute(attribName, srcEntities, destEntity, mode);
				}
			}
		}

		return coreGroup;
	}

	private _promoteAttribute<T extends CoreObjectType>(
		attribName: string,
		srcEntities: CoreEntity[],
		destEntity: CoreEntity,
		mode: AttribPromoteMode
	) {
		const srcValues = srcEntities.map((entity) => entity.attribValue(attribName)!);
		const destValue = this._convertSrcValues(srcValues, mode);
		destEntity.setAttribValue(attribName, destValue as any);
	}
	private _convertSrcValues(srcValues: AttribValue[], mode: AttribPromoteMode): AttribValue {
		switch (mode) {
			case AttribPromoteMode.MIN: {
				return this._convertValuesMin(srcValues);
			}
			case AttribPromoteMode.MAX: {
				return this._convertValuesMax(srcValues);
			}
			case AttribPromoteMode.FIRST_FOUND: {
				return this._convertValuesFirstFound(srcValues);
			}
		}
		TypeAssert.unreachable(mode);
	}
	private _convertValuesMin(srcValues: AttribValue[]): AttribValue {
		return this._convertValuesMinMax(srcValues, arrayMin);
	}
	private _convertValuesMax(srcValues: AttribValue[]): AttribValue {
		return this._convertValuesMinMax(srcValues, arrayMax);
	}
	private _convertValuesMinMax(srcValues: AttribValue[], arrayFunc: ArrayToItemFunction<number>): AttribValue {
		const firstValue = srcValues[0];
		if (isNumber(firstValue) || isString(firstValue) || isBoolean(firstValue)) {
			return arrayFunc(srcValues as number[]);
		}

		if (firstValue instanceof Vector2) {
			_v2.x = arrayFunc((srcValues as Vector2[]).map((v) => v.x));
			_v2.y = arrayFunc((srcValues as Vector2[]).map((v) => v.y));
			return _v2;
		}
		if (firstValue instanceof Vector3) {
			_v3.x = arrayFunc((srcValues as Vector3[]).map((v) => v.x));
			_v3.y = arrayFunc((srcValues as Vector3[]).map((v) => v.y));
			_v3.z = arrayFunc((srcValues as Vector3[]).map((v) => v.z));
			return _v3;
		}
		if (firstValue instanceof Color) {
			_c.r = arrayFunc((srcValues as Color[]).map((c) => c.r));
			_c.g = arrayFunc((srcValues as Color[]).map((c) => c.g));
			_c.b = arrayFunc((srcValues as Color[]).map((c) => c.b));
			return _c;
		}
		if (firstValue instanceof Vector4) {
			_v4.x = arrayFunc((srcValues as Vector4[]).map((v) => v.x));
			_v4.y = arrayFunc((srcValues as Vector4[]).map((v) => v.y));
			_v4.z = arrayFunc((srcValues as Vector4[]).map((v) => v.z));
			_v4.w = arrayFunc((srcValues as Vector4[]).map((v) => v.w));
			return _v4;
		}
		return 0;
	}
	private _convertValuesFirstFound(srcValues: AttribValue[]): AttribValue {
		return srcValues[0];
	}
}
