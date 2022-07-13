/**
 * Loads a PDB from a url.
 *
 *
 */
import {FilePDBSopOperation} from '../../operations/sop/FilePDB';
import {fileSopNodeFactory} from './utils/file/_BaseSopFile';
import {BaseFileSopOperation} from '../../operations/sop/utils/File/_BaseFileOperation';
import {SopTypeFile} from '../../poly/registers/nodes/types/Sop';
import {GeometryExtension} from '../../../core/FileTypeController';

export class FilePDBSopNode extends fileSopNodeFactory({
	type: SopTypeFile.FILE_PDB,
	operation: FilePDBSopOperation as typeof BaseFileSopOperation,
	extensions: [GeometryExtension.PDB],
}) {}
