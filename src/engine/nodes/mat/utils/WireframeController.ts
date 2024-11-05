import {Constructor} from '../../../../types/GlobalTypes';
import {BaseController, MaterialTexturesRecord, SetParamsTextureNodesRecord} from './_BaseController';
import {TypedMatNode} from '../_Base';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {isBooleanTrue} from '../../../../core/BooleanValue';
import {
	Material,
	MeshBasicMaterial,
	MeshStandardMaterial,
	MeshPhysicalMaterial,
	MeshToonMaterial,
	MeshPhongMaterial,
	MeshLambertMaterial,
} from 'three';

export interface WireframeControllers {
	wireframe: WireframeController;
}
enum LineCapType {
	ROUND = 'round',
	BUTT = 'butt',
	SQUARE = 'square',
}
const LINE_CAP_TYPES: LineCapType[] = [LineCapType.ROUND, LineCapType.BUTT, LineCapType.SQUARE];

enum LineJoinType {
	ROUND = 'round',
	BEVEL = 'bevel',
	MITER = 'miter',
}
const LINE_JOIN_TYPES: LineJoinType[] = [LineJoinType.ROUND, LineJoinType.BEVEL, LineJoinType.MITER];

export function WireframeParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param toggle on to set material to wireframe */
		wireframe = ParamConfig.BOOLEAN(0, {separatorBefore: true});
		/** @param wireframe line width */
		wireframeLinewidth = ParamConfig.FLOAT(1, {
			range: [0, 5],
			rangeLocked: [true, false],
			visibleIf: {wireframe: 1},
		});
		/** @param define appearance of line ends */
		wireframeLinecap = ParamConfig.INTEGER(0, {
			menu: {
				entries: LINE_CAP_TYPES.map((name, value) => {
					return {name, value};
				}),
			},
			visibleIf: {wireframe: 1},
		});
		/** @param Define appearance of line joints */
		wireframeLinejoin = ParamConfig.INTEGER(0, {
			menu: {
				entries: LINE_JOIN_TYPES.map((name, value) => {
					return {name, value};
				}),
			},
			visibleIf: {wireframe: 1},
			separatorAfter: true,
		});
	};
}
type WireframedMaterial =
	| MeshToonMaterial
	| MeshBasicMaterial
	| MeshStandardMaterial
	| MeshPhysicalMaterial
	| MeshPhongMaterial
	| MeshLambertMaterial;
function isValidWireframeMaterial(material?: Material): material is WireframedMaterial {
	if (!material) {
		return false;
	}
	return (material as MeshToonMaterial).wireframe != null;
}
// class WireframedMaterial extends Material {
// 	wireframe!: boolean;
// 	wireframeLinecap!: string;
// 	wireframeLinejoin!: string;
// }
class WireframeParamsConfig extends WireframeParamConfig(NodeParamsConfig) {}
class WireframedMatNode extends TypedMatNode<WireframedMaterial, WireframeParamsConfig> {
	async material() {
		const container = await this.compute();
		return container.material() as WireframedMaterial | undefined;
	}
	controllers!: WireframeControllers;
}

export class WireframeController extends BaseController {
	constructor(protected override node: WireframedMatNode) {
		super(node);
	}
	static async update(node: WireframedMatNode) {
		const material = await node.material();
		if (!isValidWireframeMaterial(material)) {
			return;
		}
		node.controllers.wireframe.updateMaterial(material);
	}
	override updateMaterial(material: WireframedMaterial) {
		const pv = this.node.pv;

		material.wireframe = isBooleanTrue(pv.wireframe);
		material.wireframeLinewidth = pv.wireframeLinewidth;
		material.wireframeLinecap = LINE_CAP_TYPES[pv.wireframeLinecap];
		material.wireframeLinejoin = LINE_JOIN_TYPES[pv.wireframeLinejoin];
		material.needsUpdate = true;
	}
	override getTextures(material: WireframedMaterial, record: MaterialTexturesRecord) {}
	override setParamsFromMaterial(material: WireframedMaterial, record: SetParamsTextureNodesRecord) {
		this.node.p.wireframe.set(material.wireframe);
		this.node.p.wireframeLinewidth.set(material.wireframeLinewidth);
		this.node.p.wireframeLinecap.set(LINE_CAP_TYPES.indexOf(material.wireframeLinecap as LineCapType));
		this.node.p.wireframeLinejoin.set(LINE_JOIN_TYPES.indexOf(material.wireframeLinejoin as LineJoinType));
	}
}
