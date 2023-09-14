/**
 * Remaps an attribute
 *
 * @remarks
 * This is very handy when you have an attribute with values between 0 and 1, and you want to remap those values with a ramp.
 *
 */
import {Vector2} from 'three';
import {Vector3} from 'three';
import {Vector4} from 'three';
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {AttribSize} from '../../../core/geometry/Constant';
import {TypeAssert} from '../../poly/Assert';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {AttribValue, NumericAttribValue} from '../../../types/GlobalTypes';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {CoreObjectType, ObjectContent} from '../../../core/geometry/ObjectContent';
import {pointsFromObject} from '../../../core/geometry/entities/point/CorePointUtils';
import {corePointClassFactory} from '../../../core/geometry/CoreObjectFactory';
class AttribRemapSopParamsConfig extends NodeParamsConfig {
	/** @param name of the attribute to remap */
	name = ParamConfig.STRING();
	/** @param ramp used to remap */
	ramp = ParamConfig.RAMP();
	/** @param toggle if you want to create a new attribute */
	changeName = ParamConfig.BOOLEAN(0);
	/** @param new attribute name */
	newName = ParamConfig.STRING('', {visibleIf: {changeName: 1}});
}
const ParamsConfig = new AttribRemapSopParamsConfig();

export class AttribRemapSopNode extends TypedSopNode<AttribRemapSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'attribRemap';
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup = inputCoreGroups[0];
		const objects = coreGroup.allObjects();
		for (const object of objects) {
			this._remapAttribute(object);
		}
		this.setCoreGroup(coreGroup);
	}

	private _remapAttribute<T extends CoreObjectType>(object: ObjectContent<T>) {
		const points = pointsFromObject(object);
		if (points.length === 0) {
			return;
		}
		if (this.pv.name === '') {
			return;
		}
		const corePointClass = corePointClassFactory(object);

		const attribSize = corePointClass.attribSize(object, this.pv.name);
		const values = points.map((point) => point.attribValue(this.pv.name));
		// let min: NumericAttribValue, max: NumericAttribValue;
		let remaped_values: NumericAttribValue[] = new Array(points.length);
		this._get_remaped_values(attribSize, values, remaped_values);

		let targetName = this.pv.name;
		if (isBooleanTrue(this.pv.changeName)) {
			targetName = this.pv.newName;
			if (!corePointClass.hasAttrib(object, targetName)) {
				corePointClass.addNumericAttribute(object, targetName, attribSize, 0);
			}
		}

		let i = 0;
		for (let normalized_value of remaped_values) {
			const point = points[i];
			point.setAttribValue(targetName, normalized_value);
			i++;
		}
	}

	private _get_remaped_values(attrib_size: AttribSize, values: AttribValue[], remaped_values: NumericAttribValue[]) {
		switch (attrib_size) {
			case AttribSize.FLOAT:
				return this._getNormalizedFloat(values, remaped_values);
			case AttribSize.VECTOR2:
				return this._getNormalizedVector2(values, remaped_values);
			case AttribSize.VECTOR3:
				return this._getNormalizedVector3(values, remaped_values);
			case AttribSize.VECTOR4:
				return this._getNormalizedVector4(values, remaped_values);
		}
		TypeAssert.unreachable(attrib_size);
	}

	private _getNormalizedFloat(values: AttribValue[], remaped_values: NumericAttribValue[]) {
		const valuesf = values as number[];

		const ramp_param = this.p.ramp;

		for (let i = 0; i < valuesf.length; i++) {
			const value = valuesf[i];
			const remaped_value = ramp_param.valueAtPosition(value);
			remaped_values[i] = remaped_value;
		}
	}
	private _getNormalizedVector2(values: AttribValue[], remaped_values: NumericAttribValue[]) {
		const valuesv = values as Vector2[];
		const ramp_param = this.p.ramp;
		for (let i = 0; i < valuesv.length; i++) {
			const value = valuesv[i];
			const remaped_value = new Vector2(ramp_param.valueAtPosition(value.x), ramp_param.valueAtPosition(value.y));
			remaped_values[i] = remaped_value;
		}
	}
	private _getNormalizedVector3(values: AttribValue[], remaped_values: NumericAttribValue[]) {
		const valuesv = values as Vector3[];
		const ramp_param = this.p.ramp;
		for (let i = 0; i < valuesv.length; i++) {
			const value = valuesv[i];
			const remaped_value = new Vector3(
				ramp_param.valueAtPosition(value.x),
				ramp_param.valueAtPosition(value.y),
				ramp_param.valueAtPosition(value.z)
			);
			remaped_values[i] = remaped_value;
		}
	}
	private _getNormalizedVector4(values: AttribValue[], remaped_values: NumericAttribValue[]) {
		const valuesv = values as Vector4[];
		const ramp_param = this.p.ramp;
		for (let i = 0; i < valuesv.length; i++) {
			const value = valuesv[i];
			const remaped_value = new Vector4(
				ramp_param.valueAtPosition(value.x),
				ramp_param.valueAtPosition(value.y),
				ramp_param.valueAtPosition(value.z),
				ramp_param.valueAtPosition(value.w)
			);
			remaped_values[i] = remaped_value;
		}
	}
}
