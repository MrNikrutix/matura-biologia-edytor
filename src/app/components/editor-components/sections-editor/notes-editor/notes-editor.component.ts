import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MdSnackBar } from '@angular/material';
import { Section } from '../data-types/section';
import { Note } from '../data-types/note';
import * as fs from 'fs';

@Component({
  selector: 'app-notes-editor',
  templateUrl: './notes-editor.component.html',
  styleUrls: ['./notes-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotesEditorComponent {
  @Input() public set section(section: Section) {
    if(section) {
      this.sectionTitle = section.title;
      this.readNotesFromRepo();
      this.cd.markForCheck();
    }
  }

  public sectionTitle = '';
  public notes: Note[] = [];

  constructor(private snackBar: MdSnackBar, private cd: ChangeDetectorRef) { }

  public updateNote(index, note) {
    console.log('index: ' + index);
    this.notes[index] = note;
    this.notes = [...this.notes];
    this.cd.markForCheck();
    fs.writeFileSync(`matura-biologia/data/biology/notes/${this.sectionTitle}.json`, JSON.stringify(this.notes, null, 2));
    this.snackBar.open('Zapisano', 'Ok', { duration: 2500, extraClasses: ['dark'] });
  }

  public createNewNote() {
    this.notes.push(new Note(`Nowa notka ${new Date().getTime()}`, '(do uzupełnienia)', '', ''));
    this.notes = [...this.notes];
    this.cd.markForCheck();
  }

  private readNotesFromRepo() {
    console.log(`matura-biologia/data/biology/notes/${this.sectionTitle}.json`);

    fs.readFile(`matura-biologia/data/biology/notes/${this.sectionTitle}.json`, (err, data) => {
      if (err) {
        console.log(err);
      } else {
        try {
          this.notes = JSON.parse(data.toString());
          this.cd.markForCheck();
        } catch(anything) {}
      }
    });
  }
}
