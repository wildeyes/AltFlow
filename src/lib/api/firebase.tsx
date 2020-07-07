import React from 'react'
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth'
// import './firebaseui-styling.global.css' // Import globally. Not with CSS modules.

const firebaseConfig = {
	apiKey: 'AIzaSyCvGX-T2SOiCbdWcIUBww_iDpa0h210VPM',
	authDomain: 'altflow.firebaseapp.com',
	databaseURL: 'https://altflow.firebaseio.com',
	projectId: 'altflow',
	storageBucket: 'altflow.appspot.com',
	messagingSenderId: '695460848093',
	appId: '1:695460848093:web:6d4084bb499ec3a536d634',
	measurementId: 'G-C59EBZKJZT',
}

firebase.initializeApp(firebaseConfig)

// Configure FirebaseUI.
const uiConfig = {
	// Popup signin flow rather than redirect flow.
	signInFlow: 'popup',
	// Redirect to /signedIn after sign in is successful. Alternatively you can provide a callbacks.signInSuccess function.
	signInSuccessUrl: '/app',
	// We will display Google and Facebook as auth providers.
	signInOptions: [firebase.auth.GoogleAuthProvider.PROVIDER_ID],
}

export const ConnectButton = () => {
	return (
		<StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
	)
}
