/**
 * Loads a DRC file from a url.
 *
 *
 */
import {FileDRCSopOperation} from '../../operations/sop/FileDRC';
import {fileSopNodeFactory} from './utils/file/_BaseSopFile';
import {BaseFileSopOperation} from '../../operations/sop/utils/File/_BaseFileOperation';
import {SopTypeFile} from '../../poly/registers/nodes/types/Sop';
import {GeometryExtension} from '../../../core/loader/Geometry';

export class FileDRCSopNode extends fileSopNodeFactory({
	type: SopTypeFile.FILE_DRC,
	operation: FileDRCSopOperation as typeof BaseFileSopOperation,
	extensions: [GeometryExtension.DRC],
}) {}
