/**
 * Loads an SDF created by [mat/raymarchingBuilder](/doc/nodes/mat/raymarchingBuilder) from a url.
 *
 *
 */
import {SDFDataContainer, SDFLoader} from './../../../core/loader/geometry/SDF';
import {Texture} from 'three';
import {TypedCopNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {BaseNodeType} from '../_Base';

class SDFFromUrlCopParamsConfig extends NodeParamsConfig {
	/** @param url to fetch the image from */
	url = ParamConfig.STRING('', {
		fileBrowse: {extensions: ['bin']},
	});

	/** @param reload */
	reload = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			SDFFromUrlCopNode.PARAM_CALLBACK_reload(node as SDFFromUrlCopNode);
		},
	});
	/** @param resolution */
	resolution = ParamConfig.VECTOR3([-1, -1, -1], {
		cook: false,
		editable: false,
		separatorBefore: true,
	});
	/** @param boundMin */
	boundMin = ParamConfig.VECTOR3([-1, -1, -1], {
		cook: false,
		editable: false,
	});
	/** @param boundMax */
	boundMax = ParamConfig.VECTOR3([1, 1, 1], {
		cook: false,
		editable: false,
	});
}

const ParamsConfig = new SDFFromUrlCopParamsConfig();

export class SDFFromUrlCopNode extends TypedCopNode<SDFFromUrlCopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'SDFFromUrl';
	}

	override async cook(inputContents: Texture[]) {
		const url = this.pv.url;
		const loader = new SDFLoader(url, this);
		loader.load(
			(texture) => {
				const dataContainer = texture.image as SDFDataContainer;
				this.p.resolution.set([
					dataContainer.resolutionx,
					dataContainer.resolutiony,
					dataContainer.resolutionz,
				]);
				this.p.boundMin.set([dataContainer.boundMinx, dataContainer.boundMiny, dataContainer.boundMinz]);
				this.p.boundMax.set([dataContainer.boundMaxx, dataContainer.boundMaxy, dataContainer.boundMaxz]);

				this.setTexture(texture);
			},
			() => {},
			(err) => {
				this.states.error.set(err.message || 'loading failed');
			}
		);
	}

	/*
	 *
	 * CALLBACK
	 *
	 */
	static PARAM_CALLBACK_reload(node: SDFFromUrlCopNode) {
		node.p.url.setDirty();
	}
}
