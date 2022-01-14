import {NodeContext} from '../../src/engine/poly/NodeContext';

// anim
import {PropertyNameAnimNode, PropertyNameAnimNodePresetsCollectionFactory} from './anim/PropertyName';
// audio
import {FileAudioNode, fileAudioNodePresetsCollectionFactory} from './audio/File';
// cop
import {ImageCopNode, imageCopNodePresetsCollectionFactory} from './cop/Image';
import {VideoCopNode, videoCopNodePresetsCollectionFactory} from './cop/Video';
// // gl
import {AttributeGlNode, attributeGlNodePresetsCollectionFactory} from './gl/Attribute';
// // mat
import {
	MeshSubsurfaceScatteringMatNode,
	meshSubsurfaceScatteringMatNodePresetsCollectionFactory,
} from './mat/MeshSubsurfaceScattering';
// obj
// sop
import {ColorSopNode, colorSopNodePresetsCollectionFactory} from './sop/Color';
import {CSS2DObjectSopNode, CSS2DObjectSopNodePresetsCollectionFactory} from './sop/CSS2DObject';
import {DataSopNode, dataSopNodePresetsCollectionFactory} from './sop/Data';
import {DataUrlSopNode, dataUrlSopNodePresetsCollectionFactory} from './sop/DataUrl';
import {FileSopNode, fileSopNodePresetsCollectionFactory} from './sop/File';
import {TransformSopNode, transformSopNodePresetsCollectionFactory} from './sop/Transform';
import {PolyDictionary} from '../../src/types/GlobalTypes';
import {PresetsCollectionFactory} from './BasePreset';
import {PointSopNode, pointSopNodePresetsCollectionFactory} from './sop/Point';
import {RoundedBoxSopNode, roundedBoxSopNodePresetsCollectionFactory} from './sop/RoundedBox';
import {TextSopNode, textSopNodeNodePresetsCollectionFactory} from './sop/Text';

// TODO: it may be easier when there are many presets
// to use a BasePreset class that knows how to register itself
// based on the node it applies to

interface PresetsLibrary {
	[NodeContext.ANIM]: PolyDictionary<PresetsCollectionFactory<any>>;
	[NodeContext.AUDIO]: PolyDictionary<PresetsCollectionFactory<any>>;
	[NodeContext.COP]: PolyDictionary<PresetsCollectionFactory<any>>;
	[NodeContext.EVENT]: PolyDictionary<PresetsCollectionFactory<any>>;
	[NodeContext.GL]: PolyDictionary<PresetsCollectionFactory<any>>;
	[NodeContext.JS]: PolyDictionary<PresetsCollectionFactory<any>>;
	[NodeContext.MANAGER]: PolyDictionary<PresetsCollectionFactory<any>>;
	[NodeContext.MAT]: PolyDictionary<PresetsCollectionFactory<any>>;
	[NodeContext.OBJ]: PolyDictionary<PresetsCollectionFactory<any>>;
	[NodeContext.POST]: PolyDictionary<PresetsCollectionFactory<any>>;
	[NodeContext.ROP]: PolyDictionary<PresetsCollectionFactory<any>>;
	[NodeContext.SOP]: PolyDictionary<PresetsCollectionFactory<any>>;
}

export const presetsLibrary: PresetsLibrary = {
	[NodeContext.ANIM]: {
		[PropertyNameAnimNode.type()]: PropertyNameAnimNodePresetsCollectionFactory,
	},
	[NodeContext.AUDIO]: {
		[FileAudioNode.type()]: fileAudioNodePresetsCollectionFactory,
	},
	[NodeContext.COP]: {
		[ImageCopNode.type()]: imageCopNodePresetsCollectionFactory,
		[VideoCopNode.type()]: videoCopNodePresetsCollectionFactory,
	},
	[NodeContext.EVENT]: {},
	[NodeContext.GL]: {
		[AttributeGlNode.type()]: attributeGlNodePresetsCollectionFactory,
	},
	[NodeContext.JS]: {},
	[NodeContext.MANAGER]: {},
	[NodeContext.MAT]: {
		[MeshSubsurfaceScatteringMatNode.type()]: meshSubsurfaceScatteringMatNodePresetsCollectionFactory,
	},
	[NodeContext.OBJ]: {},
	[NodeContext.POST]: {},
	[NodeContext.ROP]: {},
	[NodeContext.SOP]: {
		[ColorSopNode.type()]: colorSopNodePresetsCollectionFactory,
		[CSS2DObjectSopNode.type()]: CSS2DObjectSopNodePresetsCollectionFactory,
		[DataSopNode.type()]: dataSopNodePresetsCollectionFactory,
		[DataUrlSopNode.type()]: dataUrlSopNodePresetsCollectionFactory,
		[FileSopNode.type()]: fileSopNodePresetsCollectionFactory,
		[PointSopNode.type()]: pointSopNodePresetsCollectionFactory,
		[RoundedBoxSopNode.type()]: roundedBoxSopNodePresetsCollectionFactory,
		[TextSopNode.type()]: textSopNodeNodePresetsCollectionFactory,
		[TransformSopNode.type()]: transformSopNodePresetsCollectionFactory,
	},
};
