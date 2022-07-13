/**
 * Loads an OBJ file from a url.
 *
 *
 */
import {FileOBJSopOperation} from '../../operations/sop/FileOBJ';
import {fileSopNodeFactory} from './utils/file/_BaseSopFile';
import {BaseFileSopOperation} from '../../operations/sop/utils/File/_BaseFileOperation';
import {SopTypeFile} from '../../poly/registers/nodes/types/Sop';
import {GeometryExtension} from '../../../core/FileTypeController';

export class FileOBJSopNode extends fileSopNodeFactory({
	type: SopTypeFile.FILE_OBJ,
	operation: FileOBJSopOperation as typeof BaseFileSopOperation,
	extensions: [GeometryExtension.OBJ],
}) {}
