'use strict';
/*
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

new Player("Olimar", 180, 53, "Pikmin",
		[
		new Move("name", N, PP, NO_RECOIL, [], 0, ""),
		new Move("name", N, PP, NO_RECOIL, [], 0, ""),
		new Move("name", N, PP, NO_RECOIL, [], 0, "")
		]),


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
*/
