// INITIALIZATION
// on page load and game start
$(document).ready(function(){
	// hide hit/stay buttons
	$("#options").hide();
	$("#play-again").hide();

	// start new game on 'enter' in name field or start button click
	$("#player_name_entry").keypress(function(e){
		if(e.which === 13){ $("#new_game").click(); }
	});
	$("#new_game").click(function(){
		var name = $("#player_name_entry").val();
		currentGame = new Game(name);
		currentGame.start();
	});
	
	// player hits
	$("#hit").click(function(){ currentGame.player_hit(); });

	// player stays, trigger hand end
	$("#stay").click(function(){
		$(".back_card").attr('src', $(".back_card").data('alt-src'));
		currentGame.end_game();
	});
});

$(document).on("click", "#play-again", function(){
	currentGame.new_hand();
})

// DECK
var Deck = function(){
	// creating deck and filling it with cards
	this.cards = fillDeck();

	function fillDeck(){
		var values = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
		var suits = ["H","C","D","S"];
		var cards = [];
		// generating each card ...
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
};
// reset deck to full, unshuffled
Deck.prototype.reset = function(){
	this.cards = fillDeck();
	return this.cards;
};
// take one card from the deck, returns card object
Deck.prototype.deal = function(){
	var randIdx = Math.floor(Math.random()* this.cards.length+1);
	var card = this.cards[randIdx];
	this.cards.splice(randIdx,1);
	return card;
};

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
				// aces worth one or eleven - NOT WORKING YET :(
				if(total <= 10){
					total += 11;
				}
				else{
					total += 1;
				}
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

Player.prototype.lost = function(){
	this.losses++;
	$("#message").html("You lost. (╯°□°）╯︵ ┻━┻");
	$("#options").hide();
	$("#play-again").show();
}

Player.prototype.won = function(){
	this.wins++;
	$("#message").html("You won!! ♪~ ᕕ(ᐛ)ᕗ");
	$("#options").hide();
	$("#play-again").show();
}

Player.prototype.pushed = function(){
	this.pushes++;
	$("#message").html("Push! ~(˘▾˘~)");
	$("#options").hide();
	$("#play-again").show();
}

Player.prototype.autoWin = function(){
	this.wins++;
	$("#message").html("21! You won!! ♪~ ᕕ(ᐛ)ᕗ");
	$("#options").hide();
	$("#play-again").show();
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
		this.dealer = new Player("Dealer");
		this.player = new Player(player_name);
		$("#player_name").html(player_name);
		this.deal_hand();
	}

	this.deal_hand = function(){
		// set up dealer hand
		this.dealer.takeCard(this.deck);
		this.dealer.takeCard(this.deck);

		// set up player hand
		this.updateScores();
		this.player.takeCard(this.deck);
		this.player.takeCard(this.deck);

		// display initial cards
		// IF dealer has blackjack
		if(this.dealer.total() == 21){
			$(".dealer_cards").append("<img src='cards/"+this.dealer.hand[0].img+".png'><img src='cards/"+this.dealer.hand[1].img+".png'>");
			console.log("dealer blackjack!");
			this.player.lost();
			this.updateScores();
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
			this.player.autoWin();
			this.updateScores();
		}
		console.log(this.player.total());
	}

	this.player_hit = function(){
		this.player.takeCard(this.deck);
		$(".player_cards").append("<img src='cards/"+this.player.hand[this.player.hand.length-1].img+".png'>")
		// if player busts
		if(this.player.total() > 21){
			this.player.lost();
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
				this.player.won();
			}
			else if(p_total == d_total){
				this.player.pushed();
			}
			else{
				this.player.lost();
			}
		}
		else if(d_total < 17){
			this.dealer_hit();
		}
		else{
			this.player.won();
		}
		this.updateScores();
	}
	this.updateScores = function(){
		$("#scores").html(
			"Wins: " + this.player.wins + 
			" - Pushes: " + this.player.pushes + 
			" - Losses: " + this.player.losses
		);
	}
	this.new_hand = function(){
		$(".dealer_cards").html("");
		$(".player_cards").html("");
		$("#options").show();
		// $("#scores").hide();
		$("#message").hide();
		$("#play-again").hide();
		this.dealer.hand = [];
		this.player.hand = [];
		if(this.deck.length < 15){
			this.deck = new Deck();
			this.deck.shuffle();
		}
		this.deal_hand();
	}
}