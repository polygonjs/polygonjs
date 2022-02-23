import { Vector } from './Vector';

export class NBuf3 {
  top = 0;
  array: Float32Array;

  constructor(ct: number) {
    this.array = new Float32Array(ct);
  }

  write(v: Vector): void {
    this.array[this.top++] = v.x;
    this.array[this.top++] = v.y;
    this.array[this.top++] = v.z;
  }
}

export class NBuf2 {
  top = 0;
  array: Float32Array;

  constructor(ct: number) {
    this.array = new Float32Array(ct);
  }

  write(v: Vector): void {
    this.array[this.top++] = v.x;
    this.array[this.top++] = v.y;
  }
}
