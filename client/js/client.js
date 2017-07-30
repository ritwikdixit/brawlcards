'use strict';

function sselect(idd) {
	return document.getElementById(idd).getElementsByClassName("cctext")[0];
}
function oSelect(idd) {
	return document.getElementById(idd);
}

var pCards = [sselect("p0"), sselect("p1"), sselect("p2")];
var cpuCards = [sselect("cpu0"), sselect("cpu1"), sselect("cpu2")];
var attackCpuCards = [oSelect("cpu0"), oSelect("cpu1"), oSelect("cpu2")];
var attackPCards = [oSelect("p0"), oSelect("p1"), oSelect("p2")];

var hps = [
	[oSelect("hp0"), oSelect("hp1"), oSelect("hp2")],
	[oSelect("hcpu0"), oSelect("hcpu1"), oSelect("hcpu2")]
];

var pMoveButtons = [
	[oSelect("p0m0"), oSelect("p0m1"), oSelect("p0m2")],
	[oSelect("p1m0"), oSelect("p1m1"), oSelect("p1m2")],
	[oSelect("p2m0"), oSelect("p2m1"), oSelect("p2m2")]
];
var pMoves = [
	[sselect("p0m0"), sselect("p0m1"), sselect("p0m2")],
	[sselect("p1m0"), sselect("p1m1"), sselect("p1m2")],
	[sselect("p2m0"), sselect("p2m1"), sselect("p2m2")]
];
var handButtons = [document.getElementById("hand0"), document.getElementById("hand1"), document.getElementById("hand2")];
var handCards = [sselect("hand0"), sselect("hand1"), sselect("hand2")];

var clt = document.getElementById("commandlinecontainer");
var commandLine = document.getElementById("newcommandline");
var turnCounter = document.getElementById("tc");
var cpuCC = sselect("cpuIndicator");
var hud = oSelect("playIndicator");
var commandinput = oSelect("commandinput");

//constants
var COMMANDLINE = 'commandline';
var COMMANDLINETACK = 'commandlinetack';
var COMMANDLINEREQUEST = 'cmlr';
var COMMANDLINEONLY = 'cmlo';
var HUD = 'hud';

var UPDATEHAND = "updatehand";
var SLEIGHTOFHAND = "sleight";
var CHOOSEMOVE = 'choosemove';
var ATTACKOTHER = 'attack';
var CHOOSESWITCH = 'chooseswitch';
var UPDATECARDS = 'updatecards';
var MOVEDESC = 'md';

var GRAPHICS = 'graphicsupdate';
//graphics = first element of the array.
var SETPLAYERCOLOR = 2000;
var SETOPPCOLOR = 2020;
var SETMOVECOLOR = 2040;
var SETHANDCOLOR = 2060;

//********************
//********************
//ACTUAL implementation starts now
//********************
//********************

var sock = io();
sock.on(COMMANDLINE, docPrint);
sock.on(COMMANDLINETACK, docTack);
sock.on(COMMANDLINEONLY, docChat);
sock.on(HUD, hudPrint);

//add something to the commandLine
function docPrint(text) {
	commandLine.innerHTML = commandLine.innerHTML + text + "<br>";
	hud.innerHTML = text;
}

function docTack(text) {
	commandLine.innerHTML = commandLine.innerHTML + text + "<br>";
	hud.innerHTML += text + " ";
}

function docChat(text) {
	commandLine.innerHTML = commandLine.innerHTML + text + "<br>";
	clt.scrollTop = clt.scrollHeight;
}

function hudPrint(text) {
	hud.innerHTML = text;
}

commandinput.addEventListener("keypress", function (e) {
	var key = e.which || e.keyCode;
	if (key == 13) { // enter
		var query = commandinput.value;
		commandinput.value = "";
		sock.emit(COMMANDLINEREQUEST, query);
		e.preventDefault();
	}
});

sock.on(UPDATEHAND, updateHand);

function updateHand(hand) {
	for (var i = 0; i < 3; i++) {
		if (i < hand.length)
			handCards[i].innerHTML = hand[i].name;
		else
			handCards[i].innerHTML = "";
	}
}


function moveStr(move) {
	var strBuilder = move.name + "    " + move.power + "<br>" + move.pp + "/" + move.maxpp + "PP | ";
	if (move.recoil != 0)
		strBuilder += move.recoil + "recoil | ";
	if (move.coinflip.length > 0)
		strBuilder += "coinflip " + move.coinflip.toString() + "| ";
	if (move.priority != 0)
		strBuilder += "priority " + move.priority + " | ";
	strBuilder += move.specCode;
	return strBuilder;
}

sock.on(UPDATECARDS, updateCards);

function updateCards(x) {
	var activeChars=x[0];
	var cpuActiveChars=x[1];
	 //change procedure
	for (var i = 0; i < pCards.length; i++) {
		attackPCards[i].style.backgroundColor="#6C7A89";
		//empty the card and moves if no player is there
		if (i >= activeChars.length) {
			attackPCards[i].style.backgroundColor="#ecf0f1";
			pCards[i].innerHTML = "";
			for (var j=0;j<3;j++)
				pMoves[i][j].innerHTML="";
			hps[0][i].style.display="none";
			continue;
		}

		attackPCards[i].style.boxShadow = "0px 0px 0px #fff inset";
		attackPCards[i].style.backgroundImage = 'url(images/' + activeChars[i].imageStr + '.png)';

		pCards[i].innerHTML = activeChars[i].name + ": " + activeChars[i].hp + "/" + activeChars[i].maxhp + "HP";

		hps[0][i].style.display="block";
		hps[0][i].value = activeChars[i].hp;
		hps[0][i].max = activeChars[i].maxhp;

		for (var j = 0; j < 3; j++) {
			pMoves[i][j].innerHTML = "";
			if (j < activeChars[i].moves.length) {
				//fully printed format later. There will be a standard format but special for some.
				pMoves[i][j].innerHTML = moveStr(activeChars[i].moves[j]);
			}
		}
	}
	for (var i = 0; i < cpuCards.length; i++) {
		attackCpuCards[i].style.backgroundColor="#6C7A89";
		if (i >= cpuActiveChars.length) {
			attackCpuCards[i].style.backgroundColor="#ecf0f1";
			cpuCards[i].innerHTML = "";
			hps[1][i].style.display="none";
			continue;
		}

		attackCpuCards[i].style.boxShadow = "0px 0px 0px #fff inset";
		attackCpuCards[i].style.backgroundImage = 'url(images/' + cpuActiveChars[i].imageStr + '.png)';

		hps[1][i].style.display="block";
		hps[1][i].value = cpuActiveChars[i].hp;
		hps[1][i].max = cpuActiveChars[i].maxhp;

		cpuCards[i].innerHTML = cpuActiveChars[i].name + ": " + cpuActiveChars[i].hp + "/" + cpuActiveChars[i].maxhp + "HP";
	}
}

sock.on(GRAPHICS, graphicsUpdate);

function graphicsUpdate(arr) {
	var key = arr[0];
	var ind = arr[1];

	if (key == SETPLAYERCOLOR) {
		attackPCards[ind].style.boxShadow = "0px 0px 1000px " + arr[2] + " inset";
	} else if (key == SETMOVECOLOR) {
		var move = arr[2];
		pMoveButtons[ind][move].style.backgroundColor = arr[3];
	} else if (key == SETOPPCOLOR) {
		attackCpuCards[ind].style.boxShadow = "0px 0px 1000px " + arr[2] + " inset";
	} else if (key == SETHANDCOLOR) {
		handButtons[ind].style.backgroundColor = arr[2];
	}
}

//********************
//********************
//		 HAND
//********************
//********************

handButtons[0].onclick = function() {
	sock.emit(SLEIGHTOFHAND, 0);
}
handButtons[1].onclick = function() {
	sock.emit(SLEIGHTOFHAND, 1);
}
handButtons[2].onclick = function() {
	sock.emit(SLEIGHTOFHAND, 2);
}

//********************
//********************
//HOVER OVER FOR DESCRIPTIONS
//********************
//********************

function desc(p, m) {
	sock.emit(MOVEDESC, [p, m]);
}

for (var ia=0; ia<3; ia++) {
	for (var ja=0; ja<3; ja++) {
		(function(indexp, indexm){

			pMoveButtons[indexp][indexm].addEventListener("mouseover", function(){
				
				desc(indexp, indexm);
			});

		})(ia, ja);
		
	}
}


//********************
//********************
//  MOVE SELECTION
//********************
//********************

function chooseMove(i, j) {
	sock.emit(CHOOSEMOVE, [i, j]);
}

pMoveButtons[0][0].onclick=function() {
	chooseMove(0, 0);
}

pMoveButtons[0][1].onclick=function() {
	chooseMove(0, 1);
}

pMoveButtons[0][2].onclick=function() {
	chooseMove(0, 2);
}

pMoveButtons[1][0].onclick=function() {
	chooseMove(1, 0);
}

pMoveButtons[1][1].onclick=function() {
	chooseMove(1, 1);
}

pMoveButtons[1][2].onclick=function() {
	chooseMove(1, 2);
}

pMoveButtons[2][0].onclick=function() {
	chooseMove(2, 0);
}

pMoveButtons[2][1].onclick=function() {
	chooseMove(2, 1);
}

pMoveButtons[2][2].onclick=function() {
	chooseMove(2, 2);
}

//********************
//********************
// SELECT OPPONENTS
//********************
//********************
function attackCpu(i) {
	sock.emit(ATTACKOTHER, i);
}

attackCpuCards[0].onclick=function() {
	attackCpu(0);
}

attackCpuCards[1].onclick=function() {
	attackCpu(1);
}

attackCpuCards[2].onclick=function() {
	attackCpu(2);
}

//********************
//********************
// CHOOSE SWITCH
//********************
//********************

function chooseSwitch(i) {
	sock.emit(CHOOSESWITCH, i);
}

attackPCards[0].onclick=function() {
	chooseSwitch(0);
}

attackPCards[1].onclick=function() {
	chooseSwitch(1);
}

attackPCards[2].onclick=function() {
	chooseSwitch(2);
}





