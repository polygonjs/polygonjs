import Ammo from 'ammojs-typed';
import lodash_isNumber from 'lodash/isNumber';
import {CorePoint} from '../../geometry/Point';
import {TypeAssert} from '../../../engine/poly/Assert';

export enum ForceType {
	DIRECTIONAL = 'directional',
	RADIAL = 'radial',
	// VORTEX = 'vortex',
}
export const FORCE_TYPES: Array<ForceType> = [ForceType.DIRECTIONAL, ForceType.RADIAL];
export const FORCE_TYPE_ATTRIBUTE_NAME = 'force_type';
export enum PhysicsForceType {
	DIRECTIONAL = 'directional',
	RADIAL = 'radial',
}

//
// DIRECTIONAL
//
export enum DirectionalForceAttribute {
	DIRECTION = 'direction',
}
// const DIRECTIONAL_FORCE_ATTRIBUTES: Array<DirectionalForceAttribute> = [DirectionalForceAttribute.DIRECTION];

//
// RADIAL
//
export enum RadialForceAttribute {
	CENTER = 'center',
	AMOUNT = 'amount',
	MAX_DISTANCE = 'max_distance',
	MAX_SPEED = 'max_speed',
}
// const RADIAL_FORCE_ATTRIBUTES: Array<RadialForceAttribute> = [
// 	RadialForceAttribute.CENTER,
// 	RadialForceAttribute.MAX_DISTANCE,
// 	RadialForceAttribute.MAX_SPEED,
// ];
//
// DEFAULT VALUES
//
const DIRECTIONAL_FORCE_DEFAULT_ATTRIBUTE_VALUES = {
	[DirectionalForceAttribute.DIRECTION]: [0, 1, 0] as Number3,
};
const RADIAL_FORCE_DEFAULT_ATTRIBUTE_VALUES = {
	[RadialForceAttribute.CENTER]: [0, 0, 0] as Number3,
	[RadialForceAttribute.AMOUNT]: 1,
	[RadialForceAttribute.MAX_DISTANCE]: 10,
	[RadialForceAttribute.MAX_SPEED]: 10,
};
// type DefaultAttribValuesByForceType = {
// 	[prop: ForceType]: DefaultAttribValues<ForceAttribute>;
// };

export const FORCE_DEFAULT_ATTRIBUTE_VALUES = {
	[ForceType.DIRECTIONAL]: DIRECTIONAL_FORCE_DEFAULT_ATTRIBUTE_VALUES,
	[ForceType.RADIAL]: RADIAL_FORCE_DEFAULT_ATTRIBUTE_VALUES,
	// [ForceType.VORTEX]: [],
};
// export const FORCE_ATTRIBUTES = {
// 	[ForceType.DIRECTIONAL]: DIRECTIONAL_FORCE_ATTRIBUTES,
// 	[ForceType.RADIAL]: RADIAL_FORCE_ATTRIBUTES,
// 	// [ForceType.VORTEX]: [],
// };

export class AmmoForceHelper {
	apply_force(core_point: CorePoint, bodies: Ammo.btRigidBody[]) {
		const type_index = core_point.attrib_value(FORCE_TYPE_ATTRIBUTE_NAME);
		if (!lodash_isNumber(type_index)) {
			console.warn('force type is not a number:', type_index);
			return;
		}
		if (type_index != null) {
			const force_type = FORCE_TYPES[type_index];
			if (force_type) {
				for (let body of bodies) {
					this._apply_force_to_body(core_point, body, force_type);
				}
			}
		}
	}
	private _apply_force_to_body(core_point: CorePoint, body: Ammo.btRigidBody, force_type: ForceType) {
		switch (force_type) {
			case ForceType.DIRECTIONAL: {
				return this._apply_directional_force_to_body(core_point, body);
			}
			case ForceType.RADIAL: {
				return this._apply_radial_force_to_body(core_point, body);
			}
		}
		TypeAssert.unreachable(force_type);
	}

	private _t = new Ammo.btTransform();
	private _impulse = new Ammo.btVector3();
	private _apply_directional_force_to_body(core_point: CorePoint, body: Ammo.btRigidBody) {
		body.getMotionState().getWorldTransform(this._t);

		// const o = this._t.getOrigin();
		// const amount = 0.5;
		this._impulse.setValue(0, 5, 0);
		// const length = impulse.length();
		// if (length > 1) {
		// 	impulse.op_mul(amount / length);
		// }
		// const threshold = 0.001; // no need to apply if very small
		// if (impulse.length() > threshold) {
		body.applyCentralForce(this._impulse);
		// }
	}

	private _apply_radial_force_to_body(core_point: CorePoint, body: Ammo.btRigidBody) {
		body.getMotionState().getWorldTransform(this._t);

		const position = core_point.position();
		const amount = core_point.attrib_value(RadialForceAttribute.AMOUNT);
		if (!lodash_isNumber(amount)) {
			console.warn('force amount is not a number:', amount);
			return;
		}
		const max_distance = core_point.attrib_value(RadialForceAttribute.MAX_DISTANCE);

		const o = this._t.getOrigin();
		this._impulse.setValue(position.x - o.x(), position.y - o.y(), position.z - o.z());
		const length = this._impulse.length();
		if (length < max_distance) {
			if (length > 1) {
				this._impulse.op_mul(amount / length);
			}
			const threshold = 0.001; // no need to apply if very small
			if (this._impulse.length() > threshold) {
				body.applyCentralForce(this._impulse);
			}
		}
	}
}
