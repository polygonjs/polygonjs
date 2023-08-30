import {CoreEntity} from '../Entity';
import {TopoDS_Shape, TopoDS_Face} from './CadCommon';
import {Vector2, Vector3, Vector4} from 'three';
import {AttribValue, NumericAttribValue} from '../../../types/GlobalTypes';
import {Attribute, CoreAttribute} from '../Attribute';
import {CadLoaderSync} from './CadLoaderSync';
import {traverseVertices} from './CadTraverse';

export class CadCoreFace extends CoreEntity {
	constructor(protected _shape: TopoDS_Shape, protected _face: TopoDS_Face, _index: number) {
		super(_shape, _index);
	}
	face() {
		return this._face;
	}
	geometry() {
		return this._shape;
	}

	setAttribValue(attribName: string, attribValue: NumericAttribValue | string) {}
	attribValue(attribName: string, target?: Vector2 | Vector3 | Vector4): AttribValue | undefined {
		if (attribName === Attribute.POINT_INDEX) {
			return this._index;
		} else {
			const remapedName = CoreAttribute.remapName(attribName);
			if (remapedName == Attribute.POSITION && target instanceof Vector3) {
				this.position(target);
			}
			// TODO: use vertices center for position?
			// this._edge.
			return this._index;
		}
	}
	stringAttribValue(attribName: string): string | undefined {
		return '';
	}
	position(target: Vector3) {
		const oc = CadLoaderSync.oc();
		let verticesCount = 0;
		target.set(0, 0, 0);
		traverseVertices(oc, this._face, (vertex, i) => {
			const point = oc.BRep_Tool.Pnt(vertex);
			target.x += point.X();
			target.y += point.Y();
			target.z += point.Z();
			verticesCount++;
		});
		target.divideScalar(verticesCount);
	}
}
