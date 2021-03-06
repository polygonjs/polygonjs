import {NodeContext} from '../../src/engine/poly/NodeContext';

// cop
import {ImageCopNode} from '../../src/engine/nodes/cop/Image';
import {VideoCopNode} from '../../src/engine/nodes/cop/Video';
import {ImageCopNodePresets} from './cop/Image';
import {VideoCopNodePresets} from './cop/Video';
// gl
import {AttributeGlNode} from '../../src/engine/nodes/gl/Attribute';
import {AttributeGlNodePresets} from './gl/Attribute';
// mat
import {MeshSubsurfaceScatteringMatNodePresets} from './mat/MeshSubsurfaceScattering';
import {MeshSubsurfaceScatteringMatNode} from '../../src/engine/nodes/mat/MeshSubsurfaceScattering';
// obj
import {PositionalAudioObjNodePresets} from './obj/PositionalAudio';
import {PositionalAudioObjNode} from '../../src/engine/nodes/obj/PositionalAudio';
// sop
import {ColorSopNode} from '../../src/engine/nodes/sop/Color';
import {DataSopNode} from '../../src/engine/nodes/sop/Data';
import {ColorSopNodePresets} from './sop/Color';
import {DataUrlSopNodePresets} from './sop/DataUrl';
import {DataSopNodePresets} from './sop/Data';
import {CSS2DObjectSopNodePresets} from './sop/CSS2DObject';
import {CSS2DObjectSopNode} from '../../src/engine/nodes/sop/CSS2DObject';
import {DataUrlSopNode} from '../../src/engine/nodes/sop/DataUrl';
import {FileSopNodePresets} from './sop/File';
import {FileSopNode} from '../../src/engine/nodes/sop/File';
import {PointSopNode} from '../../src/engine/nodes/sop/Point';
import {TextSopNode} from '../../src/engine/nodes/sop/Text';
import {TransformSopNode} from '../../src/engine/nodes/sop/Transform';
import {PointSopNodePresets} from './sop/Point';
import {TextSopNodePresets} from './sop/Text';
import {TransformSopNodePresets} from './sop/Transform';

// TODO: it may be easier when there are many presets
// to use a BasePreset class that knows how to register itself
// based on the node it applies to
export const presetsLibrary = {
	[NodeContext.COP]: {
		[ImageCopNode.type()]: ImageCopNodePresets,
		[VideoCopNode.type()]: VideoCopNodePresets,
	},
	[NodeContext.GL]: {
		[AttributeGlNode.type()]: AttributeGlNodePresets,
	},
	[NodeContext.MAT]: {
		[MeshSubsurfaceScatteringMatNode.type()]: MeshSubsurfaceScatteringMatNodePresets,
	},
	[NodeContext.OBJ]: {
		[PositionalAudioObjNode.type()]: PositionalAudioObjNodePresets,
	},
	[NodeContext.SOP]: {
		[ColorSopNode.type()]: ColorSopNodePresets,
		[CSS2DObjectSopNode.type()]: CSS2DObjectSopNodePresets,
		[DataSopNode.type()]: DataSopNodePresets,
		[DataUrlSopNode.type()]: DataUrlSopNodePresets,
		[FileSopNode.type()]: FileSopNodePresets,
		[PointSopNode.type()]: PointSopNodePresets,
		[TextSopNode.type()]: TextSopNodePresets,
		[TransformSopNode.type()]: TransformSopNodePresets,
	},
};
