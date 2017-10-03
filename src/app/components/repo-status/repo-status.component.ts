import { Component} from '@angular/core';

import * as cp from 'child_process';

@Component({
  selector: 'app-repo-status',
  templateUrl: './repo-status.component.html',
  styleUrls: ['./repo-status.component.scss']
})
export class RepoStatusComponent {
  public gitStatusResult = '';

  public gitDiffResult = '';

  public gitFetchUpstreamResult = '';

  public gitRebaseUpstreamMasterResult = '';

  constructor() {
    this.gitStatus();
    this.gitDiff();
   }

   public gitStatus() {
    cp.exec(`cd matura-biologia && git status --porcelain`, (err, stdout, stderr) => {
      this.gitStatusResult = (stdout + stderr) || 'Ok.';
    });
   }

   public gitDiff() {
    cp.exec(`cd matura-biologia && git diff`, (err, stdout, stderr) => {
      this.gitDiffResult = (stdout + stderr) || 'Ok.';
    });
   }

   public gitFetchUpstream() {
    cp.exec(`cd matura-biologia && git fetch upstream`, (err, stdout, stderr) => {
      console.log([err, stdout, stderr]);
      this.gitStatus();
      this.gitDiff();
      this.gitFetchUpstreamResult = (stdout + stderr) || 'Ok.';
    });
   }

   public gitRebaseUpstreamMaster() {
    cp.exec(`cd matura-biologia && git rebase upstream/master`, (err, stdout, stderr) => {
      console.log([err, stdout, stderr]);
      this.gitStatus();
      this.gitDiff();
      this.gitRebaseUpstreamMasterResult = (stdout + stderr) || 'Ok.';
    });
   }
}
