// import {Vector3} from 'three';

// /**
//  * Represents a 3D vector.
//  */
// export class Vector {
// 	constructor(public x = 0, public y = 0, public z = 0) {}

// 	copy(v: Vector | Vector3): Vector {
// 		this.x = v.x;
// 		this.y = v.y;
// 		this.z = v.z;
// 		return this;
// 	}

// 	clone(): Vector {
// 		return new Vector(this.x, this.y, this.z);
// 	}

// 	negate(): Vector {
// 		this.x *= -1;
// 		this.y *= -1;
// 		this.z *= -1;
// 		return this;
// 	}

// 	add(a: Vector): Vector {
// 		this.x += a.x;
// 		this.y += a.y;
// 		this.z += a.z;
// 		return this;
// 	}

// 	sub(a: Vector): Vector {
// 		this.x -= a.x;
// 		this.y -= a.y;
// 		this.z -= a.z;
// 		return this;
// 	}

// 	times(a: number): Vector {
// 		this.x *= a;
// 		this.y *= a;
// 		this.z *= a;
// 		return this;
// 	}

// 	dividedBy(a: number): Vector {
// 		this.x /= a;
// 		this.y /= a;
// 		this.z /= a;
// 		return this;
// 	}

// 	lerp(a: Vector, t: number): Vector {
// 		return this.add(new Vector().copy(a).sub(this).times(t));
// 	}

// 	unit(): Vector {
// 		return this.dividedBy(this.length());
// 	}

// 	length(): number {
// 		return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
// 	}

// 	normalize(): Vector {
// 		return this.unit();
// 	}

// 	cross(b: Vector): Vector {
// 		const a = this.clone();
// 		const ax = a.x,
// 			ay = a.y,
// 			az = a.z;
// 		const bx = b.x,
// 			by = b.y,
// 			bz = b.z;

// 		this.x = ay * bz - az * by;
// 		this.y = az * bx - ax * bz;
// 		this.z = ax * by - ay * bx;

// 		return this;
// 	}

// 	dot(b: Vector): number {
// 		return this.x * b.x + this.y * b.y + this.z * b.z;
// 	}

// 	toVector3(): Vector3 {
// 		return new Vector3(this.x, this.y, this.z);
// 	}
// }
