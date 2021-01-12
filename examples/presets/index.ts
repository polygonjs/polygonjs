import {ImageCopNode} from '../../src/engine/nodes/cop/Image';
import {VideoCopNode} from '../../src/engine/nodes/cop/Video';
import {AttributeGlNode} from '../../src/engine/nodes/gl/Attribute';
import {ColorSopNode} from '../../src/engine/nodes/sop/Color';
import {DataSopNode} from '../../src/engine/nodes/sop/Data';
import {NodeContext} from '../../src/engine/poly/NodeContext';
import {ImageCopNodePresets} from './cop/Image';
import {VideoCopNodePresets} from './cop/Video';
import {AttributeGlNodePresets} from './gl/Attribute';
import {ColorSopNodePresets} from './sop/Color';
import {DataUrlSopNodePresets} from './sop/DataUrl';
import {DataSopNodePresets} from './sop/Data';
import {DataUrlSopNode} from '../../src/engine/nodes/sop/DataUrl';
import {FileSopNodePresets} from './sop/File';
import {FileSopNode} from '../../src/engine/nodes/sop/File';
import {TextSopNode} from '../../src/engine/nodes/sop/Text';
import {TransformSopNode} from '../../src/engine/nodes/sop/Transform';
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
	[NodeContext.SOP]: {
		[ColorSopNode.type()]: ColorSopNodePresets,
		[DataSopNode.type()]: DataSopNodePresets,
		[DataUrlSopNode.type()]: DataUrlSopNodePresets,
		[FileSopNode.type()]: FileSopNodePresets,
		[TextSopNode.type()]: TextSopNodePresets,
		[TransformSopNode.type()]: TransformSopNodePresets,
	},
};
