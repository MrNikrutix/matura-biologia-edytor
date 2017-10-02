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
  public tempBackground = '';

  constructor(public snackBar: MdSnackBar) {
    // needed to keep sanity with live reload
    if(!window['repo-location']) {
      window['repo-location'] = '../matura-biologia';
    }
    this.readSectionsFromRepo();
  }

  public edit(section: Section) {
    this.selectedSection = section;

    if(this.sectionToEdit === section) {
      return this.cleanAfterEdit();
    }

    this.sectionToEdit = section;
    this.tempSection = new Section(
      section.title,
      section.subtitle,
      section.background
    );

    this.tempBackground = '';
  }

  public sectionImage(url: string) {
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

  public get hasSomethingBeenEdited() {
    return JSON.stringify(this.tempSection) !== JSON.stringify(this.selectedSection) || this.tempBackground !== '';
  }

  public async saveEditChanges() {
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
        fs.unlink(`matura-biologia${this.selectedSection.background}`, (err) => err ? reject(err) : resolve());
      }));

    }

    this.sections[this.sections.indexOf(this.selectedSection)] = this.tempSection;
    console.log(this.sections);

    
    promises.push(new Promise((resolve, reject) => {
      fs.writeFile(`matura-biologia/data/biology/sections.json`, JSON.stringify(this.sections), (err) => err ? reject(err) : resolve());
    }));

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
      if(err) {
        this.snackBar.open(JSON.stringify(err), 'Ok', { duration: 5000 });
      }
      this.sections = JSON.parse(data.toString());
      console.log(this.sections);
    });
  }

}
