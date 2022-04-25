/**
 * Loads a JSON file from a url.
 *
 *
 */
import {FileJSONSopOperation} from '../../operations/sop/FileJSON';
import {fileSopNodeFactory} from './utils/file/_BaseSopFile';
import {BaseFileSopOperation} from '../../operations/sop/utils/File/_BaseFileOperation';
import {SopTypeFile} from '../../poly/registers/nodes/types/Sop';
import {GeometryExtension} from '../../../core/loader/Geometry';

export class FileJSONSopNode extends fileSopNodeFactory({
	type: SopTypeFile.FILE_JSON,
	operation: FileJSONSopOperation as typeof BaseFileSopOperation,
	extensions: [GeometryExtension.JSON],
}) {}
