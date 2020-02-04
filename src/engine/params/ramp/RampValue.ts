import {_Math} from 'three/src/math/Math';

interface RampPointJson {
	position: number;
	value: number;
}
export interface RampValueJson {
	points: RampPointJson[];
	interpolation: string;
}

export class RampPoint {
	constructor(private _position: number, private _value: number) {}

	to_json(): RampPointJson {
		return {
			position: this._position,
			value: this._value,
		};
	}
	position() {
		return this._position;
	}
	get value() {
		return this._value;
	}

	is_equal(other_point: RampPoint) {
		return this._position == other_point.position() && this._value == other_point.value;
	}
}

export class RampValue {
	private _uuid: string;

	constructor(private _interpolation: string, private _points: RampPoint[]) {
		this._uuid = _Math.generateUUID();
	}

	uuid() {
		return this._uuid;
	}

	static from_json(json: RampValueJson): RampValue {
		const points = [];
		for (let json_point of json.points) {
			points.push(new RampPoint(json_point.position, json_point.value));
		}
		return new RampValue(json.interpolation, points);
	}
	to_json(): RampValueJson {
		return {
			interpolation: this._interpolation,
			points: this._points.map((p) => p.to_json()),
		};
	}
	clone(): RampValue {
		return RampValue.from_json(this.to_json());
	}

	interpolation() {
		return this._interpolation;
	}
	points() {
		return this._points;
	}
	is_equal(other_ramp_value: RampValue): boolean {
		let equal = true;
		if (this._interpolation != other_ramp_value.interpolation()) {
			equal = false;
		}
		const other_points = other_ramp_value.points();
		if (equal) {
			if (this._points.length != other_points.length) {
				equal = false;
			}
		}
		if (equal) {
			let index = 0;
			for (let point of this._points) {
				const other_point = other_points[index];
				if (!point.is_equal(other_point)) {
					equal = false;
				}
				index += 1;
			}
		}

		return equal;
	}
}
