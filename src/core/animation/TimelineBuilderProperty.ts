import lodash_isNumber from 'lodash/isNumber';
import {Vector2} from 'three/src/math/Vector2';
import {Vector3} from 'three/src/math/Vector3';
import {Vector4} from 'three/src/math/Vector4';
import {Scene} from 'three/src/scenes/Scene';
import {Object3D} from 'three';
import {CoreString} from '../String';

type TargetValue = number | Vector2 | Vector3 | Vector4;
export class TimelineBuilderProperty {
	private _target_mask: string | undefined;
	private _duration: number = 1;
	private _easing: string | undefined;
	constructor(private _property_name: string, private _target_value: TargetValue, private _update_matrix: boolean) {}
	name() {
		return this._property_name;
	}
	target_value() {
		return this._target_value;
	}

	clone() {
		const new_target_value = lodash_isNumber(this._target_value) ? this._target_value : this._target_value.clone();
		return new TimelineBuilderProperty(this._property_name, new_target_value, this._update_matrix);
	}

	set_target_mask(target_mask: string) {
		this._target_mask = target_mask;
	}
	set_duration(duration: number) {
		if (duration >= 0) {
			this._duration = duration;
		}
	}
	set_easing(easing: string) {
		this._easing = easing;
	}

	add_to_timeline(timeline: gsap.core.Timeline, scene: Scene) {
		if (!this._target_mask) {
			return;
		}
		const objects: Object3D[] = [];
		const mask = this._target_mask;
		scene.traverse((object) => {
			if (CoreString.match_mask(object.name, mask)) {
				objects.push(object);
			}
		});

		for (let object3d of objects) {
			const vars: gsap.TweenVars = {duration: this._duration};
			if (this._easing) {
				vars.ease = this._easing;
			}

			if (this._update_matrix) {
				vars.onUpdateParams = [object3d];
				vars.onUpdate = (object3d: Object3D) => {
					object3d.updateMatrix();
				};
			}
			const target_property = (object3d as any)[this._property_name as any] as object;
			let to_target: object;
			if (target_property) {
				if (lodash_isNumber(this._target_value)) {
					vars[this._property_name] = this._target_value;
					to_target = object3d;
				} else {
					to_target = target_property;
					vars['x'] = this._target_value.x;
					vars['y'] = this._target_value.y;
					if (this._target_value instanceof Vector3) {
						vars['z'] = this._target_value.z;
					} else {
						if (this._target_value instanceof Vector4) {
							vars['z'] = this._target_value.z;
							vars['w'] = this._target_value.w;
						}
					}
				}
				timeline.to(to_target, vars, 0);
			}
		}
	}
}
