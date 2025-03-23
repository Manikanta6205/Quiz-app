const expressFramework = require('express');
const mongo = require('mongoose');
const corsMiddleware = require('cors');

const server = expressFramework();
server.use(expressFramework.json());
server.use(corsMiddleware());

mongo.connect('mongodb://localhost:27017/quizDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const quizSchema = new mongo.Schema({
    question: String,
    options: [String],
    correctAnswer: String,
});

const QuizItem = mongo.model('Question', quizSchema);

server.get('/api/quiz/random', async (request, response) => {
    const totalItems = await QuizItem.countDocuments();
    const randomPosition = Math.floor(Math.random() * totalItems);
    const chosenQuestion = await QuizItem.findOne().skip(randomPosition).select('-correctAnswer');
    response.json(chosenQuestion);
});

server.post('/api/quiz/check', async (request, response) => {
    const { questionId, userAnswer } = request.body;
    const quizQuestion = await QuizItem.findById(questionId);
    if (!quizQuestion) {
        return response.status(404).json({ message: 'Quiz question not found' });
    }
    const isAnswerCorrect = quizQuestion.correctAnswer === userAnswer;
    response.json({ success: isAnswerCorrect });
});

const APP_PORT = process.env.PORT || 5000;
server.listen(APP_PORT, () => {
    console.log(`Quiz application running on port ${APP_PORT}`);
});