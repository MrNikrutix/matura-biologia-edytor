import { Component, Input, ViewChild, AfterViewInit, NgZone, Output, EventEmitter } from '@angular/core';
import { MdSnackBar } from '@angular/material';
import { Note } from '../../data-types/note';
import { FileHelper } from '../../helpers/file-helper';
import * as path from 'path';
import * as fs from 'fs';

@Component({
  selector: 'app-note-form',
  templateUrl: './note-form.component.html',
  styleUrls: ['./note-form.component.scss']
})
export class NoteFormComponent implements AfterViewInit {
  @ViewChild('image') public image;

  @ViewChild('metadataPanel') public metadataPanel;

  @ViewChild('contentPanel') public contentPanel;

  @Output() public update = new EventEmitter<Note>();

  @Input() public set note(note: Note) {
    if (note) {
      this.originalNote = note;
      this.tempNote = new Note(note.title, note.subtitle, note.background, note.content);
      this.tempBackground = note.background;

      if(this.image !== undefined) {
        this.image.nativeElement.src = window['repo-location'] + this.tempBackground;
      }

      if(this.tempNote.content) {
        try {
          this.noteContent = fs.readFileSync(`matura-biologia${note.content}`, 'utf-8');
        } catch (err) {
          console.log('bad note content path:' + err);
        }
      }
    }
  }

  public ngAfterViewInit() {
    if(this.tempBackground) {
      this.image.nativeElement.src = window['repo-location'] + this.tempBackground;
    }
  }

  public originalNote: Note = null;
  public tempNote: Note = null;
  public tempBackground = '';
  public noteContent = '';

  constructor(private zone: NgZone, private snackBar: MdSnackBar) { }

  public onFileSelect(event: any) {
    FileHelper.onFileSelect(event, (data) => {
      this.zone.run(() => {
        this.tempBackground = data;
        this.image.nativeElement.src = data;
      })
    });
  }

  public get hasBeenEdited() {
    return JSON.stringify(this.tempNote) !== JSON.stringify(this.originalNote) || this.tempBackground !== this.tempNote.background;
  }

  public async saveNoteChanges() {
    if (this.tempBackground !== this.originalNote.background) {
      const ext = this.tempBackground.split(';')[0].slice('data:image\\'.length);
      const dest = `/data/biology/notes/background-images/`;
      const backgroundUrl = `${dest}${this.tempNote.title}.${ext}`;
      const filename = this.tempNote.title;

      this.tempNote.background = backgroundUrl;

      if(this.originalNote.background) {
        console.log('TEST: ' + 'matura-biologia/' + this.originalNote.background);
        await FileHelper.deleteFilePromise('matura-biologia' + this.originalNote.background);
        console.log('deleted old background');
      }

      await FileHelper.saveBase64ToImagePromise(this.tempBackground, 'matura-biologia' + dest, filename);
    }

    if (this.tempBackground === this.originalNote.background && this.originalNote.title !== this.tempNote.title) {

      this.tempNote.background = this.tempNote.background.slice(0, this.tempNote.background.lastIndexOf('/')+1) + this.tempNote.title + path.parse(this.originalNote.background).ext;
      console.log(`rename: ${`matura-biologia${this.originalNote.background}`} -> ${`matura-biologia${this.tempNote.background}`}`);
      await FileHelper.renameFilePromise(
        `matura-biologia${this.originalNote.background}`,
        `matura-biologia${this.tempNote.background}`
      )
      console.log('renamed image');
    }

    this.tempBackground = this.tempNote.background;
    this.update.emit(this.tempNote);
    this.metadataPanel.close();
    this.snackBar.open('Gotowe!', 'Ok', { duration: 2500, extraClasses: ['dark'] });
  }

  public async saveNoteContent() {
    console.log('unlink: ' + `matura-biologia${this.tempNote.content}`);
    if(fs.existsSync(`matura-biologia${this.tempNote.content}`) && this.tempNote.content) {
      fs.unlinkSync(`matura-biologia${this.tempNote.content}`);
    }

    console.log('write file sync: ' + `/data/biology/notes/html/${this.tempNote.title}.html`);
    this.tempNote.content = `/data/biology/notes/html/${this.tempNote.title}.html`;
    fs.writeFileSync(`matura-biologia${this.tempNote.content}`, this.noteContent);
    this.update.emit(this.tempNote);
  }
}
