// DECK
var Deck = function Deck(){
	// creating deck and filling it with cards
	this.cards = fillDeck();
	function fillDeck(){
		var values = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
		var suits = ["H","C","D","S"];
		var cards = [];
		for(var valIdx = 0; valIdx < values.length; valIdx++){
			for(var suitIdx = 0; suitIdx < suits.length; suitIdx++){
				cards.push({
					suit: suits[suitIdx],
					value: values[valIdx],
					img: suits[suitIdx]+values[valIdx]
				});
			}
		}
		return cards;
	}
}
// shuffle the deck
Deck.prototype.shuffle = function(){
	for(var idx = this.cards.length-1; idx > 0; idx --){
		var randIdx = Math.floor(Math.random()*(idx+1));
		var temp = this.cards[idx];
		this.cards[idx] = this.cards[randIdx];
		this.cards[randIdx] = temp;
	}
	return this.cards;
}
// reset deck to full, unshuffled
Deck.prototype.reset = function(){
	this.cards = fillDeck();
	return this.cards;
}
// take one card from the deck, returns card object
Deck.prototype.deal = function(){
	var randIdx = Math.floor(Math.random()* this.cards.length+1);
	var card = this.cards[randIdx];
	this.cards.splice(randIdx,1);
	return card;
}

// PLAYER
var Player = function Player(name){
	this.hand = [];
	this.wins = 0;
	this.pushes = 0;
	this.losses = 0;
}

// add card to player hand from deck
Player.prototype.takeCard = function(deck){
	var new_card = deck.deal();
	this.hand.push(new_card);
}

// take card out of player hand, identified by number in hand
Player.prototype.discard = function(cardNum){
	this.hand.splice(cardNum-1,1);
}

// get the total of the values in the player's hand
Player.prototype.total = function(){
	var total = 0;
	for(var i = 0; i < this.hand.length; i++){
		switch(this.hand[i].value){
			case("A"):
				total += 11;
				break; 
			case("K"):
				total += 10;
				break; 
			case("Q"):
				total += 10;
				break; 
			case("J"):
				total += 10;
				break; 
			default:
				total += parseInt(this.hand[i].value);
		}
	}
	return total;
}

// start a new game, pass the input from the form to the new player instance
var Game = function Game(player_name){
	// GAME SET UP
	this.start = function(){
		$(".dealer_cards,.player_cards").html("");
		$("#options").show();
		$("#message").html("");

		// set up the deck
		this.deck = new Deck();
		this.deck.shuffle();

		// set up dealer hand
		this.dealer = new Player("Dealer");
		this.dealer.takeCard(this.deck);
		this.dealer.takeCard(this.deck);

		// set up player hand
		this.player = new Player(player_name);
		$("#player_name").html(player_name);
		this.player.takeCard(this.deck);
		this.player.takeCard(this.deck);

		// display initial cards
		// IF dealer has blackjack
		if(this.dealer.total() == 21){
			$(".dealer_cards").append("<img src='cards/"+this.dealer.hand[0].img+".png'><img src='cards/"+this.dealer.hand[1].img+".png'>");
			console.log("dealer blackjack!");
			$("#message").html("You lost. (╯°□°）╯︵ ┻━┻");
			$("#options").hide();
		}
		// OTHERWISE
		else{
			// show dealer hand: one card face, one card back
			$(".dealer_cards").append("<img class='back_card' data-alt-src='cards/"+this.dealer.hand[0].img+".png' src='cards/back.png'>");
			$(".dealer_cards").append("<img src='cards/"+this.dealer.hand[1].img+".png'>");
			console.log(this.dealer.total())
		}

		// show player hand
		for(var i = 0; i < this.player.hand.length; i++){
			$(".player_cards").prepend("<img src='cards/"+this.player.hand[i].img+".png'>");
		}
		if(this.player.total() == 21){
			$("#message").html("You won!! ♪~ ᕕ(ᐛ)ᕗ");
			$("#options").hide();
		}
		console.log(this.player.total());
	}
	this.player_hit = function(){
		this.player.takeCard(this.deck);
		$(".player_cards").append("<img src='cards/"+this.player.hand[this.player.hand.length-1].img+".png'>")
		// if player busts
		if(this.player.total() > 21){
			$("#message").html("You lost. (╯°□°）╯︵ ┻━┻");
			$("#options").hide();
		}
		// or, hit 21
		else if(this.player.total() == 21){
			$("#message").html("You got 21! Better not hit...");
		}
		console.log(this.player.total());
	}
	this.dealer_hit = function(){
		this.dealer.takeCard(this.deck);
		$(".dealer_cards").append("<img src='cards/"+this.dealer.hand[this.dealer.hand.length-1].img+".png'>")
		this.end_game();
	}
	this.end_game = function(){
		console.log("trying to end game");
		var p_total = this.player.total();
		var d_total = this.dealer.total();
		// now check dealer cards
		if(d_total >= 17 && d_total <=21){
			if(p_total > d_total){
				$("#message").html("You won!! ♪~ ᕕ(ᐛ)ᕗ");
				$("#options").hide();
			}
			else if(p_total == d_total){
				$("#message").html("Push! ~(˘▾˘~)");
				$("#options").hide();
			}
			else{
				$("#message").html("You lost. (╯°□°）╯︵ ┻━┻");
				$("#options").hide();
			}
		}
		else if(d_total < 17){
			this.dealer_hit();
		}
		else{
			$("#message").html("You won!! ♪~ ᕕ(ᐛ)ᕗ");
			$("#options").hide();
		}
	}
}
// player - show two card faces
// allow player to hit or stay
// keep track of wins, pushes, losses
