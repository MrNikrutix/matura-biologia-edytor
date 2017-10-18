import { Component, AfterViewInit, Input, Output, NgZone, ViewChild, EventEmitter } from '@angular/core';
import { MdSnackBar } from '@angular/material';
import { Section } from '../data-types/section';
import { FileHelper } from '../helpers/file-helper';

const cp = require('child_process');
import * as base64Img from 'base64-img';
import * as fs from 'fs';
import * as path from 'path';

@Component({
  selector: 'app-section-form',
  templateUrl: './section-form.component.html',
  styleUrls: ['./section-form.component.scss']
})
export class SectionFormComponent implements AfterViewInit {
  @Output() public update = new EventEmitter<Section>();

  @ViewChild('panel') public panel;
  
  @ViewChild('image') public image;

  @Input() public set section(section: Section) {
    if(section) {
      this.originalSection = section;
      this.tempSection = new Section(section.title, section.subtitle, section.background);
      this.tempBackground = this.tempSection.background;
      if(this.image !== undefined) {
        this.image.nativeElement.src = window['repo-location'] + this.tempBackground;
      }
    }
  }

  ngAfterViewInit() {
    if(this.tempBackground) {
      this.image.nativeElement.src = window['repo-location'] + this.tempBackground;
    }
  }

  public originalSection: Section = null;
  public tempSection: Section = null;
  public tempBackground = '';

  constructor(public snackBar: MdSnackBar, private zone: NgZone) { }

  public get hasBeenEdited() {
    return JSON.stringify(this.tempSection) !== JSON.stringify(this.originalSection) || this.tempBackground !== this.tempSection.background;
  }

  public onFileSelect(event: any, cb) {
    FileHelper.onFileSelect(event, (data) => {
      this.zone.run(() => {
        this.tempBackground = data;
        this.image.nativeElement.src = data;
      })
    });
  }

  public async saveSectionEditChanges() {
    if (this.originalSection.background != this.tempBackground) {
      const ext = this.tempBackground.split(';')[0].slice('data:image\\'.length);
      const dest = `/data/biology/background-images/`;
      const backgroundUrl = `${dest}${this.tempSection.title}.${ext}`;
      const filename = this.tempSection.title;

      this.tempSection.background = backgroundUrl;

      if(this.originalSection.background) {
        console.log('TEST: ' + 'matura-biologia/' + this.originalSection.background);
        await FileHelper.deleteFilePromise('matura-biologia' + this.originalSection.background);
        console.log('deleted old background');
      }

      console.log(this.tempBackground.slice(0, 100));
      await FileHelper.saveBase64ToImagePromise(this.tempBackground, 'matura-biologia' + dest, filename);
      console.log('saved new background')
    }

    if(this.tempBackground === this.originalSection.background && this.originalSection.title !== this.tempSection.title) {
      this.tempSection.background = this.tempSection.background.slice(0, this.tempSection.background.lastIndexOf('/')+1) + this.tempSection.title + path.parse(this.originalSection.background).ext;
      await FileHelper.renameFilePromise(
        `matura-biologia${this.originalSection.background}`,
        `matura-biologia${this.tempSection.background}`
      )
      console.log('renamed image');
    }

    await FileHelper.renameOrCreateFilePromise(
      `matura-biologia/data/biology/notes/${this.originalSection.title}.json`, 
      `matura-biologia/data/biology/notes/${this.tempSection.title}.json`
    );
    console.log('renamed notes index file');

    await FileHelper.renameOrCreateFilePromise(
      `matura-biologia/data/biology/quiz/${this.originalSection.title}.json`, 
      `matura-biologia/data/biology/quiz/${this.tempSection.title}.json`
    );
    console.log('renamed quiz file');

    this.tempBackground = this.tempSection.background;
    this.update.emit(this.tempSection);
    this.panel.close();
    this.snackBar.open('Gotowe!', 'Ok', { duration: 2500, extraClasses: ['dark'] });
  }

}
