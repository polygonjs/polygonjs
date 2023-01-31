/**
 * Loads a JSON file from a url.
 *
 *
 */
import {FileJSONSopOperation} from '../../operations/sop/FileJSON';
import {fileSopNodeFactory} from './utils/file/_BaseSopFile';
import {BaseFileSopOperation} from '../../operations/sop/utils/File/_BaseFileOperation';
import {SopTypeFile} from '../../poly/registers/nodes/types/Sop';
import {EXTENSIONS_BY_NODE_TYPE_BY_CONTEXT} from '../../../core/loader/FileExtensionRegister';
import {NodeContext} from '../../poly/NodeContext';
export class FileJSONSopNode extends fileSopNodeFactory({
	type: SopTypeFile.FILE_JSON,
	operation: FileJSONSopOperation as typeof BaseFileSopOperation,
	extensions: EXTENSIONS_BY_NODE_TYPE_BY_CONTEXT[NodeContext.SOP][SopTypeFile.FILE_JSON],
}) {}
