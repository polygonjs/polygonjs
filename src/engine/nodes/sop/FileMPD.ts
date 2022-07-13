/**
 * Loads a MPD from a url.
 *
 *
 */
import {FileMPDSopOperation} from '../../operations/sop/FileMPD';
import {fileSopNodeFactory} from './utils/file/_BaseSopFile';
import {BaseFileSopOperation} from '../../operations/sop/utils/File/_BaseFileOperation';
import {SopTypeFile} from '../../poly/registers/nodes/types/Sop';
import {GeometryExtension} from '../../../core/FileTypeController';

export class FileMPDSopNode extends fileSopNodeFactory({
	type: SopTypeFile.FILE_MPD,
	operation: FileMPDSopOperation as typeof BaseFileSopOperation,
	extensions: [GeometryExtension.MPD],
}) {}
