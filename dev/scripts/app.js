import React from 'react';
import ReactDOM from 'react-dom';
import firebase from './firebase.js';

const dbRef = firebase.database().ref('/items');

class App extends React.Component {
		constructor () {
			super();
				this.state = {
					username: '',
					hasCar: 'no',
					spots: 0,
					leavingFrom: '',
					leavingAt: '',
					items:[],
					days: 0,
				};
				this.handleChange = this.handleChange.bind(this);
				this.handleSubmit = this.handleSubmit.bind(this);
				this.joinClick = this.joinClick.bind(this);
				this.removeItem = this.removeItem.bind(this);
				this.removePass = this.removePass.bind(this);
		};

		handleSubmit(event) {
			event.preventDefault();

			const items = Array.from(this.state.items);
			const newItem = {
				user: this.state.username,
				hasCar: this.state.hasCar,
				spots: parseInt(this.state.spots),
				leavingFrom: this.state.leavingFrom,
				leavingAt: this.state.leavingAt,
				passengers: [],
			};
			const availableRides = items.filter(function(rides){
				return rides.spots > 0 && rides.hasCar === "yes";
			});
			this.setState({
				availableRides: availableRides
			});
			dbRef.push(newItem);
		};

		handleChange(event) {
			this.setState({
				[event.target.name]: event.target.value,
			})
		};
		helpMe() {
			swal("Welcome to FriendTrip", "Tell us your name and whether you have a car. Add your car by pressing the Plus button. If you don't have a ride, enter your name and add yourself as a passenger by pressing the passenger button on the card.", "info")
		}
		joinClick(key) {
			const itemRef = firebase.database().ref(`/items/${key}/passengers`);
			itemRef.push(this.state.username)
			console.log("chicken", this.state.username);
		};

		removeItem(key) {
			const itemRef = firebase.database().ref(`/items/${key}`);
			itemRef.remove();
		}

		removePass(key, passenger) {
			const itemRef = firebase.database().ref(`/items/${key}/passengers/${passenger}`)
			itemRef.remove();
		}

		componentDidMount() {
			dbRef.on('value', (snapshot) => {
				const newItemsArray = [];
				const firebaseItems = snapshot.val();
				for (let key in firebaseItems) {
					const firebaseItem = firebaseItems[key];
					const passengers = [];
					for (let passenger in firebaseItems[key].passengers) {
						passengers.push({
							passengerName: firebaseItems[key].passengers[passenger],
							id: passenger,
						});
					}
					firebaseItem.id = key;
					firebaseItem.passengers = passengers;
					newItemsArray.push(firebaseItem);
					}
				this.setState({
					items: newItemsArray,
				});
			});
		}
		render() {
			const showPassengers = (car) => {
				if (car.passengers.length === car.spots) {
					return <p><span className="bold">no spots </span> left</p>
				} else if (car.passengers.length === 1) {
					return <p><span className="bold">1 spot </span> left</p>
				} else {
					return <p><span className="bold">{car.spots - car.passengers.length} spots </span> left</p>
				}
			};
			return (
					<div className="app">
						<header>
							<div className="wrapper">
								<div className="titleContainer">
										<h1>FriendTrip <img className="trip" src="dev/styles/assets/man-falling-off-a-precipice.png" alt="tripping"/></h1>
										<button className="button__help " onClick={() => this.helpMe()}><i className="fa fa-question-circle-o" aria-hidden="true"></i></button>
								</div>
							</div>
						</header>
						<section className="main">
							<div className="carInputContainer">
								<form className="initialForm animated fadeIn" onSubmit={this.handleSubmit}>
									<input type="text" name="username" onChange={this.handleChange} placeholder="Which friend are you?" value={this.state.username}/>
									<select id="hasCar" name="hasCar" onChange={this.handleChange}>
										<option value="select"defaultValue>Do you have a ride?</option>
										<option value="yes">Yes</option>
										<option value="no">No</option>
									</select>
								</form>
								{this.state.hasCar === "yes" ? 
								<form className="secondaryForm animated fadeIn" onSubmit={this.handleSubmit}>
									<select name="spots" onChange={this.handleChange}>
										<option value="0" defaultValue>How many folks can you give a ride to?</option>
										<option value="1">1</option>
										<option value="2">2</option>
										<option value="3">3</option>
										<option value="4">4</option>
										<option value="5">5</option>
										<option value="6">6</option>
										<option value="7">7</option>
									</select>
									<input type="text" name="leavingFrom"  onChange={this.handleChange} placeholder="Where are you leaving from?"/>
									<input type="date" name="leavingAt" onChange={this.handleChange} placeholder="What day are you leaving?"/>
									<div className="buttonContainer">
										<button className="addButton" title="Add Car"><i className="fa fa-plus" aria-hidden="true"></i></button>
									</div>
								</form>
								:
								<p></p> 
							}
							</div>
						</section>
						<section className="displayCars">
							<div className="wrapper">
								<ul className="cardsContainer">
								{this.state.items.map((item) => {
										return (
										<li className="card animated fadeInDown" key={item.id}>
											<div className="cardTitleContainer">
												<h3>{item.user}'s Car</h3>
												<button className="addButton addButton--Card" title="Add Passenger"disabled={item.passengers.length >= item.spots} onClick={() => this.joinClick(item.id)}><i className="fa fa-user" aria-hidden="true"></i></button> 	
											</div>
											
											<div className="cardBylineContainer">
											{showPassengers(item)}
												<p className="leaving">Leaving from <span className="bold">{item.leavingFrom}</span> <br></br> On <span className="bold">{item.leavingAt}</span></p>
											</div>
											<div className="passengerContainer">
												<p className="passengerTitle"> Passengers</p>
												<ul className="passengerNameContainer">
													{item.passengers.map(passenger => <li className="animated fadeIn" key={passenger.id}> {passenger.passengerName} <button className="removePass"onClick={() => this.removePass(item.id, passenger.id)}><i className="fa fa-times" title="Remove Passenger" aria-hidden="true"></i></button> </li>)}
												</ul>
											</div>
											<button className="removeCard"onClick={() => this.removeItem(item.id)}><i className="fa fa-times" title="Remove Card" aria-hidden="true"></i></button>
										</li>
										)
									})}
								</ul>
							</div>
						</section>
					</div>
				)
		}
}

ReactDOM.render(<App />, document.getElementById('app'));
