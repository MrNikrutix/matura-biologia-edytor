import { Component, OnInit } from '@angular/core';
import { Section } from './data-types/section';
import * as fs from 'fs';
import { MdSnackBar } from '@angular/material';

const cp = require('child_process'); 

@Component({
  selector: 'app-sections-editor',
  templateUrl: './sections-editor.component.html',
  styleUrls: ['./sections-editor.component.scss']
})
export class SectionsEditorComponent {
  public sections: Section[] = [];

  constructor(public snackBar: MdSnackBar) {
    if(!window['repo-location']) {
      window['repo-location'] = '../matura-biologia';
    }

    this.readSectionsFromRepo();
  }

  public updateSection(index, section) {
    console.log(index);
    this.sections[index] = section;
    this.sections = [...this.sections];
    console.log(this.sections);
    fs.writeFileSync(`matura-biologia/data/biology/sections.json`, JSON.stringify(this.sections, null, 2));
  }

  public createNewSection() {
    this.sections.push(new Section(`Nowa sekcja ${new Date().getTime()}`, '(do uzupełnienia)', ''));
  }

  private readSectionsFromRepo() {
    fs.readFile(`matura-biologia/data/biology/sections.json`, (err, data) => {
      if (err) this.snackBar.open(JSON.stringify(err), 'Ok', { duration: 5000 });
      this.sections = JSON.parse(data.toString());
      console.log(this.sections);
    });
  }
}
