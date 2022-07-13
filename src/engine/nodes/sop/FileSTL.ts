/**
 * Loads a STL file from a url.
 *
 *
 */
import {FileSTLSopOperation} from '../../operations/sop/FileSTL';
import {fileSopNodeFactory} from './utils/file/_BaseSopFile';
import {BaseFileSopOperation} from '../../operations/sop/utils/File/_BaseFileOperation';
import {SopTypeFile} from '../../poly/registers/nodes/types/Sop';
import {GeometryExtension} from '../../../core/FileTypeController';

export class FileSTLSopNode extends fileSopNodeFactory({
	type: SopTypeFile.FILE_STL,
	operation: FileSTLSopOperation as typeof BaseFileSopOperation,
	extensions: [GeometryExtension.STL],
}) {}
