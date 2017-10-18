import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Quiz, Note } from '../data-types/note';

@Component({
  selector: 'app-quiz-editor',
  templateUrl: './quiz-editor.component.html',
  styleUrls: ['./quiz-editor.component.scss']
})
export class QuizEditorComponent {
  @Output() public update = new EventEmitter<Note>();
  @Input() public note: Note;

  constructor() { }

  public createNewQuizTasks() {
    this.note.quizTasks = [...(this.note.quizTasks || []), new Quiz(`Nowe pytanie quizu? ${new Date().getTime()}`)];
  }

  public updateQuiz(index, quiz) {
    console.log('updating quiz...');
    this.note.quizTasks[index] = quiz;
    this.update.emit(this.note);
  }
}
