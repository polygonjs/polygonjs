/**
 * Loads a DRC file from a url.
 *
 *
 */
import {FileDRCSopOperation} from '../../operations/sop/FileDRC';
import {fileSopNodeFactory} from './utils/file/_BaseSopFile';
import {BaseFileSopOperation} from '../../operations/sop/utils/File/_BaseFileOperation';
import {SopTypeFile} from '../../poly/registers/nodes/types/Sop';
import {EXTENSIONS_BY_NODE_TYPE_BY_CONTEXT} from '../../../core/loader/FileExtensionRegister';
import {NodeContext} from '../../poly/NodeContext';
export class FileDRCSopNode extends fileSopNodeFactory({
	type: SopTypeFile.FILE_DRC,
	operation: FileDRCSopOperation as typeof BaseFileSopOperation,
	extensions: EXTENSIONS_BY_NODE_TYPE_BY_CONTEXT[NodeContext.SOP][SopTypeFile.FILE_DRC],
}) {}
