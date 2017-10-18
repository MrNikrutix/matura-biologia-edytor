import { Component, Input } from '@angular/core';
import { Section } from '../data-types/section';
import { Note } from '../data-types/note';
import * as fs from 'fs';

@Component({
  selector: 'app-notes-editor',
  templateUrl: './notes-editor.component.html',
  styleUrls: ['./notes-editor.component.scss']
})
export class NotesEditorComponent {
  @Input() public set section(section: Section) {
    if(section) {
      this.sectionTitle = section.title;
      this.readNotesFromRepo();
    }
  }

  public sectionTitle = '';
  public notes: Note[] = [];

  constructor() { }

  public updateNote(index, note) {
    console.log('index: ' + index);
    this.notes[index] = note;
    this.notes = [...this.notes];
    fs.writeFileSync(`matura-biologia/data/biology/notes/${this.sectionTitle}.json`, JSON.stringify(this.notes, null, 2));
  }

  public createNewNote() {
    this.notes.push(new Note(`Nowa notka ${new Date().getTime()}`, '(do uzupełnienia)', '', ''));
  }

  private readNotesFromRepo() {
    console.log(`matura-biologia/data/biology/notes/${this.sectionTitle}.json`);

    fs.readFile(`matura-biologia/data/biology/notes/${this.sectionTitle}.json`, (err, data) => {
      if (err) {
        console.log(err);
      } else {
        try {
          this.notes = JSON.parse(data.toString());
        } catch(anything) {}
      }
    });
  }
}
