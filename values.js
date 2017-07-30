'use strict';
//these will be the data for all the characters

//specifics on how to program the moves so that they all work

var PP = "PP"; //makes it more readable
var PP_1 = "P-P-1"; 
var NO_RECOIL = 0;
var HP_MULTIPLIER = 0.75; //to keep the game fair.
var SHIELD = 1000;
var FULL_SHIELD = 2000;
var REFLECT = 1;

var R_PLIFE=25;
var R_PLIFEL=5;

//types indexes
var REG = -1;
var POKEMON = 0;
var ROBOTIC = 1;
var BOSS = 2;
var EARTHBOUND = 3;
var MAGIC = 4;

var typeStrs = ["Pokemon", "Robotic", "Boss", "Earthbound", "Magic"];
var dict = [];
var movesDict = [];

var lstr = "Lorem ipsum dolor jesus penal enetration. Only works for HP > 50, PP 2, doesnt work lol."

function shuffle(arr) {
	var j, x, i;
    for (i = arr.length; i; i--) {
        j = Math.floor(Math.random() * i);
        x = arr[i - 1];
        arr[i - 1] = arr[j];
        arr[j] = x;
    }
    return arr;
}

//Prototype constructor for a person object:
function Player(name, maxhealth, speed, originalgame, type, moves) {
	this.name = name;
	this.hp = parseInt(maxhealth*HP_MULTIPLIER);
	this.maxhp = parseInt(maxhealth*HP_MULTIPLIER);
	this.speed = speed;
	this.originalgame = originalgame;
	this.moves = moves;
	this.turnDisable = false; //from recovery

	//if (type == "")
	this.type = type;
	this.blockActivated = 0;
	this.chosenBlocker = -1;

	this.ability = "";
	this.attackMultiplier = 1;

	this.hasPowerLife=false;
	this.powerLife=R_PLIFE;

	dict[name] = this;

	this.description = name + " " + maxhealth + " max HP | speed: " + speed + "<br>";
	if (type != REG)
		this.description += type + "<br>";

	for (var i=0; i<moves.length; i++) {
		this.description += moves[i].name + "<br>"
	}

	this.resurrect = false;
	if (name == "Darkrai")
		this.resurrect = true;
}

//unique things not programmed into move objects, programmed into players at attack
//COINFLIPCODE = flip a coin for the length number of times, and (number of heads-1) damage
//however, if the number is negative inside then keep going doing that damage (i.e. -20) 

//priority: -1 = always last, 0 = normal, 1 = always first

//COMMON SPEC CODES: split by |
//STATBOOST: 'a' = attack multiplyer, 's' = +speed, 't' = +hp for teammate	
//splash = all opponents, splashAll = all = same
//recover = cannot attack next turn
//single opponent's changers:   'y': opponent attack multiplier 'z': opponent speed
//cannotKO = cannot KO anyone
//shield: blocks the attack from opponents	'q' blocks x amount
//recover HP = negative recoil
//		spec. Damage = (robotic, bosses, pokemon) = multiplier against them 'robots', 'bosses', 'pokemon', 'earthbound', 'magic'
//		powlife = needs power life
function Move(name, power, maxpp, recoil, coinflip, priority, specCode) {
	this.name = name;
	this.power = power;
	if (maxpp == "P-P-1") {
		this.maxpp = 1;
		this.pp = 1;	
	} else {
		this.maxpp = 20;
		this.pp = 20;
	}
	this.recoil = recoil;
	this.coinflip = coinflip;
	this.priority = priority;
	this.specCode = specCode;
	this.isSplash = false;
	this.needsRecovery = false;
	this.needsPowerLife = false;

	this.description = "Lorem ipsum dolor jesus penal enetration. Only works for HP > 50, PP 2, doesnt work lol." + lstr + "<br>";
	movesDict[name] = this;

	this.speedBoost = 0;
	this.teamHPBoost = 0;
	this.attackBoost = 1;

	this.speedCut = 0;
	this.attackYM = 1;

	this.blocks=0; //<--if equal to 400 ==> blocks all of the attack
	this.cannotKO=false;
	this.minHP=-1; //if > -1 then minHP required.

	//			 pkmn,robot,boss,earth,magic
	this.types = [1, 1, 1, 	1, 	1];

	var attributes = specCode.split("|");
	//parse les attributes
	for (var i=0; i<attributes.length; i++) {
		var nos = attributes[i].split(":");
		if (attributes[i]=="splash")
			this.isSplash=true;
		if (attributes[i]=="recover")
			this.needsRecovery=true;
		if (attributes[i]=="cannotKO")
			this.cannotKO=true;
		if (attributes[i]=="powlife")
			this.needsPowerLife=true;

		if (attributes[i]=="shield")
			this.blocks=SHIELD;
		if (attributes[i]=="fullshield")
			this.blocks=FULL_SHIELD;
		if (attributes[i]=="reflect")
			this.blocks=REFLECT;
		if (attributes[i][0] == 'q' && nos.length == 2)
			this.blocks = parseInt(nos[1]);

		if (attributes[i][0] == 'a' && nos.length == 2)
			this.attackBoost = parseFloat(nos[1]);
		if (attributes[i][0] == 's' && nos.length == 2)
			this.speedBoost = parseInt(nos[1]);
		if (attributes[i][0] == 't' && nos.length == 2)
			this.teamHPBoost = parseInt(nos[1]);

		if (attributes[i][0] == 'y' && nos.length == 2)
			this.attackYM = parseFloat(nos[1]);
		if (attributes[i][0] == 'z' && nos.length == 2)
			this.speedCut = parseInt(nos[1]);

		if (attributes[i][0] == "pokemon" && nos.length == 2)
			this.types[POKEMON] == parseFloat(nos[1]);
		if (attributes[i][0] == "robotic" && nos.length == 2)
			this.types[ROBOTIC] == parseFloat(nos[1]);
		if (attributes[i][0] == "bosses" && nos.length == 2)
			this.types[BOSS] == parseFloat(nos[1]);
		if (attributes[i][0] == "earthbound" && nos.length == 2)
			this.types[EARTHBOUND] == parseFloat(nos[1]);
		if (attributes[i][0] == "magic" && nos.length == 2)
			this.types[MAGIC] == parseFloat(nos[1]);

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

/*new Player("Olimar", 180, 53, "Pikmin",
		[
		new Move("name", N, PP, NO_RECOIL, [], 0, ""),
		new Move("name", N, PP, NO_RECOIL, [], 0, ""),
		new Move("name", N, PP, NO_RECOIL, [], 0, "")
		]),
*/

//manual inputting of data
//name, power, maxpp, recoil, coinflip, priority, specCode
var CHARACTERS = [
	new Player("Tester", 250, 87, "Sonic", REG,
		[
		new Move("Test Move 1", 30, PP, NO_RECOIL, [], -2, ""),
		new Move("Test Move 2", 30, PP, NO_RECOIL, [], 0, "powlife")
		]),
	new Player("Tester2", 250, 87, "Sonic", REG,
		[
		new Move("Test Move 2-1", 30, PP, NO_RECOIL, [], -2, ""),
		new Move("Test Move 2-2", 30, PP, NO_RECOIL, [], 0, "powlife")
		]),


	new Player("Shadow", 150, 87, "Sonic", REG,
		[
		new Move("Speed", 30, PP, NO_RECOIL, [75], 0, ""),
		new Move("Dark Fire", 50, PP, NO_RECOIL, [], 0, "darkfire")
		]),

	new Player("Olimar", 180, 53, "Pikmin", REG,
		[
		new Move("Physical Space", 30, PP, NO_RECOIL, [], 0, "s:15"),
		new Move("Minions", 40, PP, NO_RECOIL, [], 0, "minions"),
		new Move("Rocket Ship", 90, PP_1, NO_RECOIL, [], 0, "splash")
		]),

	new Player("Chain Chomp", 80, 30, "Mario", REG,
		[
		new Move("ChainChompBrawl", 100, PP_1, NO_RECOIL, [], 0, "t:30|recover"),
		new Move("Blacken", 60, PP, NO_RECOIL, [], 0, ""),
		new Move("Swap Shop", 0, PP_1, 30, [], -2, "swapshop"),
		]),

	new Player("Sheik", 120, 77, "Zelda", REG,
			[
			new Move("Ninja Style", 30, PP, NO_RECOIL, [-30], 0, ""),
			new Move("Needlestorm", 80, PP_1, NO_RECOIL, [], 0, "")
			]),

	new Player("Lucas", 130, 72, "EarthBound", EARTHBOUND,
		[
		new Move("PK Thunder", 50, PP, NO_RECOIL, [], 0, "robotic:0"),
		new Move("PK Freeze", 70, PP_1, NO_RECOIL, [], -1, "robotic:2")
		]),

	new Player("Pikachu", 100, 85, "Pokemon", POKEMON,
		[
		new Move("Thunderbolt", 55, PP_1, NO_RECOIL, [], 0, "splash"),
		new Move("Scratch", 30, PP, NO_RECOIL, [], 0, ""),
		new Move("Epic Discharge", 80, PP, NO_RECOIL, [], 0, "powlife")
		]),

	new Player("Sonic", 120, 100, "Sonic", REG,
		[
		new Move("Speedy Kick", 40, PP, NO_RECOIL, [], 1, ""),
		new Move("Speed", 70, PP, 20, [], 0, ""),
		new Move("Bust Charge", 100, 1, NO_RECOIL, [], 0, "")
		]),

	new Player("Ganondorf", 250, 20, "Zelda", REG,
		[
		new Move("Poison Choke", 10, PP, NO_RECOIL, [], 0, "z:0.5"),
		new Move("Explosive Kick", 70, PP, 20, [], 0, ""),
		new Move("Magic Punch", 0, PP, NO_RECOIL, [130], 0, "recover")
		]),

	new Player("Ridley", 160, 50, "Metroid", BOSS,
		[
		new Move("X-Wind", 30, PP, NO_RECOIL, [], 1, ""),
		new Move("BigHitBrawl", 50, PP, NO_RECOIL, [], 0, ""),
		new Move("UraniumCannon", 90, PP_1, NO_RECOIL, [], 0, "")
		]),

	new Player("Crazy Hand", 160, 36, "Brawl", BOSS,
		[
		new Move("Incanea", 40, PP, NO_RECOIL, [], 1, ""),
		new Move("Flare Slam", 100, PP, 30, [], 0, ""),
		new Move("Destiny Doom", 80, PP_1, NO_RECOIL, [], 0, "")
		]),

	new Player("Kirby", 120, 60, "Kirby", REG,
		[
		new Move("Rock", 20, PP, NO_RECOIL, [], -1, "q:50"),
		new Move("Super Flash", 100, PP, NO_RECOIL, [], 0, "powlife")
		]),

	new Player("Spartan", 200, 45, "Halo", ROBOTIC,
		[
		new Move("Turret", 55, PP, NO_RECOIL, [], 0, "haloturret"),
		new Move("All Skulls On", -20, PP_1, 20, [], 1, "splash|t:80")
		]),

	new Player("Cynthia", 200, 70, "Pokemon", POKEMON,
		[
		new Move("Milotic Veil", 20, PP, -20, [], 0, "pokemon:1.5"),
		new Move("Lucario Steel", 40, PP, NO_RECOIL, [], 0, "pokemon:1.5"),
		new Move("Garchomp Dragon Rush", 100, 2, 20, [], 0, "pokemon:1.5")
		]),

	new Player("Zero Suit Samus", 120, 92, "Metroid", REG,
		[
		new Move("Whiplash", 70, PP, NO_RECOIL, [], 0, "bosses:0.5"),
		new Move("Shock", 40, PP, NO_RECOIL, [-40], 0, "cannotKO")
		]),

	new Player("The Arbiter", 190, 72, "Halo", REG,
		[
		new Move("Smash", 60, PP, NO_RECOIL, [], 0, ""),
		new Move("Final Party (Energy Sword)", 120, PP_1, NO_RECOIL, [], -1, "finalparty")
		]),

	new Player("Ike", 180, 40, "Fire Emblem", REG,
		[
		new Move("Aether", 60, PP, NO_RECOIL, [], 0, "aether"),
		new Move("Ground Slam", 40, PP, 20, [120], 0, "")
		]),

	new Player("Donkey Kong", 150, 55, "Donkey Kong", REG,
		[
		new Move("Physicality", 50, PP, NO_RECOIL, [], 0, ""),
		new Move("Slam", 100, PP, 20, [], 0, "kongslam")
		]),

	new Player("Toon Link", 140, 71, "Zelda", REG,
		[
		new Move("SupremeSWORDBrawl", 100, PP, NO_RECOIL, [], 0, "cannotKO"),
		new Move("Shield", 0, 2, NO_RECOIL, [], 1, "shield")
		]),

	new Player("Sylux", 200, 45, "Metroid", ROBOTIC,
		[
		new Move("Greendoom", 40, 1, NO_RECOIL, [], 1, ""),
		new Move("Shock Coil", 30, PP, -30, [], 0, ""),
		new Move("Vengeance", 100, PP, 50, [], 0, "")
		]),

	new Player("Marth", 130, 80, "Fire Emblem", REG,
		[
		new Move("Triple Attack", 40, PP, NO_RECOIL, [80, 120], 0, ""),
		new Move("ShineBlowBrawl", 50, PP, NO_RECOIL, [], 0, "q:50"),
		]),

	new Player("King DeDeDe", 160, 42, "Kirby", REG,
		[
		new Move("Hammering", 40, PP, NO_RECOIL, [], 0, ""),
		new Move("Fatness", 80, PP, NO_RECOIL, [], 0, "t:-20"),
		new Move("Medieval Spirit", 0, PP, NO_RECOIL, [], 1, "z:20|splash")
		]),


];

//name, power, maxpp, recoil, coinflip, priority, specCode


//****************************************************************************************************
//****************************************************************************************************
//****************************************************************************************************
//****************************************************************************************************
//					^^^CHARACTERS /// VALUES
//****************************************************************************************************
//****************************************************************************************************
//****************************************************************************************************
//****************************************************************************************************
//**************************************************
//					^^^CHARACTERS /// VALUES
//****************************************************************************************************
//****************************************************************************************************
//****************************************************************************************************
//****************************************************************************************************
//					^^^CHARACTERS /// VALUES
//****************************************************************************************************
//****************************************************************************************************
//****************************************************************************************************
//****************************************************************************************************



var winner = 0; //-1 is CPU, 1 is player
var MAX_ACTIVE = 3;
var SWAP_CODE = 8;

var TEAM_SIZE = 4;
var CPU_TEAM_SIZE = 6;

var HAND_SIZE = 3;
var MIN_FOR_BONUS = 3; //total players required for bonus round

var CPU_PREFERRED = MAX_ACTIVE-1;


var darkVoid = false;
var confounding = -1;
//				p, cpu
var magnet = [-1, -1];
var stability = false;


function docPrint(text) {
	commandLine.innerHTML = commandLine.innerHTML + text + "<br>";
	hud.innerHTML = text;
}

function docTack(text) {
	commandLine.innerHTML = commandLine.innerHTML + text + "<br>";
	hud.innerHTML += text;
}

function dPrint(text) {
	commandLine.innerHTML = commandLine.innerHTML + text;
}

function random(min, max) {
	return Math.floor(Math.random() * (max - min) ) + min;
}

function adjHP(hp) {
	return parseInt(hp*HP_MULTIPLIER);
}

characters = shuffle(CHARACTERS);

//player and CPU distribute characters
var arrcount = 0;
var cpuarrcount = 0;
var arr = characters.slice(0, TEAM_SIZE);
var cpuarr = characters.slice(TEAM_SIZE, TEAM_SIZE+CPU_TEAM_SIZE);

//distribute players to each player and cpu hand
var hand = arr.slice(0, HAND_SIZE);
var cpuhand = cpuarr.slice(0, HAND_SIZE);
arrcount = cpuarrcount = HAND_SIZE;

var activeChars = [];
var cpuActiveChars = [];

function ozs(x) {
	if (x == 0)
		return 1;
	return 0;
}

function ac(isCpu) {
	if (isCpu == 0)
		return activeChars;
	return cpuActiveChars;
}

function gui(isCpu) {
	if (isCpu == 0)
		return attackPCards;
	return attackCpuCards;
}

function opt(isCpu) {
	if (isCpu == 0)
		return "";
	return "CPU's ";
}

function flipCoin() {
	return Math.random() >= 0.5;
}

function drawFromHand(choice) {
	if (winner != 0)
		return;
	if (choice >= hand.length)
		return;

	//in this case it's not key -1
	if (activeChars.length >= MAX_ACTIVE) {
		docPrint("Already " + MAX_ACTIVE + " players in.");
		return;
	}
	var chosenOne = hand[choice];
	hand.splice(choice, 1); //remove it from the hand
	activeChars.push(chosenOne);
	docPrint("Go! " + chosenOne.name + "!");

	//push rando into the hand.
	if (arrcount < TEAM_SIZE) {
		hand.push(arr[arrcount]);
		arrcount++;
	}
	printHand();
	updateCards();
	updateHand();
}

function cpuDeploy() {
	if(cpuActiveChars.length >= MAX_ACTIVE)
		return;
	if (cpuhand.length <= 0)
		return;
	//CPU readying his team. Send out 1 to battlefield.
	var cpuChoice = random(0, cpuhand.length);
	var co = cpuhand[cpuChoice];
	cpuhand.splice(cpuChoice, 1);
	cpuActiveChars.push(co);
	docPrint("CPU sent out " + co.name + "!");
	if (cpuarrcount < CPU_TEAM_SIZE) {
		cpuhand.push(cpuarr[cpuarrcount]);
		cpuarrcount++;
	}
	updateCards();
}

function updateCards() { //change procedure
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
		hps[1][i].style.display="block";
		hps[1][i].value = cpuActiveChars[i].hp;
		hps[1][i].max = cpuActiveChars[i].maxhp;
		cpuCards[i].innerHTML = cpuActiveChars[i].name + ": " + cpuActiveChars[i].hp + "/" + cpuActiveChars[i].maxhp + "HP";
	}
}

function isOnField(nameStr) {
	for (var i=0;i<activeChars.length;i++) {
		if (activeChars[i].name==nameStr)
			return [0, i];	//[isCpu=0, index]
	}
	for (var i=0;i<cpuActiveChars.length;i++){
		if (cpuActiveChars[i].name==nameStr)
			return [1, i]; //[isCpu=1, index]
	}
	return -1;
}


//DONE WITH INITIALIZING REAL SHIT HAPPENS HERE BISHHH

function godSwap(isCpu, activeIndex, handIndex) {
	var temp;
	if (isCpu == 0) {
		if (activeChars[activeIndex].type!=POKEMON)
			activeChars[activeIndex].hp -= 30;
		temp = activeChars[activeIndex];
		activeChars[activeIndex] = hand[handIndex];
		hand[handIndex] = temp;
		docTack(temp.name + " switched out for " + activeChars[activeIndex].name + "!");
		updateHand();
	} else {
		if (cpuActiveChars[activeIndex].type!=POKEMON)
			cpuActiveChars[activeIndex].hp -= 30;
		temp = cpuActiveChars[activeIndex];
		cpuActiveChars[activeIndex] = cpuhand[handIndex];
		cpuhand[handIndex] = temp;
		docTack(temp.name + " switched out for " + cpuActiveChars[activeIndex].name + "!");
	}
	updateCards();
}


//returns an array [true/false, and a string of why attack is not possible]
function isAttackPossible(arrData) {
	var arr, oarr;
	var ind = arrData.index;
	var opp = arrData.opp;
	var m = arrData.moveChoice;
	if (arrData.player) {
		arr = ac(0);
		oarr = ac(1);
	} else {
		arr = ac(1);
		oarr = ac(0);
	}
	if (ind >= arr.length)
		return [false, "character not on team anymore."];

	if (m == SWAP_CODE) {
		if (arr[ind].hp < 30)
			return [false, "not enough hp (minimum 30 required)."];
		if (arrData.prior == -25)
			return [false, "cannot swap on extra turn."]
		if (ind == 0)
			return [false, "cannot intentionally swap out slot[0]."];
		for (var ib=0;ib<oarr.length;ib++)
			if (oarr[ib].name == "Master Chief" || oarr[ib].name == "Meta Knight")
				return [false, "Master Chief, Meta Knight block all switches."];
		return [true, ""];
	}		

	if (m >= arr[ind].moves.length)
		return [false, "move magic."];

	//special things:
	if (arr[ind].moves[m].specCode=="aether")
		if (arr[ind].hp<60)
			return [false, "Ike needs more 60HP for Aether."];

	if (arr[ind].moves[m].needsPowerLife && !arr[ind].hasPowerLife)
		return [false, arr[ind].moves[m].name + " needs power life."];


	if (arr[ind].hp<=0)
		return [false, "HP = 0"];

	//PRIMARY CHECK = PP
	if (arr[ind].moves[m].pp <= 0)
		return [false, arr[ind].moves[m].name + " out of PP."];



	//set up special moves:
	if (arr[ind].moves[m].specCode == "darkvoid")
		darkVoid = true;
	if (arr[ind].moves[m].specCode == "confound") {
		confounding=0;
		if (arrData.player) //OPPOSITE: points to who it is gonna confound.
			confounding=1;
	}
	if (arr[ind].moves[m].specCode == "magnet") {
		if (arrData.player)
			magnet[1]=ind; //1 == opponent so that when opponent is attacking player.
		else
			magnet[0]=ind; //0 == player so that when player attacking opp.
	}

	return [true, ""];
}

//after each turn, clean the slate
//do the shit beginning of each turn
function clean(isCpu, ind) {
	var arr=ac(isCpu);
	arr[ind].blockActivated=0;
	arr[ind].chosenBlocker=-1;

	if (arr.length>=MAX_ACTIVE)
		arr[ind].hp = Math.max(arr[ind].hp - 5, 0);

	if (arr.length>1) {
		var sameGame = true;
		var fastestSpeed=0;
		var game = arr[ind].originalgame;
		for (var i=0;i<arr.length;i++) {
			if (arr[i].speed>fastestSpeed)
				fastestSpeed=arr[i].speed;
			if (arr[i].originalgame != game)
				sameGame=false;
		}
		if (sameGame) {
			console.log("Same Game Boost!");
			for (var k=0;k<arr.length;k++)
				arr[k].speed = fastestSpeed;
		}
	}

}



					//0 = player, 1 = cpu
function doTheAttack(arrKey, ind, opp, move) {
	var arr = ac(arrKey);
	var oarr = ac(ozs(arrKey));

	var pref = opt(arrKey); //for printing purposes
	var opref = opt(ozs(arrKey));

	if (ind>=arr.length)
		return;
	if (opp>=oarr.length)
		return;
	if (arr[ind].hp <= 0) {
		updateCards();
		return;
	}

	function quitIt(docTackMessage) { //ez procedure before quitting.
		docTack(docTackMessage);
		updateCards();
		gui(arrKey)[ind].style.backgroundColor="#fff";
	}

	//recovering happens really early.
	if (arr[ind].turnDisable) {
		quitIt(pref+arr[ind].name+ " must recover!");
		arr[ind].turnDisable=false;
		return;
	}

	if (move == SWAP_CODE) {
		docPrint(pref + arr[ind].name + " swapped out");
		arr[ind].attackMultiplier=1;
		godSwap(arrKey, ind, opp);
		gui(arrKey)[ind].style.backgroundColor="#fff";
		return;
	}

	function rDmg(movePower) { //calculates actual damage
		return parseInt( arr[ind].attackMultiplier * movePower );
	}

	//power life:
	var powlifeint = random(0, arr[ind].powerLife);
	if (powlifeint == 3) {
		arr[ind].attackMultiplier=1.25;
		arr[ind].hp+=40;
		arr[ind].hasPowerLife=true;
		docTack(pref + arr[ind].name + " received a Power Life!");
	}

	//CHANGING OPPONENTS

	if (confounding == arrKey){
		docTack("Confounded!");
		opp = random(0, oarr.length);
	}
	if (magnet[arrKey] != -1) {
		docTack(oarr[magnet[arrKey]].name + "s Magnet!")
		opp = magnet[arrKey]; 
	}

	//********************************
	//ATTACK VARIABLES
	//********************************


	//asume it's an attack.
	var originalhp = oarr[opp].hp;
	var damage = rDmg(arr[ind].moves[move].power);

	var m = arr[ind].moves[move]; //for convenience
	var nc = pref + arr[ind].name;
	var po = opref + oarr[opp].name;


	//type damage mulitplier: happens before everything except recovery and swaps
	for (var it=0;it<m.types.length;it++)
		if (m.types[it]!=1 && oarr[opp].type==it)
			damage = parseInt( damage * m.types[it]);

	//********************************
	//done with set up
	//********************************
	//********************************




	//special cases:
	if (arr[ind].type==EARTHBOUND && oarr[opp].name == "Cynthia")
		damage *=2; //cynthia hit 2x by lucas, ness

	//********************************
	//SHIELD BLOCK REFLECT
	//********************************
	//some of the original attack will be blocked.
	if (oarr[opp].blockActivated != 0 && oarr[opp].chosenBlocker==ind) {
		if (oarr[opp].blockActivated)

		docTack(po + "blocked " + oarr[opp].blockActivated + " amount of the attack!");
		damage = Math.max(0, damage-oarr[opp].blockActivated);
	}

	//special characters reasons to quit it early
	if (m.specCode=="darkfire") {
		var findSonic = isOnField("Sonic");
		if (findSonic != -1) {
			ac(findSonic[0])[findSonic[1]].hp += 20;
			arr[ind].hp += 30;
			docTack("Shadow Boosted 30HP, Sonic Boosted 20HP!");
		}
	}
	//mr. Spartan
	if (m.specCode=="haloturret") {
		for (var kj=0;kj<arr.length;kj++)
			if (kj!=ind&&arr[kj].originalgame=="Halo")
				damage*=2;
	}

	//dark void voids:
	if (darkVoid) {
		docTack("Dark Void present. ");
		damage = 0;
	}

	//ability stability
	if (isOnField("Pit"))
		damage = Math.min(damage, 100);
	if (isOnField("Solid Snake") && damage > 100) {
		damage = 0;
		docTack("Solid Snake's Anti-Air Defense voids attacks with > 100 Damage.");
	}

	//PP AREA!!!

	//splash damage used 1 PP but damages everyone. --> when pikachu is in slot[0] no PP used by team.
	if ((m.isSplash && opp < oarr.length-1) || arr[0].name=="Pikachu")
		arr[ind].moves[move].pp++;

	arr[ind].moves[move].pp--;



	//********************************
	//SPECIAL MOVES LOL
	//********************************
	if (m.specCode=="ppgift") {
		if (arr.length > opp) {		//arr[opp]=adjacent
			for (var iki=0; iki<arr[opp].moves.length; iki++)
				arr[opp].moves[iki].pp++;
			docTack(nc + " restored " + arr[opp].name + "s PP!");
		} else {
			docTack(nc + "s PP gift failed.")
		}
	}
	if (m.specCode == "attackmultiswitch") {
		var temp = arr[ind].attackMultiplier;
		arr[ind].attackMultiplier = oarr[opp].attackMultiplier;
		oarr[opp].attackMultiplier=temp;
		docTack(nc + " and " + po + " switched attack Multipliers!");
	}
	if (m.specCode == "zero_attackmultiswitch") {
		var temp = arr[0].attackMultiplier;
		arr[0].attackMultiplier = oarr[opp].attackMultiplier;
		oarr[opp].attackMultiplier=temp;
		docTack(pref + arr[0].name + " and " + po + " switched attack Multipliers!");
	}

	if ( (m.specCode=="kongslam"||m.specCode=="finalparty") && oarr[opp].hp>damage) {
		quitIt(nc + "'s " + m.name + " failed as it needs a guaranteed KO!");
		gui(ozs(arrKey))[opp].style.backgroundColor="#e74c3c";
		return;
	}
	if (m.name=="Magic Punch"&&oarr[opp].speed>=80) {
		quitIt("Magic Punch failed! Opponent must have < 80 speed.")
		gui(ozs(arrKey))[opp].style.backgroundColor="#e74c3c";
		return;
	}
	if (m.specCode=="waterfall") {
		while (oarr.length < MAX_ACTIVE) {
			//player, oarr=opp
			if (arrKey == 0) {
				if (cpuhand.length == 0)
					break;
				cpuDeploy();
				
			} else if (arrKey == 1) {
				if (hand.length == 0)
					break;
				var choice = random(0, hand.length);
				drawFromHand(choice);
			}
			//dual
		}
	}
	if (m.specCode == "hpswitch") {
		var temp = arr[ind].hp;
		arr[ind].hp = oarr[opp].hp;
		oarr[op].hp = temp;
		docTack(nc + " and " + po + " switched HP!");
	}
	if (m.specCode == "shroomgift") {
		for (var ikk=0; ikk<oarr[opp].moves.length; ikk++)
			oarr[opp].moves[ikk].needsRecovery=true;
	}

	//cannotKO
	if (m.cannotKO && originalhp < damage) {
		quitIt(pref+arr[ind].name + "s attack failed as it cannot KO!");
		gui(ozs(arrKey))[opp].style.backgroundColor="#e74c3c";
		return;
	}



	//********************************
	//********************************
	//THIS IS THE ACTUAL ATTACK LMAO
	//********************************
	//********************************

	docTack(nc+ " used " + m.name + "! ");
	docTack(po+ " lost " + Math.min(oarr[opp].hp, damage) + " HP! ");

	oarr[opp].hp = Math.max(0, oarr[opp].hp - damage);

	if (arr[ind].name=="Sonic" && oarr[opp].speed*2 <= arr[ind].speed){ //double speed
		docTack("Sonic doublespeeded " + oarr[opp].name + "!");
		oarr[opp].hp = Math.max(0, oarr[opp].hp - damage);
	}

	//coin flip damage method
	if (m.coinflip.length > 0) {
		var coinarr = m.coinflip;
		var ji = 0;
		//infinite number damage.
		if (coinarr[0] < 0) {
			for (ji=0;flipCoin();ji++)				//because it's negative
				oarr[opp].hp = Math.max(0, oarr[opp].hp+ rDmg(coinarr[0]));
		} else {
			for (ji=0;ji<coinarr.length&&flipCoin();ji++) {
				//empty on purpose
			}
			if (ji > 0)
				oarr[opp].hp = Math.max(0, oarr[opp].hp - rDmg(coinarr[ji-1]) + damage);
		}
		docTack("coin flipped " + ji + " time(s)! " + po + " lost " + (originalhp - oarr[opp].hp) + " total HP!");
	}

	//recoil
	var recoil = m.recoil;
	if (isOnField("Zero Suit Samus") != -1) {
		if (recoil!=0)
			docTack("Zero Suit Samus neutralizes recoil and recovery moves!");
		recoil = 0;
	}

	if (recoil > 0)
		docTack(nc+ " lost " + Math.min(arr[ind].hp, recoil) + "HP from recoil! ");
	else if (recoil < 0)
		docTack(nc + " recovered " + (-1*recoil) + "HP! ");
	arr[ind].hp = Math.max(0, arr[ind].hp-recoil);

	//*************************
	//check out the blocks
	//*************************

	if ((oarr[opp].blockActivated==SHIELD&&oarr[opp].chosenBlocker==ind) || oarr[opp].blockActivated==FULL_SHIELD) {
		docPrint(nc + " used " + m.name + "! ");
		docTack(opref+oarr[opp].name + " shielded the attack!");

		oarr[opp].hp = originalhp;
	}
	if (oarr[opp].blockActivated==REFLECT && oarr[opp].chosenBlocker==ind) {
		docPrint(nc + " used " + m.name + "! ");
		docTack(opref+oarr[opp].name + " reflected the attack!");

		oarr[opp].hp = originalhp;
		arr[ind].hp = Math.max(0, arr[ind].hp-damage);
	}

	//stat boosts happen here:

	if (m.attackBoost!=1)
		docTack(nc + " boosted attack to " + arr[ind].attackMultiplier + "x");
	arr[ind].attackMultiplier *= m.attackBoost;
	if (m.speedBoost != 0)
		docTack(nc + " boosted speed +" + m.speedBoost);
	arr[ind].speed += m.speedBoost;
	//team boost
	if (m.teamHPBoost != 0 && ind != 0) {
		arr[0].hp = Math.max(0, arr[0].hp + m.teamHPBoost);
		docTack(pref + arr[0].name + " boosted " + m.teamHPBoost + " HP!");
	}
	if (m.speedCut != 0) {
		docTack(po + " lost" + m.speedCut + " speed!");
		oarr[opp].speed -= m.speedCut;
	}
	if (m.attackYM != 1) {
		docTack(po+ "'s attack was cut to " + m.attackYM*oarr[opp].attackMultiplier + "x!");
		oarr[opp].attackMultiplier *= m.attackYM;
	}
	if (m.blocks != 0) { //blocking must choose opponent
		arr[ind].blockActivated = m.blocks;
		arr[ind].chosenBlocker=opp;
	} // blocking moves should have higher priority

	//check out recovery
	if (m.needsRecovery) {
		arr[ind].turnDisable = true;
		docTack(nc + " must recover next turn!");
	}

	//Kirby/Greninja acquire the attack after everything for minimum confusion
	if (m.specCode=="suckb" || arr[ind].name == "Greninja") {
		var randopp = random(0, oarr.length);
		var randmove = random(0, oarr[randopp].moves.length);
		arr[ind].moves[2] = oarr[randopp].moves[randmove];
		docTack(nc + " acquired " + arr[ind].moves[2].name + "!");
	}

		//check for fainting from recoil etc.
	if (arr[ind].hp == 0) {
		docTack(nc+ " fainted!");
	}
	if (oarr[opp].hp == 0) {
		docTack(po+ " fainted!");

		if (arr[ind].name=="Donkey Kong") {
			docTack("Go Bananas! Donkey Kong Attack x 1.3")
			arr[ind].attackMultiplier *= 1.3;
		}
		if (oarr[opp].name == "Darkrai" && oarr[opp].resurrect) {
			oarr[opp].hp = 10;
			resurrect = false;
			docTack("Darkrai was resurrected!");
		}
	}



	if (m.specCode=="kneecut") {
		if (oarr.length<MAX_ACTIVE) {
			arr[ind].hp = 20;
			arr[ind].speed = 20;
			oarr.push(arr[ind]);
			arr.splice(ind, 1); //remove player
			docTack(nc + " cut his knee and transferred teams!");

			updateCards();
			gui(ozs(arrKey))[oarr.length-1].style.backgroundColor="#fff";
			return;
		} else
			docTack(nc + " knee cut failed, no space on other team.");
	}
	if (m.specCode=="swapshop") {
		if (opp<arr.length) {
			arr[opp].hp=arr[opp].maxhp; //adj character gets a boost.

			var temp = arr[opp];
			arr[opp]=oarr[opp];
			oarr[opp]=temp;

			arr[opp].hp = parseInt(arr[opp].hp/2);

		} else {
			docTack("Swap failed.")
		}
	}
	if (m.specCode == "scoot") {
		if (arr.length >= 2) {
			var temp=arr[0];
			arr[0]=arr[1];
			arr[1]=temp;
		} else {
			docTack("scoot failed, need 2 players.");
		}
	}
	if (m.specCode == "firepush") {
		var rr = random(0, hand.length);
		if (arrKey==0)
			rr=random(0, cpuhand.length);
		godSwap(ozs(arrKey), opp, rr);
	}
	if (m.specCode == "semitraitor") {
		if (opp.hp <= 60 && arr.length < MAX_ACTIVE && oarr.length == MAX_ACTIVE) {
			arr.push(oarr[opp]);
			oarr.splice(opp, 1);
			docTack(arr[arr.length-1].name + " is the traitor!");
			gui(arrKey)[arr.length-1].style.backgroundColor="#e74c3c";
			updateCards();
			return;
		} else {
			docTack("Semi-traitor failed!");
		}
	}
	if (m.specCode == "absolutetraitor") {
		var allthird = true;
		for (var xi=0;xi<arr.length;xi++)
			if (arr[xi].hp < arr[xi].maxhp/3)
				allthird=false;
		if (allthird && arr.length < MAX_ACTIVE && oarr.length == MAX_ACTIVE) {
			arr.push(oarr[opp]);
			oarr.splice(opp, 1);

			arr[arr.length-1].hp = parseInt( arr[arr.length-1].hp/2 );

			docTack(arr[arr.length-1].name + " is the traitor!");
			gui(arrKey)[arr.length-1].style.backgroundColor="#e74c3c";
			updateCards();
		} else {
			docTack("Absolute traitor failed!");
		}
	}

	updateCards();
	gui(arrKey)[ind].style.backgroundColor="#fff";
	gui(ozs(arrKey))[opp].style.backgroundColor="#e74c3c";


}





