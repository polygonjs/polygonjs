/**
 * Loads a USDZ file from a url.
 *
 *
 */
import {FileUSDZSopOperation} from '../../operations/sop/FileUSDZ';
import {fileSopNodeFactory} from './utils/file/_BaseSopFile';
import {BaseFileSopOperation} from '../../operations/sop/utils/File/_BaseFileOperation';
import {SopTypeFile} from '../../poly/registers/nodes/types/Sop';
import {EXTENSIONS_BY_NODE_TYPE_BY_CONTEXT} from '../../../core/loader/FileExtensionRegister';
import {NodeContext} from '../../poly/NodeContext';
export class FileUSDZSopNode extends fileSopNodeFactory({
	type: SopTypeFile.FILE_USDZ,
	operation: FileUSDZSopOperation as typeof BaseFileSopOperation,
	extensions: EXTENSIONS_BY_NODE_TYPE_BY_CONTEXT[NodeContext.SOP][SopTypeFile.FILE_USDZ],
}) {}
