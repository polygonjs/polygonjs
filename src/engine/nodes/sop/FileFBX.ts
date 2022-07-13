/**
 * Loads a FBX from a url.
 *
 *
 */
import {FileFBXSopOperation} from '../../operations/sop/FileFBX';
import {fileSopNodeFactory} from './utils/file/_BaseSopFile';
import {BaseFileSopOperation} from '../../operations/sop/utils/File/_BaseFileOperation';
import {SopTypeFile} from '../../poly/registers/nodes/types/Sop';
import {GeometryExtension} from '../../../core/FileTypeController';

export class FileFBXSopNode extends fileSopNodeFactory({
	type: SopTypeFile.FILE_FBX,
	operation: FileFBXSopOperation as typeof BaseFileSopOperation,
	extensions: [GeometryExtension.FBX],
}) {}
