import 'zone.js/dist/zone-mix';
import 'reflect-metadata';
import 'polyfills';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';

import { AppRoutingModule } from './app-routing.module';

import { ElectronService } from './providers/electron.service';

import {
  MatButtonModule,
  MatMenuModule,
  MatToolbarModule,
  MatIconModule,
  MatCardModule,
  MatListModule,
  MatProgressSpinnerModule,
  MdSnackBarModule,
  MatTabsModule,
  MatSidenavModule
} from '@angular/material';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ChooseRepoComponent } from './components/choose-repo/choose-repo.component';
import { RepoEditorComponent } from './components/repo-editor/repo-editor.component';
import { SectionsEditorComponent } from './components/editor-components/sections-editor/sections-editor.component';

const materialModules = [
  MatButtonModule,
  MatMenuModule,
  MatToolbarModule,
  MatIconModule,
  MatCardModule,
  MatListModule,
  MatProgressSpinnerModule,
  MdSnackBarModule,
  MatTabsModule,
  MatSidenavModule
];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ChooseRepoComponent,
    RepoEditorComponent,
    SectionsEditorComponent
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule,
    ...materialModules
  ],
  providers: [ElectronService],
  bootstrap: [AppComponent]
})
export class AppModule { }
