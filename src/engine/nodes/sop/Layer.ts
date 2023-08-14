/**
 * Sets the layer of the input objects
 *
 * @remarks
 * This should be combined with the layer of a camera. This will allow some objects to be only visible via some cameras.
 */
import {TypedSopNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {filterThreejsObjectsWithGroup} from '../../../core/geometry/Mask';
import {Object3D} from 'three';

export enum LayerUpdateMode {
	SET = 'set',
	ADD = 'add',
	REMOVE = 'remove',
}
export const UPDATE_MODES: LayerUpdateMode[] = [LayerUpdateMode.SET, LayerUpdateMode.ADD, LayerUpdateMode.REMOVE];
const UPDATE_MODE_ENTRIES = UPDATE_MODES.map((name, value) => {
	return {name, value};
});
type AvailableLayerIndex = 0 | 1 | 2 | 3;
interface VisibleOptions {
	layersCount: number;
}
function visibleOption(options: VisibleOptions) {
	const computedOptions: Record<string, number>[] = [];
	for (let i = 1; i <= 4; i++) {
		if (i >= options.layersCount) {
			computedOptions.push({layersCount: i});
		}
	}
	return {
		visibleIf: computedOptions,
	};
}

class LayerSopParamsConfig extends NodeParamsConfig {
	/** @param group to assign the material to */
	group = ParamConfig.STRING('*', {
		objectMask: true,
	});
	layersCount = ParamConfig.INTEGER(1, {
		range: [1, 4],
		rangeLocked: [true, true],
		separatorAfter: true,
	});
	/** @param updateMode */
	updateMode0 = ParamConfig.INTEGER(UPDATE_MODES.indexOf(LayerUpdateMode.ADD), {
		menu: {
			entries: UPDATE_MODE_ENTRIES,
		},
		...visibleOption({layersCount: 1}),
	});
	/** @param layer */
	layer0 = ParamConfig.INTEGER(0, {
		range: [0, 31],
		rangeLocked: [true, true],
		...visibleOption({layersCount: 1}),
	});
	/** @param updateMode */
	updateMode1 = ParamConfig.INTEGER(UPDATE_MODES.indexOf(LayerUpdateMode.ADD), {
		menu: {
			entries: UPDATE_MODE_ENTRIES,
		},
		...visibleOption({layersCount: 2}),
	});
	/** @param layer */
	layer1 = ParamConfig.INTEGER(0, {
		range: [0, 31],
		rangeLocked: [true, true],
		...visibleOption({layersCount: 2}),
	});
	/** @param updateMode */
	updateMode2 = ParamConfig.INTEGER(UPDATE_MODES.indexOf(LayerUpdateMode.ADD), {
		menu: {
			entries: UPDATE_MODE_ENTRIES,
		},
		...visibleOption({layersCount: 3}),
	});
	/** @param layer */
	layer2 = ParamConfig.INTEGER(0, {
		range: [0, 31],
		rangeLocked: [true, true],
		...visibleOption({layersCount: 3}),
	});
	/** @param updateMode */
	updateMode3 = ParamConfig.INTEGER(UPDATE_MODES.indexOf(LayerUpdateMode.ADD), {
		menu: {
			entries: UPDATE_MODE_ENTRIES,
		},
		...visibleOption({layersCount: 4}),
	});
	/** @param layer */
	layer3 = ParamConfig.INTEGER(0, {
		range: [0, 31],
		rangeLocked: [true, true],
		...visibleOption({layersCount: 4}),
	});
}
const ParamsConfig = new LayerSopParamsConfig();

export class LayerSopNode extends TypedSopNode<LayerSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.LAYER;
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup = inputCoreGroups[0];

		const objects = filterThreejsObjectsWithGroup(coreGroup, this.pv);

		for (let object of objects) {
			this._updateLayers(object);
			// object.layers.set(this.pv.layer);
		}

		this.setCoreGroup(coreGroup);
	}
	private _updateLayers(object: Object3D) {
		this._updateLayer(0, object, UPDATE_MODES[this.pv.updateMode0], this.pv.layer0);
		this._updateLayer(1, object, UPDATE_MODES[this.pv.updateMode1], this.pv.layer1);
		this._updateLayer(2, object, UPDATE_MODES[this.pv.updateMode2], this.pv.layer2);
		this._updateLayer(3, object, UPDATE_MODES[this.pv.updateMode3], this.pv.layer3);
	}
	private _updateLayer(index: AvailableLayerIndex, object: Object3D, updateMode: LayerUpdateMode, layer: number) {
		if (index > this.pv.layersCount - 1) {
			return;
		}
		switch (updateMode) {
			case LayerUpdateMode.SET: {
				object.layers.set(layer);
				return;
			}
			case LayerUpdateMode.ADD: {
				object.layers.enable(layer);
				return;
			}
			case LayerUpdateMode.REMOVE: {
				object.layers.disable(layer);
				return;
			}
		}
	}
	//
	// helper methods
	//
	setMode(index: AvailableLayerIndex, mode: LayerUpdateMode) {
		const param = [this.p.updateMode0, this.p.updateMode1, this.p.updateMode2, this.p.updateMode3];
		param[index].set(UPDATE_MODES.indexOf(mode));
	}
	setLayer(index: AvailableLayerIndex, layer: number) {
		const param = [this.p.layer0, this.p.layer1, this.p.layer2, this.p.layer3];
		param[index].set(layer);
	}
}
