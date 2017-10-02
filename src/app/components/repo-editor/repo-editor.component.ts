import { Component } from '@angular/core';

class Link {
  constructor(public name: string, public href: string = '') {}
}

@Component({
  selector: 'app-repo-editor',
  templateUrl: './repo-editor.component.html',
  styleUrls: ['./repo-editor.component.scss']
})
export class RepoEditorComponent {
  public links = [
    new Link('Sekcje')
  ];

  constructor() { }

}
