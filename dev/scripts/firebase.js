import firebase from 'firebase'

// Initialize Firebase
	var config = {
		apiKey: "AIzaSyDLBSWhR0ew_YM5z_gsrkbesjA25Rj-ihY",
		authDomain: "friendshrimp-a4c11.firebaseapp.com",
		databaseURL: "https://friendshrimp-a4c11.firebaseio.com",
		projectId: "friendshrimp-a4c11",
		storageBucket: "friendshrimp-a4c11.appspot.com",
		messagingSenderId: "511113266327"
	};
	firebase.initializeApp(config);

	export default firebase;