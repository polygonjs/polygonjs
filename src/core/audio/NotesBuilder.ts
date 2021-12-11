export interface NoteHolder {
	octave: number;
	note: string;
}

export class NotesBuilder {
	static ALL_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

	static list(startOctave: number, endOctave: number) {
		let noteIndex = 0;
		const noteHolders: NoteHolder[] = [];
		for (let octave = startOctave; octave <= endOctave; octave++) {
			while (noteIndex < this.ALL_NOTES.length) {
				const currentNote = this.ALL_NOTES[noteIndex];
				const newNote = currentNote + octave;
				noteHolders.push({note: newNote, octave});

				if (currentNote !== 'B' && currentNote !== 'E') {
					const blackNote = currentNote + '#' + octave;
					noteHolders.push({note: blackNote, octave});
				}

				if (octave === endOctave && currentNote === 'B') break;

				noteIndex++;
			}
			noteIndex = 0;
		}
		return noteHolders;
	}
}
