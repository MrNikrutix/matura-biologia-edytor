import { Component, OnInit } from '@angular/core';
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

  constructor(public snackBar: MdSnackBar) {
    // needed to keep sanity with live reload
    if(!window['repo-location']) {
      window['repo-location'] = '../matura-biologia';
    }
    this.readSectionsFromRepo();
    this.loadDefaultBackground();
  }

  public editSection(section: Section) {
    this.cleanAfterNoteEdit();

    this.selectedSection = section;

    if(this.sectionToEdit === section) {
      return this.cleanAfterSectionEdit() 
    }

    this.sectionToEdit = section;
    this.tempSection = new Section(section.title, section.subtitle, section.background);
    this.tempSectionBackground = '';

    if(this.doesSelectedSectionExist) {
      this.readNotesFromRepo(section);
    }
  }

  public editNote(note: Note) {
    this.selectedNote = note;

    if(this.noteToEdit === note) {
      return this.cleanAfterNoteEdit();
    }

    this.noteToEdit = note;
    this.tempNote = new Note(note.title, note.subtitle, note.background, note.content);
    this.tempNoteBackground = '';
  }

  public createNewSection() {
    this.editSection(new Section('', '', ''));
    this.tempSectionBackground = this.defaultBackground;
  }

  public createThisNote() {
    throw 'unimplemented';
  }

  public image(url: string, alternative: string) {
    if (!url) return this.defaultBackground;
    if (alternative) return alternative;
    return `./${window['repo-location']}${url}`;
  }

  public onFileSelect(event: any, target: any) {
    if (event.target.files && event.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (e: any) => { target = e.target.result; }
        reader.readAsDataURL(event.target.files[0]);
    }
  }

  public get hasSomethingBeenEditedInSelectedSection() {
    return JSON.stringify(this.tempSection) !== JSON.stringify(this.selectedSection) || this.tempSectionBackground !== '';
  }

  public get hasSomethingBeenEditedInSelectedNote() {
    return JSON.stringify(this.tempNote) !== JSON.stringify(this.selectedNote) || this.tempNoteBackground !== '';
  }

  public get doesSelectedSectionExist() {
    return this.sections.indexOf(this.selectedSection) >= 0;
  }

  public async saveSectionEditChanges() {
    const promises = [];

    if(this.tempSectionBackground) {
      const ext = this.tempSectionBackground.split(';')[0].slice('data:image\\'.length);
      const backgroundUrl = `/data/biology/background-images/${this.tempSection.title}.${ext}`;
    
      this.tempSection.background = backgroundUrl;

      const dest = `matura-biologia/data/biology/background-images/`;
      const filename = `${this.tempSection.title}`;
      
      promises.push(new Promise((resolve, reject) => {
        base64Img.img(this.tempSectionBackground, dest, filename, (err, filepath) => err ? reject(err) : resolve());
      }));
      
      promises.push(new Promise((resolve, reject) => {
        if(this.selectedSection.background) fs.unlink(`matura-biologia${this.selectedSection.background}`, (err) => err ? reject(err) : resolve());
        else resolve();
      }));

    }

    if(this.selectedSection.title !== this.tempSection.title) {
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
      fs.writeFile(`matura-biologia/data/biology/sections.json`, JSON.stringify(this.sections), (err) => err ? reject(err) : resolve());
    }));

    promises.push()

    await Promise.all(promises);

    this.cleanAfterSectionEdit();
    this.snackBar.open('Gotowe!', 'Ok', { duration: 2500, extraClasses: ['dark'] });
  }

  public async saveNoteEditChanges() {
    throw 'unimplemented';
  }

  private cleanAfterSectionEdit() {
    this.sectionToEdit = null;
    this.tempSectionBackground = '';
  }

  private cleanAfterNoteEdit() {
    this.noteToEdit = null;
    this.tempNoteBackground = '';
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
      if (err) this.notes = [];
      this.notes = JSON.parse(data.toString());
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
