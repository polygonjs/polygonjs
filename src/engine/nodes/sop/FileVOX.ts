/**
 * Loads a VOX from a url.
 *
 *
 */
import {FileVOXSopOperation} from '../../operations/sop/FileVOX';
import {fileSopNodeFactory} from './utils/file/_BaseSopFile';
import {BaseFileSopOperation} from '../../operations/sop/utils/File/_BaseFileOperation';
import {SopTypeFile} from '../../poly/registers/nodes/types/Sop';
import {EXTENSIONS_BY_NODE_TYPE_BY_CONTEXT} from '../../../core/loader/FileExtensionRegister';
import {NodeContext} from '../../poly/NodeContext';
export class FileVOXSopNode extends fileSopNodeFactory({
	type: SopTypeFile.FILE_VOX,
	operation: FileVOXSopOperation as typeof BaseFileSopOperation,
	extensions: EXTENSIONS_BY_NODE_TYPE_BY_CONTEXT[NodeContext.SOP][SopTypeFile.FILE_VOX],
}) {}
