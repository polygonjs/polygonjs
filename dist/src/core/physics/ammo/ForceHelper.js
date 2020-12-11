import Ammo from "ammojs-typed";
import lodash_isNumber from "lodash/isNumber";
import {TypeAssert} from "../../../engine/poly/Assert";
export var ForceType;
(function(ForceType2) {
  ForceType2["DIRECTIONAL"] = "directional";
  ForceType2["RADIAL"] = "radial";
})(ForceType || (ForceType = {}));
export const FORCE_TYPES = [ForceType.DIRECTIONAL, ForceType.RADIAL];
export const FORCE_TYPE_ATTRIBUTE_NAME = "force_type";
export var PhysicsForceType;
(function(PhysicsForceType2) {
  PhysicsForceType2["DIRECTIONAL"] = "directional";
  PhysicsForceType2["RADIAL"] = "radial";
})(PhysicsForceType || (PhysicsForceType = {}));
export var DirectionalForceAttribute;
(function(DirectionalForceAttribute2) {
  DirectionalForceAttribute2["DIRECTION"] = "direction";
})(DirectionalForceAttribute || (DirectionalForceAttribute = {}));
export var RadialForceAttribute;
(function(RadialForceAttribute2) {
  RadialForceAttribute2["CENTER"] = "center";
  RadialForceAttribute2["AMOUNT"] = "amount";
  RadialForceAttribute2["MAX_DISTANCE"] = "max_distance";
  RadialForceAttribute2["MAX_SPEED"] = "max_speed";
})(RadialForceAttribute || (RadialForceAttribute = {}));
const DIRECTIONAL_FORCE_DEFAULT_ATTRIBUTE_VALUES = {
  [DirectionalForceAttribute.DIRECTION]: [0, 1, 0]
};
const RADIAL_FORCE_DEFAULT_ATTRIBUTE_VALUES = {
  [RadialForceAttribute.CENTER]: [0, 0, 0],
  [RadialForceAttribute.AMOUNT]: 1,
  [RadialForceAttribute.MAX_DISTANCE]: 10,
  [RadialForceAttribute.MAX_SPEED]: 10
};
export const FORCE_DEFAULT_ATTRIBUTE_VALUES = {
  [ForceType.DIRECTIONAL]: DIRECTIONAL_FORCE_DEFAULT_ATTRIBUTE_VALUES,
  [ForceType.RADIAL]: RADIAL_FORCE_DEFAULT_ATTRIBUTE_VALUES
};
export class AmmoForceHelper {
  constructor() {
    this._t = new Ammo.btTransform();
    this._impulse = new Ammo.btVector3();
  }
  apply_force(core_point, bodies) {
    const type_index = core_point.attrib_value(FORCE_TYPE_ATTRIBUTE_NAME);
    if (!lodash_isNumber(type_index)) {
      console.warn("force type is not a number:", type_index);
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
  _apply_force_to_body(core_point, body, force_type) {
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
  _apply_directional_force_to_body(core_point, body) {
    body.getMotionState().getWorldTransform(this._t);
    this._impulse.setValue(0, 5, 0);
    body.applyCentralForce(this._impulse);
  }
  _apply_radial_force_to_body(core_point, body) {
    body.getMotionState().getWorldTransform(this._t);
    const position = core_point.position();
    const amount = core_point.attrib_value(RadialForceAttribute.AMOUNT);
    if (!lodash_isNumber(amount)) {
      console.warn("force amount is not a number:", amount);
      return;
    }
    const max_distance = core_point.attrib_value(RadialForceAttribute.MAX_DISTANCE);
    const o = this._t.getOrigin();
    this._impulse.setValue(o.x() - position.x, o.y() - position.y, o.z() - position.z);
    const length = this._impulse.length();
    if (length < max_distance) {
      if (length != 0) {
        this._impulse.op_mul(amount / length);
      }
      const threshold = 1e-3;
      if (this._impulse.length() > threshold) {
        body.applyCentralForce(this._impulse);
      }
    }
  }
}
