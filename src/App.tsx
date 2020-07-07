import './App.scss'

import React from 'react'

import Altflow from './Altflow'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import ConnectPage from './lib/pages/ConnectPage'

const App = () => {
	return (
		<Router>
			<Switch>
				<Route path="/login">
					<ConnectPage />
				</Route>
				<Route path="/">
					<Altflow />
				</Route>
			</Switch>
		</Router>
	)
}

export default App
