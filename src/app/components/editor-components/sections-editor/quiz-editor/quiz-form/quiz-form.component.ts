import { Component, Input, NgZone, ViewChild, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { Quiz } from '../../data-types/note';
import { FileHelper } from '../../helpers/file-helper';

@Component({
  selector: 'app-quiz-form',
  templateUrl: './quiz-form.component.html',
  styleUrls: ['./quiz-form.component.scss']
})
export class QuizFormComponent implements AfterViewInit {
  @Output() public update = new EventEmitter<Quiz>();

  @Input() public set quiz(quiz: Quiz) {
    if(quiz) {
      this.originalQuiz = quiz;
      this.tempQuiz = new Quiz(quiz.question, quiz.explanation, quiz.image, quiz.rightAnswers, quiz.possibleAnswers);

      this.possibleAnswersFlags = this.tempQuiz.possibleAnswers.map((el) => this.tempQuiz.rightAnswers.indexOf(el) >= 0);

      this.possibleAnswers = this.tempQuiz.possibleAnswers.map((el) => new String(el));

      this.tempImage = quiz.image;
    }
  }

  @ViewChild('image') image;

  public originalQuiz: Quiz;
  public tempQuiz: Quiz;
  public possibleAnswers: String[] = [];
  public possibleAnswersFlags: Boolean[] = [];
  public tempImage = '';
  
  constructor(private zone: NgZone) { }

  public ngAfterViewInit() {
    this.image.nativeElement.src = window['repo-location'] + this.tempImage;
  }

  public onFileSelect(event: any) {
    FileHelper.onFileSelect(event, (data) => {
      this.zone.run(() => {
        this.tempImage = data;
        this.image.nativeElement.src = data;
      })
    });
  }
  
  public addPossibleAnswer() {
    this.possibleAnswers = [...(this.possibleAnswers || []), new String(`nowa możliwa odpowiedź (${new Date().getTime()})`)];
    this.possibleAnswersFlags = [...this.possibleAnswersFlags, false];
  }

  public async saveQuiz() {
    if (this.tempImage !== this.originalQuiz.image) {
      const ext = this.tempImage.split(';')[0].slice('data:image\\'.length);
      const dest = `/data/biology/notes/quiz/images/`;
      const filename = this.tempQuiz.question.replace(/\W/g, '');
      const backgroundUrl = `${dest}${filename}.${ext}`;
      
      this.tempQuiz.image = backgroundUrl;

      if(this.originalQuiz.image) {
        console.log('TEST: ' + 'matura-biologia/' + this.originalQuiz.image);
        await FileHelper.deleteFilePromise('matura-biologia' + this.originalQuiz.image);
        console.log('deleted old background');
      }

      await FileHelper.saveBase64ToImagePromise(this.tempImage, 'matura-biologia' + dest, filename);
    }

    this.tempQuiz.possibleAnswers = this.possibleAnswers.map((el) => el.toString());
    
    this.possibleAnswersFlags.forEach((val, index) => {
      if(val) {
        this.tempQuiz.rightAnswers = [...(this.tempQuiz.rightAnswers || []), this.possibleAnswers[index].toString()];
      }
    });

    console.log('sending quiz...');
    this.update.emit(this.tempQuiz);
  }

  trackByIndex(index: number, obj: any): any {
    return index;
  }
}
