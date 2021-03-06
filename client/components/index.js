/**
 * `components/index.js` exists simply as a 'central export' for our components.
 * This way, we can import all of our components from the same place, rather than
 * having to figure out which file they belong to!
 */
export {default as Navbar} from './navbar'
export {default as UserHome} from './user-home'
export {default as HomeStage} from './home-stage'
export {default as GameStage} from './game-stage'
export {default as Admin} from './Admin'
export {default as Multiplayer} from './multiplayer'
export {default as Loading} from './loading'
export {Login, Signup} from './auth-form'
