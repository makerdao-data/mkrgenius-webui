import { useState, useEffect } from 'react'
import logo from './logo.svg'
import './App.css'
import { zip } from 'ramda'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import IconSend from './components/icons/IconSend'


function App() {
  const [input, setInput] = useState('')
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState([])

  const [isLoading, setIsLoading] = useState(false)
  const [isFirstRequest, setIsFirstRequest] = useState(true)

  const generateResponse = (question, _questions, _answers) => {
    if (isLoading) { return }
    if (_questions) {
      setQuestions(_questions)
    }
    if (_answers) {
      setAnswers(_answers)
    }
    if (_questions === undefined) { _questions = questions }
    if (_answers === undefined) { _answers = answers }
    setIsFirstRequest(() => false)
    setIsLoading(() => true)
    setQuestions(() => [..._questions, question])
    fetch(`https://brain.makerdao.fyi/ask?query=${
      encodeURIComponent(question.substring(0, 4000))
    }&history=${
      _answers.length === 0
        ? 'none'
        : encodeURIComponent(zip(_questions, _answers)
          .map(([q, a]) => `Anon:\n${q}\nYou:\n${a}`).join('\n\n'))
          .substring(0, 4000)
    }`)
    .then((response) => response.json() )
    .then((data) => {
      setAnswers(() => [..._answers, data])
      setIsLoading(() => false)
    })
		.catch((data) => {
      setAnswers(() => [..._answers, 'mkrGenius did not respond. Try regenerate response in a minute.'])
      setIsLoading(() => false)
    });
    setInput(() => '')
  }

  const scrollToBottom = () => {
    const div = document.querySelector(".scrollable");
    div.scrollTop = div.scrollHeight - div.clientHeight;
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [questions, answers]);

  return (
    <div className='App'>
      <header>
        <div>
          <a target="_blank" href="https://makerdao.fyi/" rel="noreferrer">makerdao.fyi</a>
        </div>
        <div>
          <a target="_blank" href="https://maker-data.canny.io/bugs" rel="noreferrer">feedback & bugs</a>
        </div>
      </header>
      
      <main>
        <div>
          <img src={logo} alt='Logo' />
          <h1>mkrGenius</h1>
          <h2>Get to know about Maker without having to talk to a dev</h2>
          <h4 style={{color:'#C44900'}}>Beta version: Expect bad/random responses. Please give us feecback on the top right corner.</h4>
          <div className='scrollable'>
            {!isFirstRequest && <div>
              {questions.map((question, index) => {
                return (
                  <div className='questions-answers' key={question}>
                    <p style={{color:'#7E7E7E'}}><b>Anon</b></p>
                    <p>{question}</p>
                    <p style={{color:'#1AAB9B', marginTop: 30}}><b>mkrGenius</b></p>
                    {answers[index] ? <div>
                      <pre style={{marginBottom: 30}} >
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{answers[index]}</ReactMarkdown>
                      </pre>
                    </div> : <div >
                      <p className='loading-dots'><span>.</span><span>.</span><span>.</span></p>
                    </div>}
                  </div>
                )
              })}
              <br />
              <br />
              <br />
              <br />
              <br />
            </div>}
          </div>
          <div className='white-fade'></div>
        </div>
      </main>
      
      <footer>
        <div className='buttons'>
          <button onClick={() => {
            if (isLoading || answers.length === 0 ) { return }
            const lastQuestion = questions[questions.length - 1]
            let _questions
            let _answers

            if (questions.length === 1) {
              _questions = []
              _answers = []
            } else {
              _questions = questions.slice(0, -1)
              _answers = answers.slice(0, -1)
            }

            generateResponse(lastQuestion, _questions, _answers)

          }}>
            Regenerate Response
          </button>
          <button style={{marginLeft: 20}} onClick={() => {
            if (isLoading || answers.length === 0 ) { return }
            setAnswers([])
            setQuestions([])
            setIsFirstRequest(() => true)
          }}>
            Clear All
          </button>
        </div>
        <div className='input-wrapper'>
          <input type="text" placeholder="Ask here" value={input} autoFocus
            onFocus={(e) => e.target.placeholder = ""}
            onBlur={(e) => e.target.placeholder = "Ask here"}
            onChange={e => { setInput(() => e.target.value.substring(0, 4000))}}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                generateResponse(input)
              }
            }}
          />
          <IconSend className='send' onClick={() => generateResponse(input)} />
        </div>
        <span>
        <a target="_blank" href="https://ygenius.yearn.farm/" rel="noreferrer">Fork of yGenius</a>, a GPT-powered chatbot that can search Maker documentation.
        </span>
      </footer>
    </div>
  )
}

export default App
