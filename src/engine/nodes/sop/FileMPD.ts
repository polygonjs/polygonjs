/**
 * Loads a MPD from a url.
 *
 *
 */
import {FileMPDSopOperation} from '../../operations/sop/FileMPD';
import {fileSopNodeFactory} from './utils/file/_BaseSopFile';
import {BaseFileSopOperation} from '../../operations/sop/utils/File/_BaseFileOperation';
import {SopTypeFile} from '../../poly/registers/nodes/types/Sop';
import {EXTENSIONS_BY_NODE_TYPE_BY_CONTEXT} from '../../../core/loader/FileExtensionRegister';
import {NodeContext} from '../../poly/NodeContext';
export class FileMPDSopNode extends fileSopNodeFactory({
	type: SopTypeFile.FILE_MPD,
	operation: FileMPDSopOperation as typeof BaseFileSopOperation,
	extensions: EXTENSIONS_BY_NODE_TYPE_BY_CONTEXT[NodeContext.SOP][SopTypeFile.FILE_MPD],
}) {}
