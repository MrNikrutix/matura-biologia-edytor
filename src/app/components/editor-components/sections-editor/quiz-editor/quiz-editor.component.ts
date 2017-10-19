import { Component, Input, Output, EventEmitter, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Quiz, Note } from '../data-types/note';

@Component({
  selector: 'app-quiz-editor',
  templateUrl: './quiz-editor.component.html',
  styleUrls: ['./quiz-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuizEditorComponent {
  @Output() public update = new EventEmitter<Note>();
  @Input() public note: Note;

  constructor(private cd: ChangeDetectorRef) { }

  public createNewQuizTasks() {
    this.note.quizTasks = [...(this.note.quizTasks || []), new Quiz(`Nowe pytanie quizu? ${new Date().getTime()}`)];
    this.cd.markForCheck();
  }

  public updateQuiz(index, quiz) {
    console.log('updating quiz...');
    
    this.note.quizTasks[index] = quiz;
    this.note.quizTasks = [...this.note.quizTasks];
    
    this.cd.markForCheck();

    this.update.emit(this.note);
  }
}
