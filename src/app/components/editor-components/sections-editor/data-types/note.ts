export class Quiz {
  constructor(
    public question: string,
    public explanation: string = '',
    public image: string = '',
    public rightAnswers: string[] = [],
    public possibleAnswers: string[] = []
  ) {}
}

export class Note {
  constructor(
    public title: string,
    public subtitle: string,
    public background: string,
    public content: string,
    public quizTasks: Quiz[] = []
  ) {}
}