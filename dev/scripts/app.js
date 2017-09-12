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
			// console.log(key, passenger)
			itemRef.remove();
			// passengers.splice(1)
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
					// console.log(passengers)
					// console.log(passenger)
					}
				this.setState({
					items: newItemsArray,
				});
			});
		}
		render() {
			const showPassengers = (car) => {
				if (car.passengers.length === car.spots) {
					return <p>There are no spots left in this car</p>
				} else {
					return <p>There are {car.spots - car.passengers.length} spots left in the car</p>
				}
			};
			return (
					<div className="app">
						<header>
							<div className="wrapper">
								<h1>Friend🦐</h1>
							</div>
						</header>
						<section className="main">
							<div className="carInputContainer">
								<form className="initialForm" onSubmit={this.handleSubmit}>
									{/*<label  htmlFor="username">Which friend are you?</label>*/}
									<input type="text" name="username" onChange={this.handleChange} placeholder="Which friend are you?" value={this.state.username}/>
									{/*<label htmlFor="hasCar">Do you have a Ride?</label>*/}
									<select id="hasCar" name="hasCar" onChange={this.handleChange}>
										<option value="select"defaultValue>Do you have a ride?</option>
										<option value="yes">Yes</option>
										<option value="no">No</option>
									</select>
								</form>
								{this.state.hasCar === "yes" ? 
								<form className="secondaryForm" onSubmit={this.handleSubmit}>
									{/*<label htmlFor="spots">How many people can you give a lift to?</label>*/}
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
									<button>Add Car</button>
								</form>
								:
								<p></p> 
							}
							</div>
						</section>
						<section className="displayCars">
							<div className="wrapper">
								<ul>
								{this.state.items.map((item) => {
										return (
										<li className="card" key={item.id}>
											<h3>{item.user}'s car</h3>
											{showPassengers(item)}
											<p className="leaving">This car is leaving from {item.leavingFrom} on {item.leavingAt}</p>
											<p className="passengerTitle"> Passengers</p>
											<ul>
												{item.passengers.map(passenger => <li key={passenger.id}> <i className="fa fa-user" aria-hidden="true"></i> {passenger.passengerName} <button className="removePass"onClick={() => this.removePass(item.id, passenger.id)}><i className="fa fa-times" aria-hidden="true"></i></button> </li>)}
											</ul>
											<button className="removeCard"onClick={() => this.removeItem(item.id)}><i className="fa fa-times" aria-hidden="true"></i></button>
											<button disabled={item.passengers.length >= item.spots} onClick={() => this.joinClick(item.id)}>Join Ride!</button>
										</li>
										)
									 {/*else if (item.hasCar === "yes" && item.spots == 0) {
										return (
										<li className="card" key={item.id}>
											<h3>{item.user}'s car</h3>
											<p className="spots">There are no spots left in this car</p>
											<p className="leaving">This car is leaving from {item.leavingFrom} on {item.leavingAt}</p>
											<button onClick={() => this.removeItem(item.id)}>Remove Item</button>
											{/*<button onClick={this.joinClick}>Join please!</button>
										</li>
										)
									} */}
							})}
								</ul>
							</div>
						</section>
					</div>
				)
		}
}

ReactDOM.render(<App />, document.getElementById('app'));


// --------------PSEUDO CODE YAY ------------------- //

								// USER STORY //
// MVP --
// user is greeted by a form which includes
	// name, car? (y/n), spots? (1-7), leaving from, Leaving at (day/time?)
// user is then printed to a card on the right, either as driver or passenger.
// based on length of trip, meals are allocated to each car
// 

// STRETCH --
// basics list is generated by default and items assigned to cars
// User can add or remove items from basics list

// Activity cards are available to be generated by form which includes activity ,and things needed.


// handleSubmit:

// If hasCar = no:
	// find fist car with spots that is leaving some same place/same day
		// if car spots > 0, push into that car

// Grab everyone with a car (.filter?)
// if hasCar = yes then push that 