//shuffle to get new deck
var deck = shuffle(newDeck());
//arrays to deal hands to
var dealerHand = [];
var playerHand = [];

//function to reset game
function resetGame() {
  //reset deck
  deck = shuffle(newDeck());
  //reset hands
  dealerHand = [];
  playerHand = [];
  //reset points
  $("#player-points").text("");
  $("#dealer-points").text("");
  $("#messages").text("");
  //reset board to empty
  $("#player-hand").html("");
  $("#dealer-hand").html("");
}

//function to deal cards
function dealCard(deck, hand, element, holeCard) {
  //take a card out of the deck - remove the last card from the deck array
  var card = deck.pop();
  //once you have the card, push it to hand
  hand.push(card);
  //take card & put visual representation on board
  var cardName = getCardName(card);
  var cardHTML;
  if (holeCard) {
    cardHTML = '<img class="card hole" src="images/back_card.jpg" alt="' + cardName + ' of ' + card.suit + '">';
  } else {
    var imageUrl = getCardImageUrl(card);
    cardHTML = '<img class="card animated slideInLeft " src="' + imageUrl + '" alt="' + cardName + ' of ' + card.suit + '">';
  }
  $(element)
  .append(cardHTML);
}

//function to create a deck
function newDeck() {
  var deck = [];
  var suits = ['spades', 'hearts', 'clubs', 'diamonds'];
  for (var point = 1; point <= 13; point++) {
    for (var i = 0; i < suits.length; i++) {
      var suit = suits[i];
      deck.push({point: point, suit: suit});
    }
  }
  return deck;
}

//function to shuffle cards
function shuffle(cards) {
  var newCards = [];
  while (cards.length > 0) {
    //get random card
    var idx = Math.floor(Math.random() * cards.length);
    //push new cards into array
    newCards.push(cards[idx]);
    //remove from deck
    cards.splice(idx, 1);
  }
  return newCards;
}

//function to get the sum of points - takes a hand (array of cards) and returns the point value of that hand
function calculatePoints(hand) {
  //make copy of array so you don't mess it up
  hand = hand.slice(0);
  //sort cards so that aces go to end and get calculated last
  hand.sort(function (card1, card2) {
    //if card2's point is greater than card1's point it will return a positive, if they are equal it will return zero, if it is less than it will return negative
    return card2.point - card1.point;
  });
  //return the number of points in a hand
  var points = 0;
  //loop through cards to get sum
  for (var i = 0; i < hand.length; i++) {
    var card = hand[i];
    //if you get an ace
    if (card.point === 1) {
      //if the sum + 11 is less than 21, use it as an 11
      if (points + 11 <= 21) {
        points = points + 11
        //otherwise make it a 1
      } else {
        points = points + 1;
      }
    } else if (card.point >= 10) {
      points = points + 10;
    } else {
      points = points + card.point;
    }
  }
  return points;
}

//function to display the points - calculate the points using calculatePoints function for both the dealer and the player - it will update the display with those points #dealer-points & #player-points
function displayPoints() {
  var dealerPoints = calculatePoints(dealerHand);
  //update elements with text method
  //$("#dealer-points").text(dealerPoints);
  var playerPoints = calculatePoints(playerHand);
  //update elements with text method
  $("#player-points").text(playerPoints);
}

//function to check for busts - calculate points and see if it is above 21 - return true if there is a bust, false if no
function checkForBusts() {
  //first check for player bust
  var playerPoints = calculatePoints(playerHand);
  //if above 21
  if (playerPoints > 21) {
    //update messages to say bust
    $("#messages").text("you busted. better luck next time");
    $(".card.hole").attr("src", getCardImageUrl(dealerHand[0]));
    var dealerPoints = calculatePoints(dealerHand);
    $("#dealer-points").text(dealerPoints);
    return true;
  }
  //then check for dealer bust
  var dealerPoints = calculatePoints(dealerHand);
  //if above 21
  if (dealerPoints > 21) {
    //update messages to say bust
    $("#messages").text("dealer busted. you win!");
    return true;
  }
  return false;
}

//function to get card name
function getCardName(card) {
  //if card point = 1 -> ace, 1-10 -> number value, 11 jack, 12 queen, 13 king
  if (card.point === 1) {
    return "ace";
  } else if (card.point <= 10) {
    return card.point;
  } else if (card.point === 11) {
    return "jack";
  } else if (card.point === 12) {
    return "queen";
  } else if (card.point === 13) {
    return "king";
  }
}

//function to display card images - takes card object as first argument and will return a string containing the correct image URL for that card
function getCardImageUrl(card) {
  return "images/" + getCardName(card) + "_of_" + card.suit + ".png";
}

$(function () {
  //when deal button is clicked
  $("#deal-button").click(function () {
    //reset to start game
    resetGame();
    var card;
    //call dealCard function to deal cards
    dealCard(deck, playerHand, "#player-hand");
    dealCard(deck, dealerHand, "#dealer-hand", true);
    dealCard(deck, playerHand, "#player-hand");
    dealCard(deck, dealerHand, "#dealer-hand");
    //display the points
    displayPoints();
    //check for busts
    checkForBusts();
  });

  //when hit button is clicked
  $("#hit-button").click(function () {
    //deal a new card to player
    dealCard(deck, playerHand, "#player-hand");
    //display points
    displayPoints();
    //check for busts
    checkForBusts();
  });

  //stand button - player stays and dealer's turn
  $("#stand-button").click(function () {
    //find out what card is the hole card - get the alt
    //if it has the hold class, change the src
    $(".card.hole").attr("src", getCardImageUrl(dealerHand[0]));
    //deal cards to dealer, until he has 17pts or more
    var dealerPoints = calculatePoints(dealerHand);
    //show dealer's score
    $("#dealer-points").text(dealerPoints);
    while (dealerPoints < 17) {
      //keep dealing
      dealCard(deck, dealerHand, "#dealer-hand");
      //recalculate points - to stop loop
      dealerPoints = calculatePoints(dealerHand);
    }
    //calculate points
    displayPoints();
    //check for bust
    if (!checkForBusts()) {
      //determine the winnner
      //get player points
      var playerPoints = calculatePoints(playerHand);
      var dealerPoints = calculatePoints(dealerHand);
      //announce winner
      if (playerPoints > dealerPoints) {
        $("#messages").text("you won!");
      } else if (playerPoints === dealerPoints) {
        $("#messages").text("push");
      } else {
        $("#messages").text("you lose!");
      }
    }
  });
});
