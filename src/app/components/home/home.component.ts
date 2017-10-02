import { Component } from '@angular/core';
import { Observable } from 'rxjs/observable';
import 'rxjs';

const cp = require('child_process'); 

class Task {
  constructor(
    public action,
    public desc: string, 
    public errorResolution: string = '',
    public status: string = '') {}
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  public tasks = [
    new Task(this.gitCheck, 'Sprawdzam dostępność wymaganych narzędzi (git)', `Zainstaluj klienta git: https://git-scm.com/book/id/v2/Getting-Started-Installing-Git`),
  ];

  constructor() {
    this.tasks.forEach((task) => {
      task.action(task);
    });
  }

  public get allTasksDoneSuccessfully() {
    return this.tasks.reduce((acc, val) => acc + +(val.status === 'check'), 0) == this.tasks.length;
  }

  public get failedTasks() {
    return this.tasks.filter((task) => task.status === 'error');
  }

  public colorBasedOn(taskStatus) {
    return taskStatus == 'error' ? '#e60000' : '#00cc44';
  }

  private gitCheck(task: Task) {
    cp.exec('git', function(error, stdout, stderr) {
      setTimeout(() => {
        task.status = stdout ? 'check' : 'error';
      }, 1000);
    });
  }
}
