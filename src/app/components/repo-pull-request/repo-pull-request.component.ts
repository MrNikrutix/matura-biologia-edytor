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

  public get isUserGood() {
    return this.latestUserNameCheck == 'check';
  }

  public get isRepoGood() {
    return this.latestRepoExistsOnGithubCheck == 'check';
  }

  public openGithub() {
    this.open('https://github.com');
  }

  public openUserReposList() {
    this.open(`https://github.com/user/${this.username}`);
  }

  public checkIfRepoExistsOnGithub() {
    this.latestRepoExistsOnGithubCheck = '...';
    this.http.get(`https://github.com/${this.username}/matura-biologia`).subscribe((response) => {
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
