import {generateUUID} from 'three/src/math/MathUtils';

export interface RampPointJson {
	position: number;
	value: number;
}
export interface RampValueJson {
	points: RampPointJson[];
	interpolation: RampInterpolation;
}

export class RampPoint {
	constructor(private _position: number = 0, private _value: number = 0) {}

	toJSON(): RampPointJson {
		return {
			position: this._position,
			value: this._value,
		};
	}
	position() {
		return this._position;
	}
	value() {
		return this._value;
	}
	copy(point: RampPoint) {
		this._position = point.position();
		this._value = point.value();
	}
	clone() {
		const point = new RampPoint();
		point.copy(this);
		return point;
	}
	isEqual(other_point: RampPoint) {
		return this._position == other_point.position() && this._value == other_point.value();
	}
	isEqualJSON(json: RampPointJson) {
		return this._position == json.position && this._value == json.value;
	}
	fromJSON(json: RampPointJson) {
		this._position = json.position;
		this._value = json.value;
	}
	static areEqualJSON(json1: RampPointJson, json2: RampPointJson) {
		return json1.position == json2.position && json1.value == json2.value;
	}
	static fromJSON(json: RampPointJson) {
		return new RampPoint(json.position, json.value);
	}
}

export enum RampInterpolation {
	CUBIC = 'cubic',
}
export const RAMP_INTERPOLATIONS: RampInterpolation[] = [RampInterpolation.CUBIC];
export class RampValue {
	private _uuid: string;

	constructor(
		private _interpolation: RampInterpolation = RampInterpolation.CUBIC,
		private _points: RampPoint[] = []
	) {
		this._uuid = generateUUID();
	}

	uuid() {
		return this._uuid;
	}
	interpolation() {
		return this._interpolation;
	}
	points() {
		return this._points;
	}
	static fromJSON(json: RampValueJson): RampValue {
		const points = [];
		for (let jsonPoint of json.points) {
			points.push(RampPoint.fromJSON(jsonPoint));
		}
		let interpolation = json.interpolation;
		if (interpolation == null || (interpolation as string) == '') {
			interpolation = RampInterpolation.CUBIC;
		}
		return new RampValue(interpolation, points);
	}
	toJSON(): RampValueJson {
		return {
			interpolation: this._interpolation,
			points: this._points.map((p) => p.toJSON()),
		};
	}
	clone(): RampValue {
		const ramp = new RampValue();
		ramp.copy(this);
		return ramp;
	}
	copy(ramp: RampValue) {
		this._interpolation = ramp.interpolation();
		let index = 0;
		if (this._points.length > ramp.points().length) {
			this._points.splice(0, ramp.points().length);
		}

		for (let point of ramp.points()) {
			const current_point = this._points[index];
			if (current_point) {
				current_point.copy(point);
			} else {
				this._points.push(point.clone());
			}
			index += 1;
		}
	}

	isEqual(other_ramp_value: RampValue): boolean {
		if (this._interpolation != other_ramp_value.interpolation()) {
			return false;
		}
		const other_points = other_ramp_value.points();
		if (this._points.length != other_points.length) {
			return false;
		}
		let index = 0;
		for (let point of this._points) {
			const other_point = other_points[index];
			if (!point.isEqual(other_point)) {
				return false;
			}
			index += 1;
		}

		return true;
	}
	isEqualJSON(json: RampValueJson) {
		if (this._interpolation != json.interpolation) {
			return false;
		}
		if (this._points.length != json.points.length) {
			return false;
		}
		let index = 0;
		for (let point of this._points) {
			const other_point = json.points[index];
			if (!point.isEqualJSON(other_point)) {
				return false;
			}
			index += 1;
		}
		return true;
	}
	static are_json_equal(json1: RampValueJson, json2: RampValueJson) {
		if (json1.interpolation != json2.interpolation) {
			return false;
		}
		if (json1.points.length != json2.points.length) {
			return false;
		}
		let index = 0;
		for (let point1 of json1.points) {
			const point2 = json2.points[index];
			if (!RampPoint.areEqualJSON(point1, point2)) {
				return false;
			}
			index += 1;
		}
		return true;
	}
	from_json(json: RampValueJson) {
		this._interpolation = json.interpolation;

		let index = 0;
		for (let json_point of json.points) {
			const current_point = this._points[index];
			if (current_point) {
				current_point.fromJSON(json_point);
			} else {
				this._points.push(RampPoint.fromJSON(json_point));
			}
			index += 1;
		}
	}
}
