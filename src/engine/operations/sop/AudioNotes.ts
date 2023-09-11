import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {AttribClass, ATTRIBUTE_CLASSES} from '../../../core/geometry/Constant';
import {TypeAssert} from '../../poly/Assert';
import {NotesBuilder, NoteHolder} from '../../../core/audio/NotesBuilder';
import {CoreAttribute} from '../../../core/geometry/Attribute';
import {CoreEntity} from '../../../core/geometry/CoreEntity';
import {isBooleanTrue} from '../../../core/Type';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {pointsFromObject} from '../../../core/geometry/entities/point/CorePointUtils';
import {corePointClassFactory} from '../../../core/geometry/CoreObjectFactory';

enum OutOfRangeBehavior {
	RESTART = 'restart',
	BOUNCE = 'bounce',
}
export const OUT_OF_RANGE_BEHAVIOR: OutOfRangeBehavior[] = [OutOfRangeBehavior.RESTART, OutOfRangeBehavior.BOUNCE];

interface AudioNotesSopParams extends DefaultOperationParams {
	class: number;
	name: string;
	toctave: boolean;
	octaveName: string;
	startOctave: number;
	endOctave: number;
	outOfRangeBehavior: number;
}

export class AudioNotesSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: AudioNotesSopParams = {
		class: ATTRIBUTE_CLASSES.indexOf(AttribClass.OBJECT),
		name: 'note',
		toctave: false,
		octaveName: 'octave',
		startOctave: 2,
		endOctave: 4,
		outOfRangeBehavior: OUT_OF_RANGE_BEHAVIOR.indexOf(OutOfRangeBehavior.BOUNCE),
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<'AudioNotes'> {
		return 'AudioNotes';
	}

	override cook(inputCoreGroups: CoreGroup[], params: AudioNotesSopParams) {
		const inputCoreGroup = inputCoreGroups[0];

		const attribClass = ATTRIBUTE_CLASSES[params.class];
		this._addAttribute(attribClass, inputCoreGroup, params);

		return inputCoreGroup;
	}
	private async _addAttribute(attribClass: AttribClass, coreGroup: CoreGroup, params: AudioNotesSopParams) {
		switch (attribClass) {
			case AttribClass.POINT:
				return this._addPointAttribute(coreGroup, params);
			case AttribClass.VERTEX: {
				this.states?.error.set('vertex not supported yet');
				return;
			}
			case AttribClass.PRIMITIVE: {
				this.states?.error.set('primitive not supported yet');
				return;
			}
			case AttribClass.OBJECT:
				return this._addObjectAttribute(coreGroup, params);
			case AttribClass.CORE_GROUP:
				return this._addCoreGroupAttribute(coreGroup, params);
		}
		TypeAssert.unreachable(attribClass);
	}

	private _addPointAttribute(coreGroup: CoreGroup, params: AudioNotesSopParams) {
		const objects = coreGroup.allObjects();

		for (let object of objects) {
			const corePoints = pointsFromObject(object);
			const corePointClass = corePointClassFactory(object);
			const values = this._values(corePoints, params);

			// const coreGeometry = coreObject.coreGeometry();
			// if (coreGeometry) {
			const notesIndexData = CoreAttribute.arrayToIndexedArrays(values.map((v) => v.note));
			corePointClass.setIndexedAttribute(object, params.name, notesIndexData.values, notesIndexData.indices);
			if (isBooleanTrue(params.toctave)) {
				const octavesArray = values.map((v) => v.octave);
				if (!corePointClass.hasAttrib(object, params.octaveName)) {
					corePointClass.addNumericAttrib(object, params.octaveName, 1, 1);
				}
				let i = 0;
				for (let corePoint of corePoints) {
					corePoint.setAttribValue(params.octaveName, octavesArray[i]);
					i++;
				}
			}
			// }
		}
	}
	private _addObjectAttribute(coreGroup: CoreGroup, params: AudioNotesSopParams) {
		const coreObjects = coreGroup.allCoreObjects();

		const values = this._values(coreObjects, params);
		for (let i = 0; i < coreObjects.length; i++) {
			const coreObject = coreObjects[i];
			coreObject.addAttribute(params.name, values[i].note);
			if (isBooleanTrue(params.toctave)) {
				coreObject.addAttribute(params.octaveName, values[i].octave);
			}
		}
	}
	private _addCoreGroupAttribute(coreGroup: CoreGroup, params: AudioNotesSopParams) {
		const values = this._values([coreGroup], params);
		coreGroup.addAttribute(params.name, values[0].note);
		if (isBooleanTrue(params.toctave)) {
			coreGroup.addAttribute(params.octaveName, values[0].octave);
		}
	}

	private _values(entities: CoreEntity[], params: AudioNotesSopParams) {
		let increment = 1;
		let i = 0;
		const behavior = OUT_OF_RANGE_BEHAVIOR[params.outOfRangeBehavior];
		const noteHolders = NotesBuilder.list(params.startOctave, params.endOctave);
		const values: NoteHolder[] = [];
		for (let k = 0; k < entities.length; k++) {
			if (i >= noteHolders.length) {
				switch (behavior) {
					case OutOfRangeBehavior.BOUNCE: {
						increment = -1;
						i = noteHolders.length - 2;
						break;
					}
					case OutOfRangeBehavior.RESTART: {
						i = 0;
						break;
					}
				}
			}
			if (behavior == OutOfRangeBehavior.BOUNCE) {
				if (i == 0 && increment < 0) {
					increment = +1;
					i = 1;
				}
			}
			const note = noteHolders[i];
			values.push(note);

			i += increment;
		}
		return values;
	}
}
