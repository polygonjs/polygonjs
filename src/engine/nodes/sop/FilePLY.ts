/**
 * Loads a PLY file from a url.
 *
 *
 */
import {FilePLYSopOperation} from '../../operations/sop/FilePLY';
import {fileSopNodeFactory} from './utils/file/_BaseSopFile';
import {BaseFileSopOperation} from '../../operations/sop/utils/File/_BaseFileOperation';
import {SopTypeFile} from '../../poly/registers/nodes/types/Sop';
import {GeometryExtension} from '../../../core/loader/Geometry';

export class FilePLYSopNode extends fileSopNodeFactory({
	type: SopTypeFile.FILE_PLY,
	operation: FilePLYSopOperation as typeof BaseFileSopOperation,
	extensions: [GeometryExtension.PLY],
}) {}
