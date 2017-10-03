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
    title: string,
    subtitle: string,
    background: string,
    content: string
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

  public notes: Note[] = [];

  public selectedSection: Section = null;
  public tempSection: Section = null;
  public tempBackground = '';
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
    this.selectedSection = section;

    if(this.sectionToEdit === section) {
      return this.cleanAfterEdit();
    }

    this.sectionToEdit = section;
    this.tempSection = new Section(section.title, section.subtitle, section.background);

    this.tempBackground = '';

    if(this.doesSelectedSectionExist) {
      this.readNotesFromRepo(section);
    }
  }

  public createNewSection() {
    this.editSection(new Section('', '', ''));
    this.tempBackground = this.defaultBackground;
  }

  public createThisNote() {
    throw 'unimplemented';
  }

  public sectionImage(url: string) {
    if(!url) {
      return this.defaultBackground;
    }
    if(this.tempBackground) {
      return this.tempBackground;
    }
    return `./${window['repo-location']}${url}`;
  }

  public onFileSelect(event) {
    if (event.target.files && event.target.files[0]) {
        var reader = new FileReader();

        reader.onload = (e: any) => {
          this.tempBackground = e.target.result;
        }

        reader.readAsDataURL(event.target.files[0]);
    }
  }

  public get hasSomethingBeenEditedInSelectedSection() {
    return JSON.stringify(this.tempSection) !== JSON.stringify(this.selectedSection) || this.tempBackground !== '';
  }

  public get doesSelectedSectionExist() {
    return this.sections.indexOf(this.selectedSection) >= 0;
  }

  public async saveSectionEditChanges() {
    const promises = [];

    if(this.tempBackground) {
      const ext = this.tempBackground.split(';')[0].slice('data:image\\'.length);
      const backgroundUrl = `/data/biology/background-images/${this.tempSection.title}.${ext}`;
    
      this.tempSection.background = backgroundUrl;

      const dest = `matura-biologia/data/biology/background-images/`;
      const filename = `${this.tempSection.title}`;
      
      promises.push(new Promise((resolve, reject) => {
        base64Img.img(this.tempBackground, dest, filename, (err, filepath) => err ? reject(err) : resolve());
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

    this.cleanAfterEdit();
    this.snackBar.open('Gotowe!', 'Ok', { duration: 2500, extraClasses: ['dark'] });
  }

  private cleanAfterEdit() {
    this.sectionToEdit = null;
    this.tempBackground = '';
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
