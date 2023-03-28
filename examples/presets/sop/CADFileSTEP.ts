import {ASSETS_ROOT} from '../../../src/core/loader/AssetsUtils';
import {sanitizeUrl} from '../../../src/core/UrlHelper';
import {CADFileSTEPSopNode} from '../../../src/engine/nodes/sop/CADFileSTEP';
import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';

const CADFileSTEPSopNodePresetsCollectionFactory: PresetsCollectionFactory<CADFileSTEPSopNode> = (
	node: CADFileSTEPSopNode
) => {
	const collection = new NodePresetsCollection();

	const _url = (url: string) => {
		return new BasePreset().addEntry(node.p.url, sanitizeUrl(`${ASSETS_ROOT}/models/${url}`));
	};
	collection.setPresets({
		'3M_961401-9040704-AR': _url('3M_961401-9040704-AR.STEP'),
		'grabcad/legowhitehousejp': _url('resources/grabcad/legowhitehousejp.STEP'),
		'grabcad/pigsignaler': _url('resources/grabcad/pigsignaler.STEP'),
	});

	return collection;
};
export const cadFileSTEPSopPresetRegister: PresetRegister<typeof CADFileSTEPSopNode, CADFileSTEPSopNode> = {
	nodeClass: CADFileSTEPSopNode,
	setupFunc: CADFileSTEPSopNodePresetsCollectionFactory,
};
