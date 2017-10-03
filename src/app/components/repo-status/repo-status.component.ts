import { Component} from '@angular/core';

import * as cp from 'child_process';

@Component({
  selector: 'app-repo-status',
  templateUrl: './repo-status.component.html',
  styleUrls: ['./repo-status.component.scss']
})
export class RepoStatusComponent {
  public gitStatus = '';

  public gitDiff = '';

  constructor() {
    cp.exec(`cd matura-biologia && git status --porcelain`, (err, stdout, stderr) => {
      this.gitStatus = stdout;
    });

    cp.exec(`cd matura-biologia && git diff`, (err, stdout, stderr) => {
      this.gitDiff = stdout;
    });
   }
}
