import {Constructor, Number2, Number3} from '../../../../types/GlobalTypes';
import {Material, MeshPhysicalMaterial} from 'three';
import {TypedMatNode} from '../_Base';
import {BaseTextureMapController, BooleanParamOptions, NodePathOptions} from './_BaseTextureController';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {Color} from 'three';
import {isBooleanTrue} from '../../../../core/BooleanValue';
import {MaterialTexturesRecord, SetParamsTextureNodesRecord} from './_BaseController';
import {ColorConversion} from '../../../../core/Color';

// in THREE 148, the object renders black when attenuation is 0
const ATTENUATION_DISTANCE_MIN = 0.0001;

export function MeshPhysicalParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param Represents the thickness of the clear coat layer, from 0.0 to 1.0 */
		clearcoat = ParamConfig.FLOAT(0, {separatorBefore: true});
		/** @param toggle if you want to use a roughness map */
		useClearCoatMap = ParamConfig.BOOLEAN(0, BooleanParamOptions(MeshPhysicalController));
		/** @param specify the roughness map COP node */
		clearcoatMap = ParamConfig.NODE_PATH('', NodePathOptions(MeshPhysicalController, 'useClearCoatMap'));
		/** @param toggle if you want to use a clear coat normal map */
		useClearCoatNormalMap = ParamConfig.BOOLEAN(0, BooleanParamOptions(MeshPhysicalController));
		/** @param specify the roughness map COP node */
		clearcoatNormalMap = ParamConfig.NODE_PATH(
			'',
			NodePathOptions(MeshPhysicalController, 'useClearCoatNormalMap')
		);
		/** @param How much the normal map affects the material. Typical ranges are 0-1 */
		clearcoatNormalScale = ParamConfig.VECTOR2([1, 1], {visibleIf: {useClearCoatNormalMap: 1}});
		/** @param clearcoatRoughness */
		clearcoatRoughness = ParamConfig.FLOAT(0);
		/** @param toggle if you want to use a clear cloat map */
		useClearCoatRoughnessMap = ParamConfig.BOOLEAN(0, BooleanParamOptions(MeshPhysicalController));
		/** @param specify the roughness map COP node */
		clearcoatRoughnessMap = ParamConfig.NODE_PATH(
			'',
			NodePathOptions(MeshPhysicalController, 'useClearCoatRoughnessMap')
		);

		/** @param toggle if you want to use sheen */
		useSheen = ParamConfig.BOOLEAN(0, {
			separatorBefore: true,
		});
		/** @param The intensity of the sheen layer, from 0.0 to 1.0. Default is 0.0. */
		sheen = ParamConfig.FLOAT(0, {
			range: [0, 1],
			rangeLocked: [true, false],
			visibleIf: {useSheen: 1},
		});
		/** @param If a color is assigned to this property, the material will use a special sheen BRDF intended for rendering cloth materials such as velvet. The sheen color provides the ability to create two-tone specular materials. null by default */
		sheenRoughness = ParamConfig.FLOAT(1, {
			range: [0, 1],
			rangeLocked: [true, false],
			visibleIf: {useSheen: 1},
		});
		/** @param If a color is assigned to this property, the material will use a special sheen BRDF intended for rendering cloth materials such as velvet. The sheen color provides the ability to create two-tone specular materials. null by default */
		sheenColor = ParamConfig.COLOR([1, 1, 1], {
			visibleIf: {useSheen: 1},
		});

		/** @param toggle if you want to use iridescence */
		useIridescence = ParamConfig.BOOLEAN(0, {
			separatorBefore: true,
		});
		/** @param Iridescence amount */
		iridescence = ParamConfig.FLOAT(1, {
			range: [0, 10],
			rangeLocked: [true, false],
			visibleIf: {useIridescence: 1},
		});
		/** @param iridescence index of refraction */
		iridescenceIOR = ParamConfig.FLOAT(1.3, {
			range: [1, 10],
			rangeLocked: [false, false],
			visibleIf: {useIridescence: 1},
		});
		/** @param Iridescence Thickness Range */
		iridescenceThicknessRange = ParamConfig.VECTOR2([0, 1], {
			visibleIf: {useIridescence: 1},
		});
		/** @param toggle if you want to use an iridescence map */
		useIridescenceMap = ParamConfig.BOOLEAN(0, {
			...BooleanParamOptions(MeshPhysicalController),
			visibleIf: {useIridescence: 1},
		});
		/** @param specify the iridescence map COP node */
		iridescenceMap = ParamConfig.NODE_PATH('', {
			...NodePathOptions(MeshPhysicalController, 'useIridescenceMap'),
			visibleIf: {useIridescence: 1, useIridescenceMap: 1},
		});
		/** @param toggle if you want to use an iridescence map */
		useIridescenceThicknessMap = ParamConfig.BOOLEAN(0, {
			...BooleanParamOptions(MeshPhysicalController),
			visibleIf: {useIridescence: 1},
		});
		/** @param specify the iridescence map COP node */
		iridescenceThicknessMap = ParamConfig.NODE_PATH('', {
			...NodePathOptions(MeshPhysicalController, 'useIridescenceThicknessMap'),
			visibleIf: {useIridescence: 1, useIridescenceThicknessMap: 1},
		});

		/** @param Degree of transmission (or optical transparency), from 0.0 to 1.0. Default is 0.0.
Thin, transparent or semitransparent, plastic or glass materials remain largely reflective even if they are fully transmissive. The transmission property can be used to model these materials.
When transmission is non-zero, opacity should be set to 1.  */
		transmission = ParamConfig.FLOAT(0, {
			separatorBefore: true,
			range: [0, 1],
		});
		/** @param toggle if you want to use a transmission map */
		useTransmissionMap = ParamConfig.BOOLEAN(0);
		/** @param specify the roughness map COP node */
		transmissionMap = ParamConfig.NODE_PATH('', {visibleIf: {useTransmissionMap: 1}});
		/** @param Index-of-refraction for non-metallic materials */
		ior = ParamConfig.FLOAT(1.5, {
			range: [1, 2.3333],
			rangeLocked: [true, true],
		});

		/** @param thickness  */
		thickness = ParamConfig.FLOAT(0.01, {
			range: [0, 10],
			rangeLocked: [true, false],
		});
		/** @param toggle if you want to use a thickness map */
		useThicknessMap = ParamConfig.BOOLEAN(0);
		/** @param specify the roughness map COP node */
		thicknessMap = ParamConfig.NODE_PATH('', {visibleIf: {useThicknessMap: 1}});
		/** @param attenuation distance */
		attenuationDistance = ParamConfig.FLOAT(100, {
			range: [ATTENUATION_DISTANCE_MIN, 100],
			rangeLocked: [true, false],
			step: 0.01,
		});
		/** @param attenuation color */
		attenuationColor = ParamConfig.COLOR([1, 1, 1]);
		/** @param dispersion */
		dispersion = ParamConfig.FLOAT(0, {
			range: [0, 1],
			rangeLocked: [true, false],
		});
	};
}

type MeshPhysicalControllerCurrentMaterial = MeshPhysicalMaterial;
export function isValidMaterial(material?: Material): material is MeshPhysicalControllerCurrentMaterial {
	if (!material) {
		return false;
	}
	return (material as MeshPhysicalMaterial).clearcoatRoughness != null;
}
class TextureClearCoatMapParamsConfig extends MeshPhysicalParamConfig(NodeParamsConfig) {}
export interface MeshPhysicalControllers {
	physical: MeshPhysicalController;
}
abstract class TextureClearCoatMapMatNode extends TypedMatNode<
	MeshPhysicalControllerCurrentMaterial,
	TextureClearCoatMapParamsConfig
> {
	controllers!: MeshPhysicalControllers;
	async material() {
		const container = await this.compute();
		return container.material() as MeshPhysicalControllerCurrentMaterial | undefined;
	}
}

const tmpMeshPhysicalForIOR = new MeshPhysicalMaterial();
const tmpN2: Number2 = [0, 0];
const tmpN3: Number3 = [0, 0, 0];

export class MeshPhysicalController extends BaseTextureMapController {
	constructor(protected override node: TextureClearCoatMapMatNode) {
		super(node);
	}
	override initializeNode() {
		this.add_hooks(this.node.p.useClearCoatMap, this.node.p.clearcoatMap);
		this.add_hooks(this.node.p.useClearCoatNormalMap, this.node.p.clearcoatNormalMap);
		this.add_hooks(this.node.p.useClearCoatRoughnessMap, this.node.p.clearcoatRoughnessMap);
		this.add_hooks(this.node.p.useTransmissionMap, this.node.p.transmissionMap);
		this.add_hooks(this.node.p.useThicknessMap, this.node.p.thicknessMap);
		this.add_hooks(this.node.p.useIridescenceMap, this.node.p.iridescenceMap);
	}
	private _sheenColorClone = new Color();
	private _iridescenceRange: Number2 = [0, 0];
	static override async update(node: TextureClearCoatMapMatNode) {
		const container = await node.compute();
		const material = container.material();
		if (!isValidMaterial(material)) {
			return;
		}
		node.controllers.physical.updateMaterial(material);
	}

	override async updateMaterial(material: MeshPhysicalControllerCurrentMaterial) {
		const pv = this.node.pv;

		const mat = material as MeshPhysicalMaterial;

		// this is to get the reflectivity value
		tmpMeshPhysicalForIOR.ior = pv.ior;
		mat.reflectivity = tmpMeshPhysicalForIOR.reflectivity;

		mat.clearcoat = pv.clearcoat;
		if (mat.clearcoatNormalScale != null) {
			mat.clearcoatNormalScale.copy(pv.clearcoatNormalScale);
		}
		mat.clearcoatRoughness = pv.clearcoatRoughness;
		// ior is currently a getter/setter wrapper to set reflectivity, so currently conflicts with 'mat.reflectivity ='
		// mat.ior = this.node.pv.ior;
		if (isBooleanTrue(pv.useSheen)) {
			this._sheenColorClone.copy(pv.sheenColor);
			mat.sheen = pv.sheen;
			mat.sheenRoughness = pv.sheenRoughness;
			mat.sheenColor = this._sheenColorClone;
		} else {
			mat.sheen = 0;
		}
		if (isBooleanTrue(pv.useIridescence)) {
			mat.iridescence = pv.iridescence;
			mat.iridescenceIOR = pv.iridescenceIOR;
			mat.iridescenceThicknessRange = pv.iridescenceThicknessRange.toArray(this._iridescenceRange);
		} else {
			mat.iridescence = 0;
		}

		mat.transmission = pv.transmission;
		mat.thickness = pv.thickness;
		mat.attenuationDistance = pv.attenuationDistance;
		mat.attenuationColor = pv.attenuationColor;
		mat.dispersion = pv.dispersion;
		// }
		await Promise.all([
			this._update(material, 'clearcoatMap', this.node.p.useClearCoatMap, this.node.p.clearcoatMap),
			this._update(
				material,
				'clearcoatNormalMap',
				this.node.p.useClearCoatNormalMap,
				this.node.p.clearcoatNormalMap
			),
			this._update(
				material,
				'clearcoatRoughnessMap',
				this.node.p.useClearCoatRoughnessMap,
				this.node.p.clearcoatRoughnessMap
			),
			this._update(material, 'transmissionMap', this.node.p.useTransmissionMap, this.node.p.transmissionMap),
			this._update(material, 'thicknessMap', this.node.p.useThicknessMap, this.node.p.thicknessMap),
			this._update(material, 'iridescenceMap', this.node.p.useIridescenceMap, this.node.p.iridescenceMap),
			this._update(
				material,
				'iridescenceThicknessMap',
				this.node.p.useIridescenceThicknessMap,
				this.node.p.iridescenceThicknessMap
			),
		]);
	}
	override getTextures(material: MeshPhysicalControllerCurrentMaterial, record: MaterialTexturesRecord) {
		record.set('clearcoatMap', material.clearcoatMap);
		record.set('clearcoatNormalMap', material.clearcoatNormalMap);
		record.set('clearcoatRoughnessMap', material.clearcoatRoughnessMap);
		record.set('transmissionMap', material.transmissionMap);
		record.set('thicknessMap', material.thicknessMap);
		record.set('iridescenceMap', material.iridescenceMap);
		record.set('iridescenceThicknessMap', material.iridescenceThicknessMap);
	}
	override setParamsFromMaterial(
		material: MeshPhysicalControllerCurrentMaterial,
		record: SetParamsTextureNodesRecord
	) {
		const clearcoatMap = () => {
			const mapNode = record.get('clearcoatMap');
			this.node.p.useClearCoatMap.set(mapNode != null);
			if (mapNode) {
				this.node.p.clearcoatMap.setNode(mapNode, {relative: true});
			}
		};
		const clearcoatNormalMap = () => {
			const mapNode = record.get('clearcoatNormalMap');
			this.node.p.useClearCoatNormalMap.set(mapNode != null);
			if (mapNode) {
				this.node.p.clearcoatNormalMap.setNode(mapNode, {relative: true});
			}
		};
		const clearcoatRoughnessMap = () => {
			const mapNode = record.get('clearcoatRoughnessMap');
			this.node.p.useClearCoatRoughnessMap.set(mapNode != null);
			if (mapNode) {
				this.node.p.clearcoatRoughnessMap.setNode(mapNode, {relative: true});
			}
		};
		const transmissionMap = () => {
			const mapNode = record.get('transmissionMap');
			this.node.p.useTransmissionMap.set(mapNode != null);
			if (mapNode) {
				this.node.p.transmissionMap.setNode(mapNode, {relative: true});
			}
		};
		const thicknessMap = () => {
			const mapNode = record.get('thicknessMap');
			this.node.p.useThicknessMap.set(mapNode != null);
			if (mapNode) {
				this.node.p.thicknessMap.setNode(mapNode, {relative: true});
			}
		};
		const iridescenceMap = () => {
			const mapNode = record.get('iridescenceMap');
			this.node.p.useIridescenceMap.set(mapNode != null);
			if (mapNode) {
				this.node.p.iridescenceMap.setNode(mapNode, {relative: true});
			}
		};
		const iridescenceThicknessMap = () => {
			const mapNode = record.get('iridescenceThicknessMap');
			this.node.p.useIridescenceThicknessMap.set(mapNode != null);
			if (mapNode) {
				this.node.p.iridescenceThicknessMap.setNode(mapNode, {relative: true});
			}
		};
		clearcoatMap();
		clearcoatNormalMap();
		clearcoatRoughnessMap();
		transmissionMap();
		thicknessMap();
		iridescenceMap();
		iridescenceThicknessMap();

		const p = this.node.p;
		p.ior.set(material.ior);
		//
		p.clearcoat.set(material.clearcoat);
		material.clearcoatNormalScale.toArray(tmpN2);
		p.clearcoatNormalScale.set(tmpN2);
		p.clearcoatRoughness.set(material.clearcoatRoughness);
		//
		material.sheenColor.toArray(tmpN3);
		p.sheenColor.set(tmpN3);
		p.sheenColor.setConversion(ColorConversion.NONE);
		p.sheen.set(material.sheen);
		p.sheenRoughness.set(material.sheenRoughness);
		//
		p.transmission.set(material.transmission);
		p.thickness.set(material.thickness);
		p.attenuationDistance.set(material.attenuationDistance);
		material.attenuationColor.toArray(tmpN3);
		p.attenuationColor.set(tmpN3);
		p.attenuationColor.setConversion(ColorConversion.NONE);
		p.dispersion.set(material.dispersion);
		//
		p.iridescence.set(material.iridescence);
		p.iridescenceIOR.set(material.iridescenceIOR);
		p.iridescenceThicknessRange.set(material.iridescenceThicknessRange as Number2);
	}
}
