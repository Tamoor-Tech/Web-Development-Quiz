const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./data/questions.json', 'utf8'));

data.chapters = data.chapters.map(ch => {
  const chapterSubject = ch.title.split(':')[1].trim();
  return {
    ...ch,
    mcqs: [
      {
        question: `Which of the following is true about ${chapterSubject}?`,
        options: ['It is outdated', 'It is a core part of web development', 'It is only used for mobile apps', 'It requires no learning'],
        answer: 1
      },
      {
        question: `What is the primary role of ${chapterSubject}?`,
        options: ['Database management', 'Styling elements', 'Depends on the specific technology context', 'It is an operating system'],
        answer: 2
      },
      {
        question: `Which tool is most commonly associated with ${chapterSubject}?`,
        options: ['A code editor', 'A hammer', 'A microwave', 'A car engine'],
        answer: 0
      },
      {
        question: `How do beginners typically start learning ${chapterSubject}?`,
        options: ['By reading documentation and writing code', 'By swimming', 'By sleeping', 'By ignoring it'],
        answer: 0
      },
      {
        question: `Why is ${chapterSubject} important?`,
        options: ['It builds modern applications', 'It is a tasty food', 'It solves math problems only', 'It repairs hardware'],
        answer: 0
      }
    ]
  };
});

fs.writeFileSync('./data/questions.json', JSON.stringify(data, null, 2));
fs.writeFileSync('./public/questions.js', 'const quizData = ' + JSON.stringify(data, null, 2) + ';');
console.log("Chapters updated with MCQs successfully!");
