import { Component } from '@angular/core';
import * as cp from 'child_process';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-repo-pull-request',
  templateUrl: './repo-pull-request.component.html',
  styleUrls: ['./repo-pull-request.component.scss']
})
export class RepoPullRequestComponent {
  public username = '';
  public latestUserNameCheck = '';

  public latestRepoExistsOnGithubCheck = '';

  constructor(private http: Http) { }

  public get repoUrl() {
    return `https://github.com/${this.username}/matura-biologia`;
  }

  public get isUserGood() {
    return this.latestUserNameCheck == 'check';
  }

  public get isRepoGood() {
    return this.latestRepoExistsOnGithubCheck == 'check';
  }

  public pushChangesToRemoteRepo() {
    cp.exec(`start CMD /c "cd matura-biologia & git remote add origin ${this.repoUrl} & git add . & git commit -m "my contribution..."  & git push origin master & pause"`);
  }

  public openGithub() {
    this.open('https://github.com');
  }

  public openUserReposList() {
    this.open(`https://github.com/user/${this.username}`);
  }

  public checkIfRepoExistsOnGithub() {
    this.latestRepoExistsOnGithubCheck = '...';
    this.http.get(this.repoUrl).subscribe((response) => {
      this.latestRepoExistsOnGithubCheck = 'check';
    }, (error) => {
      this.latestRepoExistsOnGithubCheck = 'error';
    });
  }

  public checkUserName() {
    this.latestUserNameCheck = '...';
    this.http.get(`https://github.com/${this.username}`).subscribe((response) => {
      this.latestUserNameCheck = 'check';
    }, (error) => {
      this.latestUserNameCheck = 'error';
    });
  }

  public colorBasedOn(taskStatus) {
    if(taskStatus == '...') return 'gray';
    return taskStatus == 'error' ? '#e60000' : '#00cc44';
  }

  private open(link) {
    cp.exec(`start ${link}`);
  }
}
