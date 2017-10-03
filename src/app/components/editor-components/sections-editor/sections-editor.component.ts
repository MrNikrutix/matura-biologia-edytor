import { Component, OnInit, NgZone } from '@angular/core';
import * as fs from 'fs';
import { MdSnackBar } from '@angular/material';
import * as base64Img from 'base64-img';

const cp = require('child_process'); 

class Section {
  constructor(
    public title: string, 
    public subtitle: string, 
    public background: string
  ) {}
}

class Note {
  constructor(
    public title: string,
    public subtitle: string,
    public background: string,
    public content: string
  ) {}
}

@Component({
  selector: 'app-sections-editor',
  templateUrl: './sections-editor.component.html',
  styleUrls: ['./sections-editor.component.scss']
})
export class SectionsEditorComponent {
  public sections: Section[] = [];
  public sectionToEdit: Section = null;
  public selectedSection: Section = null;
  public tempSection: Section = null;
  public tempSectionBackground = '';
  
  public notes: Note[] = [];
  public noteToEdit: Note = null;
  public selectedNote: Note = null;
  public tempNote: Note = null;
  public tempNoteBackground = '';
  
  public defaultBackground = '';

  public tempNoteContent = null;
  public tempNoteContentNote: Note = null;

  public imgLocation = '';

  constructor(public snackBar: MdSnackBar, private zone: NgZone) {
    // needed to keep sanity with live reload
    if(!window['repo-location']) {
      window['repo-location'] = '../matura-biologia';
    }
    this.imgLocation = window['repo-location'];
    this.readSectionsFromRepo();
    this.loadDefaultBackground();
  }

  public editSection(section: Section) {
    this.cleanAfterNoteEdit();
    this.cleanAfterNoteContentEdit();

    this.selectedSection = section;

    if(this.sectionToEdit === section) {
      return this.cleanAfterSectionEdit() 
    }

    this.sectionToEdit = section;
    this.tempSection = new Section(section.title, section.subtitle, section.background);
    this.tempSectionBackground = this.tempSection.background;

    if(this.doesSelectedSectionExist) {
      this.readNotesFromRepo(section);
    }
  }

  public editNote(note: Note) {
    console.log('edit note');
    this.cleanAfterNoteContentEdit();
    this.selectedNote = note;

    if(this.noteToEdit === note) {
      return this.cleanAfterNoteEdit();
    }

    this.noteToEdit = note;
    this.tempNote = new Note(note.title, note.subtitle, note.background, note.content);
    this.tempNoteBackground = this.tempNote.background;
  }

  public createNewSection() {
    this.editSection(new Section('', '', ''));
    this.tempSectionBackground = this.defaultBackground;
  }

  public createNewNote() {
    this.editNote(new Note('', '', '', ''));
    this.tempNoteBackground = this.defaultBackground;
  }

  public createContentForNote(note: Note) {
    this.tempNoteContentNote = note;

    if(this.tempNoteContent !== null) {
      return this.cleanAfterNoteContentEdit();
    }
    if(note.content) {
      fs.readFile(`matura-biologia${note.content}`, (err, data) => {
        if (err) this.snackBar.open(JSON.stringify(err), 'Ok', { duration: 5000 });
        else {
          this.tempNoteContent = data.toString();
        }
      });
    } else {
      this.tempNoteContent = '';
    }
  }

  public smartImage(url: string) {
    if(url.indexOf('data:image') == 0) {
      return url;
    } else {
      return this.imgLocation + url;
    }
  }

  public onFileSelect(event: any, target: string) {
    if (event.target.files && event.target.files[0]) {
        const reader = new FileReader();
        console.log(event.target.files[0]);
        cp.exec(`copy "${event.target.files[0].path}" "matura-biologia/totally-temporary-tmp.${event.target.files[0].name}"`, (err, stdout, stderr) => {
          console.log([err, stdout, stderr]);
          if(!err) {
            base64Img.base64(`matura-biologia/totally-temporary-tmp.${event.target.files[0].name}`, (err, data) => {
              if(err) console.log(err);
              else {
                this.zone.run(() => {
                  this[target] = data;
                  console.log(`loaded: matura-biologia/tmp.${event.target.files[0].name}`);
                });
              }
            });
          }
        });
    }
  }

  public get hasSomethingBeenEditedInSelectedSection() {
    return JSON.stringify(this.tempSection) !== JSON.stringify(this.selectedSection) || this.tempSectionBackground !== this.selectedSection.background;
  }

  public get hasSomethingBeenEditedInSelectedNote() {
    return JSON.stringify(this.tempNote) !== JSON.stringify(this.selectedNote) || this.tempNoteBackground !== this.selectedNote.background;
  }

  public get doesSelectedSectionExist() {
    return this.sections.indexOf(this.selectedSection) >= 0;
  }

  public saveNoteContent() {
    fs.writeFile(`matura-biologia${this.tempNoteContentNote.content}`, this.tempNoteContent, (err) => {
      if(err) {
        this.snackBar.open(JSON.stringify(err), 'Ok', { duration: 2*2500, extraClasses: ['dark'] });
        console.log(err);
      }
      else this.snackBar.open('Gotowe!', 'Ok', { duration: 2500, extraClasses: ['dark'] });
    });
    this.cleanAfterNoteContentEdit();
  }

  public async saveSectionEditChanges() {
    const promises = [];

    if (this.selectedSection.background != this.tempSectionBackground) {
      const ext = this.tempSectionBackground.split(';')[0].slice('data:image\\'.length);
      const dest = `/data/biology/background-images/`;
      const backgroundUrl = `${dest}${this.tempSection.title}.${ext}`;
      const filename = this.tempSection.title;

      this.tempSection.background = backgroundUrl;

      promises.push(new Promise((resolve, reject) => {
        base64Img.img(this.tempSectionBackground, 'matura-biologia' + dest, filename, (err, filepath) => err ? reject(err) : resolve());
      }));

      if (this.selectedSection.title !== this.tempSection.title && this.selectedSection.background) promises.push(new Promise((resolve, reject) => {
        fs.unlink(`matura-biologia${this.selectedSection.background}`, (err) => err ? reject(err) : resolve());
      }));
    }

    if(this.selectedSection.title !== this.tempSection.title && this.selectedSection.title) {
      promises.push(new Promise((resolve, reject) => {
        fs.rename(`matura-biologia/data/biology/notes/${this.selectedSection.title}.json`, `matura-biologia/data/biology/notes/${this.tempSection.title}.json`, (err) => err ? reject(err) : resolve());
      }));
    }

    const index = this.sections.indexOf(this.selectedSection);
    if(index >= 0) {
      this.sections[index] = this.tempSection;
    } else {
      this.sections.push(this.tempSection);
    }
    console.log(this.sections);

    
    promises.push(new Promise((resolve, reject) => {
      fs.writeFile(`matura-biologia/data/biology/sections.json`, JSON.stringify(this.sections, null, 2), (err) => err ? reject(err) : resolve());
    }));

    await Promise.all(promises);

    console.log('about to clean...');
    this.cleanAfterSectionEdit();
    this.snackBar.open('Gotowe!', 'Ok', { duration: 2500, extraClasses: ['dark'] });
  }

  public async saveNoteEditChanges() {
    const promises = [];

    if (this.tempNoteBackground) {
      const ext = this.tempNoteBackground.split(';')[0].slice('data:image\\'.length);
      const dest = `/data/biology/notes/background-images/`;
      const backgroundUrl = `${dest}${this.tempNote.title}.${ext}`;
      const filename = this.tempNote.title;

      this.tempNote.background = backgroundUrl;

      promises.push(new Promise((resolve, reject) => {
        base64Img.img(this.tempNoteBackground, 'matura-biologia' + dest, filename, (err, filepath) => err ? reject(err) : resolve());
      }));

      if (this.selectedNote.background && this.selectedNote.background != this.tempNote.background) promises.push(new Promise((resolve, reject) => {
         fs.unlink(`matura-biologia${this.selectedNote.background}`, (err) => err ? reject(err) : resolve());
      }));
    }

    if(this.tempNote.content && this.tempNote.title !== this.selectedNote.title) {
      this.tempNote.content = `/data/biology/notes/html/${this.tempNote.title}.html`;
      
      promises.push(new Promise((resolve, reject) => {
        fs.rename(`matura-biologia${this.selectedNote.content}`, `matura-biologia${this.tempNote.content}`, (err) => err ? reject(err) : resolve());
      }));
    }

    if(!this.tempNote.content) {
      this.tempNote.content = `/data/biology/notes/html/${this.tempNote.title}.html`;

      cp.exec(`copy nul "matura-biologia${this.tempNote.content}"`, function(error, stdout, stderr) {
        console.log('(after creating empty file)');
        console.log([error, stdout, stderr]);
      });
    }

    const index = this.notes.indexOf(this.selectedNote);
    if(index >= 0)  this.notes[index] = this.tempNote;
    else this.notes.push(this.tempNote);
    console.log(this.notes);

    promises.push(new Promise((resolve, reject) => { // yes, selectedSection here. Don't sleep dude
      fs.writeFile(`matura-biologia/data/biology/notes/${this.selectedSection.title}.json`, JSON.stringify(this.notes, null, 2), (err) => err ? reject(err) : resolve());
    }));

    await Promise.all(promises);

    this.cleanAfterNoteEdit();
    this.snackBar.open('Gotowe!', 'Ok', { duration: 2500, extraClasses: ['dark'] });
  }

  private cleanAfterSectionEdit() {
    console.log('after section edit');
    this.sectionToEdit = null;
    this.tempSectionBackground = '';
  }

  private cleanAfterNoteEdit() {
    this.noteToEdit = null;
    this.tempNoteBackground = '';
  }

  private cleanAfterNoteContentEdit() {
    this.tempNoteContent = null;
  }

  private readSectionsFromRepo() {
    fs.readFile(`matura-biologia/data/biology/sections.json`, (err, data) => {
      if (err) this.snackBar.open(JSON.stringify(err), 'Ok', { duration: 5000 });
      this.sections = JSON.parse(data.toString());
      console.log(this.sections);
    });
  }

  private readNotesFromRepo(section: Section) {
    fs.readFile(`matura-biologia/data/biology/notes/${section.title}.json`, (err, data) => {
      if (err) {
        this.notes = [];
        console.log(err);
      } else {
        this.notes = JSON.parse(data.toString());
      }
    });
  }

  private async saveNotes(section: Section) {
    return new Promise((resolve, reject) => fs.writeFile(`matura-biologia/data/biology/notes/${section.title}.json`, JSON.stringify(this.notes), (err) => err ? reject(err) : resolve()));
  }

  private loadDefaultBackground() {
    base64Img.base64('matura-biologia/data/defaults/default-card-image.jpg', (err, data) => {
      if(err) console.log(err);
      this.defaultBackground = data;
      console.log('default background loaded');
    });
  }
}
