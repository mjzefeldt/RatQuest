import React, {Fragment, Component} from 'react'
import socket from '../socket'
import Axios from 'axios'
import {connect} from 'react-redux'
import loadFunction from '../utils/loadFunction'
import createAndTest from '../utils/createAndTest'
import AceEditor from 'react-ace'
import 'brace/mode/javascript'
import 'brace/theme/monokai'
import DoneIcon from '@material-ui/icons/Done'
import Fab from '@material-ui/core/Fab'
import Tooltip from '@material-ui/core/Tooltip'
import ClearIcon from '@material-ui/icons/RefreshSharp'
import HomeIcon from '@material-ui/icons/HomeSharp'
import ThemeIcon from '@material-ui/icons/ColorLensSharp'
import SkipIcon from '@material-ui/icons/FastForwardSharp'
import {Button} from '@material-ui/core'

// socket.on('connect', function() {
//   console.log('from multiplayer socket connect')
// })

class Multiplayer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      victor: null,
      lobby: {},
      preGame: true,
      problems: [],
      sandbox: {
        result: '',
        editor: '',
        open: false,
        stageComplete: false,
        theme: 'dracula',
        readOnly: true,
        showThemes: false
      }
    }
    this.handleIncrement = this.handleIncrement.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.handleChange = this.handleChange.bind(this)

    socket.on('A user has disconnected', () => {
      console.log('received disconnect broadcast')
    })

    // This socket receives other users' score increment
    socket.on('received increment', user => {
      this.setState({
        ...this.state,
        lobby: {...this.state.lobby, [user.email]: user}
      })
    })

    // This socket receives other users' data when they join the lobby
    socket.on('Another user has joined the lobby', data => {
      if (props.user.score === undefined) props.user.score = 0

      // This socket, upon receiving the message that another user has joined, sends its own user's information over to the new user to populate their game state with my info
      socket.emit('Send my data to new user', props.user, data.email)
      this.setState({
        lobby: {...this.state.lobby, [data.email]: data}
      })
    })

    // This socket receives other users' information upon joining the lobby
    socket.on(`Received another user's Data: ${props.user.email}`, data => {
      this.setState({
        lobby: {...this.state.lobby, [data.email]: data}
      })
    })

    socket.on('A user has won', userEmail => {
      // socket.emit('Unplug me')
      this.setState({lobby: {}, victor: userEmail})
    })
  }
  handleIncrement() {
    let me = this.props.user
    let problems = this.state.problems
    this.props.user.score += 1
    if (this.props.user.score >= 2) {
      socket.emit('I win', me.email)
      this.setState({lobby: {}, victor: me.email})
    } else {
      // This socket sends your score increment to other users
      socket.emit('increment', me)
      this.setState({
        ...this.state,
        lobby: {...this.state.lobby, [me.email]: me},
        sandbox: {
          ...this.state.sandbox,
          editor: loadFunction(
            problems[me.score].funcName,
            problems[me.score].arguments
          )
        }
      })
    }
  }
  async handleClick() {
    let score = this.props.user.score
    // Grab user input from the code editor stored in state.
    let body = this.state.sandbox.editor
    console.log('TCL: handleClick -> body', body)
    let currentProblem = this.state.problems[score]
    let result = await createAndTest(
      currentProblem.arguments,
      body,
      currentProblem.inputs,
      currentProblem.outputs
    )
    // console.log('result from handleclick', result)
    if (result === 'success') {
      this.handleIncrement()
    }
  }
  handleChange(e) {
    console.log(this)
    this.setState({sandbox: {...this.state.sandbox, editor: e}})
  }
  async componentDidMount() {
    let {data: problems} = await Axios.get('/api/problems')
    const {user} = this.props
    user.score = 0
    socket.emit('I have joined the lobby', user)
    this.setState({
      ...this.state,
      loading: false,
      sandbox: {
        ...this.state.sandbox,
        editor: loadFunction(
          problems[user.score].funcName,
          problems[user.score].arguments
        )
      },
      problems,
      lobby: {...this.state.lobby, [user.email]: user}
    })
  }

  render() {
    console.log('TCL: render -> this.state', this.state)
    return !this.state.victor ? (
      <Fragment>
        <h1>I am {this.props.user.email}</h1>
        <button onClick={this.handleIncrement}>+1</button>

        <br />
        <h1>Lobby: </h1>
        {Object.keys(this.state.lobby)
          ? Object.keys(this.state.lobby).map(key => {
              return (
                <h2 key={key}>
                  {this.state.lobby[key].email}:{this.state.lobby[key].score}
                </h2>
              )
            })
          : null}

        <AceEditor
          mode="javascript"
          theme={this.state.sandbox.theme}
          value={this.state.sandbox.editor}
          // onPaste={this.handlePaste}
          onChange={this.handleChange}
          name="ace"
          // className="editorBox"
          height="60vh"
          width="50vw"
          editorProps={{$blockScrolling: Infinity}}
          fontSize={14}
          // onSelectionChange={this.handleSelectionChange}
          // onCursorChange={this.handleCursorChange}
          showPrintMargin={false}
          wrapEnabled={true}
          // readOnly={this.state.sandbox.readOnly}
        />
        <Tooltip title="Submit">
          <Button
            type="Button"
            style={{
              backgroundColor: 'blue',
              color: 'black',
              fontWeight: 550
            }}
            onClick={this.handleClick}
          >
            Submit
            <DoneIcon />
          </Button>
        </Tooltip>
      </Fragment>
    ) : (
      <Fragment>
        <h1>{this.state.victor} has won!</h1>

        <button onClick={() => this.props.history.push('/home')}>Home</button>
      </Fragment>
    )
  }
}
const mapState = state => {
  return {
    user: state.user
  }
}

export default connect(mapState)(Multiplayer)