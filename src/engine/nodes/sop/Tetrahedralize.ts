/**
 * Converts an input geometry to tetrahedrons
 *
 *
 *
 */
import {TypedSopNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ObjectType} from '../../../core/geometry/Constant';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {BufferGeometry, BufferAttribute} from 'three';
import {bunnyMesh} from '../../../core/softBody/Bunny';
import {CoreGroup} from '../../../core/geometry/Group';

class TetrahedralizeSopParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new TetrahedralizeSopParamsConfig();

export class TetrahedralizeSopNode extends TypedSopNode<TetrahedralizeSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.TETRAHEDRALIZE;
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const geometry = new BufferGeometry();
		const pos = new Float32Array(bunnyMesh.verts);
		geometry.setAttribute('position', new BufferAttribute(pos, 3));
		geometry.setIndex(bunnyMesh.tetSurfaceTriIds);
		const object = this.createObject(geometry, ObjectType.MESH);
		object.geometry.computeVertexNormals();
		// object.userData = this;
		// object.layers.enable(1);
		this.setObject(object);
	}
}
