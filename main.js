'use strict';
//these will be the data for all the characters

//specifics on how to program the moves so that they all work

var PP = "PP"; //makes it more readable
var PP_1 = "P-P-1"; 
var NO_RECOIL = 0;
var HP_MULTIPLIER = 1.5; //to keep the game fair.
var SHIELD = 1000;
var FULL_SHIELD = 2000;
var REFLECT = 1;

var R_PLIFE=25;
var R_PLIFEL=5;

//types indexes
var REG = -2;
var POKEMON = 0;
var HALO = 1;
var SSF = 2;
var SWORDS = 3;
var BOSS = 4;

var typeStrs = ["Pokemon", "Halo", "Sonic/StarFox", "Swords", "Boss"];
var dict = [];
var movesDict = [];

var lstr = "Lorem ipsum dolor jesus penal enetration. Only works for HP > 50, PP 2, doesnt work lol."
var blank = "";

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
function Player(name, maxhealth, speed, originalgame, type, moves, desc) {
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
	this.imageStr = name.replace(/\s/g, '');

	dict[name] = this;

	this.description = name + " " + maxhealth + " max HP | speed: " + speed + "<br>";
	if (type != REG)
		this.description += type + "<br>";

	for (var i=0; i<moves.length; i++) {
		this.description += moves[i].name + "<br>"
	}
	this.description += "specials: " + desc + "<br>";

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
function Move(name, power, maxpp, recoil, coinflip, priority, specCode, desc) {
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

	this.description = name + ": " + desc;
	movesDict[name] = this;

	this.speedBoost = 0;
	this.teamHPBoost = 0;
	this.attackBoost = 1;

	this.speedCut = 0;
	this.attackYM = 1;

	this.blocks=0; //<--if equal to 400 ==> blocks all of the attack
	this.cannotKO=false;
	this.minHP=-1; //if > -1 then minHP required.

	//			 pkmn,halo,ssf,swords,boss
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
		if (attributes[i][0] == "halo" && nos.length == 2)
			this.types[HALO] == parseFloat(nos[1]);
		if (attributes[i][0] == "ssf" && nos.length == 2)
			this.types[SSF] == parseFloat(nos[1]);
		if (attributes[i][0] == "swords" && nos.length == 2)
			this.types[SWORDS] == parseFloat(nos[1]);
		if (attributes[i][0] == "boss" && nos.length == 2)
			this.types[BOSS] == parseFloat(nos[1]);

	}
	if (desc === undefined)
		this.description = moveStr(this);
	
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

/*new Player("Olimar", 180, 53, "Pikmin", REG,
		[
		new Move("name", N, PP, NO_RECOIL, [], 0, ""),
		new Move("name", N, PP, NO_RECOIL, [], 0, ""),
		new Move("name", N, PP, NO_RECOIL, [], 0, "")
		]),
*/

//manual inputting of data
//name, power, maxpp, recoil, coinflip, priority, specCode
var CHARACTERS = [
	new Player("Shadow", 150, 87, "Sonic", SSF,
		[
		new Move("Speed", 30, PP, NO_RECOIL, [75], 0, "", "A coin is flipped, if heads, does 75 damage."),
		new Move("Dark Fire", 50, PP, NO_RECOIL, [], 0, "darkfire", "If Sonic on field, Shadow +30HP, Sonic +20HP (regardless of team).")
		]),

	new Player("Olimar", 180, 53, "Pikmin", REG,
		[
		new Move("Physical Space", 30, PP, NO_RECOIL, [], 0, "s:15", "Gains 15 speed."),
		new Move("Minions", 40, PP_1, NO_RECOIL, [], 0, "scoot", 'switches slot[0] character with slot[1] character'),
		new Move("Rocket Ship", 90, PP_1, NO_RECOIL, [], 0, "splash")
		]),

	new Player("Chain Chomp", 80, 30, "Mario", REG,
		[
		new Move("ChainChompBrawl", 85, PP_1, NO_RECOIL, [], 0, "t:30|recover", 'heals team member in slot[0] 30HP. Cannot attack next turn.'),
		new Move("Blacken", 50, PP, NO_RECOIL, [], 0, ""),
		new Move("Swap Shop", 0, PP_1, 30, [], -2, "swapshop", 'At selected index, fully heals ally then swaps cards with opponent, then cuts received card HP in half.'),
		]),

	new Player("Sheik", 120, 77, "Zelda", REG,
		[
		new Move("Ninja Style", 30, PP, NO_RECOIL, [-30], 0, "", "Keep flipping a coin, keeps attacking until tails."),
		new Move("PP Gift", 0, 2, NO_RECOIL, [], 0, "ppgift", "Fully restores PP of all moves of ally adjacent from selected opponent"),
		new Move("Semi-Traitor", 0, PP_1, 50, [], -2, "semitraitor", "If 3 opponents and an opponent has < 60 HP and there is space on team, acquires the opponent card. 50 recoil."),
		]),

	new Player("Lucas", 130, 72, "EarthBound", REG,
		[
		new Move("PK Thunder", 50, PP, NO_RECOIL, [], 0, "halo:2", "double against halo characters"),
		new Move("PK Freeze", 70, PP_1, NO_RECOIL, [], -1, "swords:2", 'double against swords.')
		]),

	new Player("Pikachu", 100, 85, "Pokemon", POKEMON,
		[
		new Move("Thunderbolt", 55, PP_1, NO_RECOIL, [], 0, "splash"),
		new Move("Scratch", 30, PP, NO_RECOIL, [], 0, ""),
		new Move("Epic Discharge", 120, PP, NO_RECOIL, [], 0, "powlife", 'Only usable with Power Life.')
		], "When in slot[0] team uses no PP."),

	new Player("Sonic", 120, 100, "Sonic", SSF,
		[
		new Move("Speedy Kick", 40, PP, NO_RECOIL, [], 1, ""),
		new Move("Speed", 70, PP, 20, [], 0, ""),
		new Move("Bust Charge", 100, 1, NO_RECOIL, [], 0, "")
		], "If Sonic is attacking an opponent with less than half his speed he attacks twice."),

	new Player("Ganondorf", 250, 20, "Zelda", REG,
		[
		new Move("Poison Choke", 10, PP, NO_RECOIL, [], 0, "z:0.5", "halves opponents speed"),
		new Move("Explosive Kick", 70, PP, 20, [], 0, ""),
		new Move("Magic Punch", 0, PP, NO_RECOIL, [130], 0, "recover", "Only works if opponents speed < 80. Fails 50% of the time, otherwise does 130 damage. Must recover after.")
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
		new Move("Scoot", 0, PP, NO_RECOIL, [], 0, "scoot", 'switches slot[0] character with slot[1] character'),
		new Move("Destiny Doom", 75, 2, NO_RECOIL, [], 0, "")
		]),

	new Player("Kirby", 120, 60, "Kirby", REG,
		[
		new Move("Rock", 20, PP, NO_RECOIL, [], -1, "q:50", 'blocks 50 of incoming attack if can guess attacker'),
		new Move("Super Flash", 85, PP, NO_RECOIL, [], 0, "powlife", 'Only usable with Power Life.'),
		new Move("Suck Up", 0, PP, NO_RECOIL, [], 0, "suckb", '(B) Kirbys 3rd move becomes selected opponents random move.')
		]),

	new Player("Spartan", 200, 45, "Halo", HALO,
		[
		new Move("Turret", 55, PP, NO_RECOIL, [], 0, "haloturret", 'If halo character on team, double damage.'),
		new Move("All Skulls On", -20, PP_1, 20, [], 1, "splash|t:80", 'Gives ally in slot[0] 80HP and both opponents 20HP.')
		]),

	new Player("Cynthia", 200, 70, "Pokemon", POKEMON,
		[
		new Move("Milotic Veil", 20, PP, -20, [], 0, "pokemon:1.5", 'heals 20 HP.'),
		new Move("Lucario Steel", 0, PP_1, NO_RECOIL, [], 0, "magnet", 'draws all opponents attacks to self.'),
		new Move("Garchomp Dragon Rush", 100, 2, 20, [], 0, "pokemon:1.5")
		], 'Cynthia does 1.5x damage to other Pokemon'),

	new Player("Zero Suit Samus", 120, 92, "Metroid", REG,
		[
		new Move("Whiplash", 70, PP, NO_RECOIL, [], 0, "bosses:0.5", 'half damage to bosses.'),
		new Move("Shock", 40, PP, NO_RECOIL, [-40], 0, "cannotKO", 'Keeps going as long as heads, but cannot KO on first hit.')
		], 'Zero Suit Samus nullifies all recoil and self recovery.'),

	new Player("The Arbiter", 190, 72, "Halo", HALO,
		[
		new Move("Smash", 55, PP, NO_RECOIL, [], 0, "halo:3", '3x damage to Spartans and Master Chief.'),
		new Move("Absolute Traitor", 0, 2, NO_RECOIL, [], -2, "absolutetraitor", 'If space, and opponent has 3 active cards, and all allies have > 1/3 max HP, acquires an opps card and halves its HP.'),
		new Move("Final Party (Energy Sword)", 120, PP_1, NO_RECOIL, [], -1, "finalparty", 'Only works if can KO.')
		]),

	new Player("Ike", 180, 40, "Fire Emblem", SWORDS,
		[
		new Move("Aether", 60, PP, NO_RECOIL, [], 0, "aether" , 'Only usable if HP>60.'),
		new Move("Heavy Sword", 30, PP, NO_RECOIL, [], 0, "halo:3", '3x to Halo characters.'),
		new Move("Blade Inferno", 40, PP, 20, [120], 0, "", 'Flip a coin, if heads does 120 damage.')
		]),

	new Player("Donkey Kong", 150, 55, "Donkey Kong", REG,
		[
		new Move("Physicality", 50, PP, NO_RECOIL, [], 0, ""),
		new Move("Slam", 100, PP, 20, [], 0, "kongslam", 'Only works if guaranteed KO.')
		], 'Go Bananas: everytime Donkey Kong KOs attackMultiplier X 1.3'),

	new Player("Toon Link", 140, 71, "Zelda", SWORDS,
		[
		new Move("SupremeSWORDBrawl", 100, PP, NO_RECOIL, [], 0, "cannotKO", 'Cannot KO opponent.'),
		new Move("Swords", 50, PP, NO_RECOIL, [], 0, ""),
		new Move("Shield", 0, 3, NO_RECOIL, [], 1, "shield", 'Blocks an attack from selected opponent.')
		]),

	new Player("Sylux", 200, 45, "Metroid", REG,
		[
		new Move("Greendoom", 40, PP_1, NO_RECOIL, [], 1, ""),
		new Move("Shock Coil", 30, PP, -30, [], 0, "", 'Recover 30 HP.'),
		new Move("Vengeance", 100, PP, 50, [], 0, "")
		]),

	new Player("Marth", 130, 80, "Fire Emblem", SWORDS,
		[
		new Move("Triple Attack", 40, PP, NO_RECOIL, [60, 100], 0, "", "Flip a coin twice. If heads once, 60 damage, if twice 100 damage."),
		new Move("Waterfall", 0, PP, NO_RECOIL, [], -2, "waterfall", "Forces opponent to draw random cards until they have max active cards."),
		new Move("ShineBlowBrawl", 50, PP, NO_RECOIL, [], 0, "q:50", 'blocks 50 damage from selected opp.')
		]),

	new Player("King DeDeDe", 160, 42, "Kirby", REG,
		[
		new Move("Hammering", 40, PP, NO_RECOIL, [], 0, ""),
		new Move("Fatness", 80, PP, NO_RECOIL, [], 0, "t:-20", 'ally in slot[0] loses 20HP.'),
		new Move("Medieval Spirit", 0, PP, NO_RECOIL, [], 1, "z:20|splash", 'decreases all opps speed by 20.')
		]),

	new Player("King Bulbin", 130, 20, "Zelda", REG,
		[
		new Move("Scoot", 0, PP, NO_RECOIL, [], 0, "scoot", 'switches slot[0] character with slot[1] character'),
		new Move("King's Gift", 0, PP, NO_RECOIL, [], 0, "kingsgift", 'gives opp. 100HP and 2x attack multiplier'),
		new Move("Attack Multiplier Switch", 0, PP, NO_RECOIL, [], 0, "attackmultiswitch", 'Switches ally in slot[0] multiplier with selected opp.')
		]),

	new Player("Darkrai", 130, 83, "Pokemon", POKEMON,
		[
		new Move("Full Moon", 45, PP, NO_RECOIL, [], 0, ""),
		new Move("Nasty Plot", 0, 2, 15, [], 0, "s:-15|a:2", 'Cuts HP, Speed by 15, doubles attack multiplier.'),
		new Move("Dark Void", -30, 1, 15, [], 0, "darkvoid", 'Voids all attacks of the turn. Gives opp. 30HP.')
		], 'Resurrection - when KOd it survives at 10HP.'),

	new Player("Wolf", 150, 83, "StarFox", SSF,
		[
		new Move("Weak Laser", 35, PP, NO_RECOIL, [], 0, "splash"),
		new Move("Move Confounding", 0, 2, NO_RECOIL, [], 1, "confound", 'All enemy moves go to random targets.'),
		new Move("Nasty Plot", 0, 2, NO_RECOIL, [], 0, "teamnasty", 'Raises slot[0] attack multiplier 1.5x')
		]),

	new Player("Captain Falcon", 160, 56, "f-zero", REG,
		[
		new Move("Zero Kick", 50, PP, NO_RECOIL, [], 0, "y:0.8|z:20", 'sets opp multiplier to 0.8, reduces their speed 20.'),
		new Move("Fear Strike", 20, PP, NO_RECOIL, [], 0, "", 'Sets all opps attack Multipliers to 1.'),
		new Move("Falcon Punch", 100, PP_1, NO_RECOIL, [], 0, "")
		]),

	new Player("Pit", 130, 70, "???", REG,
		[
		new Move("Duo-Blade", 40, PP, NO_RECOIL, [], 0, ""),
		new Move("Arrow", 20, PP, NO_RECOIL, [50], 0, "splash", 'Flip a coin. If heads, does 50 damage. Splash')
		], 'Stability: caps all moves damage at 100.'),

	new Player("Falco", 120, 90, "StarFox", SSF,
		[
		new Move("Electricity", 50, PP, NO_RECOIL, [], 0, ""),
		new Move("Reflector", 0, PP, NO_RECOIL, [], 0, "reflect", 'The selected opp, if attacking this character, will have their attack reflected back at them.'),
		new Move("Magnet", 0, PP_1, NO_RECOIL, [], 0, "magnet", 'Draws all opp attacks to self.')
		]),

	new Player("Rayquaza", 180, 77, "Pokemon", POKEMON,
		[
		new Move("Dragon Claw", 40, PP, NO_RECOIL, [], 0, ""),
		new Move("HP Switch", 0, 2, 30, [], 0, "hpswitch", 'Switches HP with opponent.'),
		new Move("Hyper Beam", 130, PP, NO_RECOIL, [], -1, "recover")
		]),

	new Player("Master Chief", 220, 60, "Halo", HALO,
		[
		new Move("Lasso", 40, PP, NO_RECOIL, [], 0, "boss:3|z:10", 'Does 3x to bosses, cuts opp. speed by 10.'),
		new Move("Spray and Pray", 30, 1, NO_RECOIL, [], 0, "confound", 'Confounds enemys moves to random targets.'),
		new Move("Boost Up", 0, PP, NO_RECOIL, [], 0, "a:1.5")
		], 'Prevents opp. from switching when on field.'),

	new Player("Greninja", 140, 94, "Pokemon", POKEMON,
		[
		new Move("Surfer's Scald", 55, 2, NO_RECOIL, [], 0, "splash"),
		new Move("Protean", 30, 2, NO_RECOIL, [], 0, "shield", 'Absorbs an attack from selected opponent.'),
		new Move("Dark Water", 10, PP, NO_RECOIL, [], 0, "")
		], 'Every turn 3rd move becomes random move from random opp.'),

	new Player("Meta Knight", 140, 75, "Kirby", SWORDS,
		[
		new Move("Flash", 30, PP, NO_RECOIL, [30], 1, "", "Flip a coin, keeps going as long as heads."),
		new Move("Tornado", 0, 2, NO_RECOIL, [], 0, "firepush", 'forces opp. to switch. out'),
		new Move("Meta Attack", 150, PP, NO_RECOIL, [], 0, "a:1.5", 'sets attack multiplier x1.5')
		], 'Mach Tornado - Opp. cannot switch out when Meta Knight in play.'),

	new Player("Tabuu", 170, 10, "Brawl", BOSS,
		[
		new Move("X-Lazer", 90, PP, NO_RECOIL, [], 0, ""),
		new Move("Devastating Destruction", 50, PP_1, NO_RECOIL, [200], 0, "", 'Flip a coin, if heads does 200 damage.')
		]),

	new Player("Mario", 130, 68, "Super Mario", REG,
		[
		new Move("Super Mario", 60, PP, NO_RECOIL, [], 0, "supermario", 'uses opponents attack multiplier'),
		new Move("Gift of Shrooms", 0, PP_1, NO_RECOIL, [], 0, "shroomgift", 'Gives all opps 2x attack multiplier, but sets all their moves to need recovery.'),
		new Move("Push of Fire", 0, 2, NO_RECOIL, [], -1, "firepush", 'forces opp. to switch out.')
		]),

	new Player("Solid Snake", 160, 50, "Metal Gear Solid", REG,
		[
		new Move("Solid Missile", 50, PP, NO_RECOIL, [], 0, ""),
		new Move("Howitzer", 30, PP, 30, [], 0, "t:30")
		], 'Anti-air defense - voids all attacks with >100 damage.'),

	new Player("Ness", 130, 79, "Earthbound", REG,
		[
		new Move("PK Fire", 20, PP, NO_RECOIL, [], 0, "y:0.7|t:20", 'cuts opp. attack multiplier to 0.7x, heals ally 20.'),
		new Move("PK Thunder Self", 40, 2, NO_RECOIL, [140], 0, ""),
		new Move("PP Gift", 0, PP, NO_RECOIL, [], 0, "ppgift", 'Fully restores PP of ally adj. from opp.')
		]),

	new Player("Roy", 150, 65, "Fire Emblem", SWORDS,
		[
		new Move("Tri Sword", 30, PP, NO_RECOIL, [], 0, "swords:3", '3x damage to sword wielders'),
		new Move("Bold Blade", 0, PP_1, NO_RECOIL, [], 0, "fullshield", 'Blocks ALL attacks to self in turn.'),
		new Move("Knee Cut", 0, PP_1, NO_RECOIL, [], 0, "kneecut", 'Sets HP, speed to 20, switches teams.')
		]),

	new Player("Bowser", 200, 40, "Super Mario", BOSS,
		[
		new Move("Flamethrower", 50, PP, NO_RECOIL, [], 0, ""),
		new Move("Giga Impact", 100, PP_1, NO_RECOIL, [], -1, ""),
		]),

	new Player("Revenant Dragon", 20, 90, "Brawl", REG,
		[
		new Move("DragoonFury", 100, PP, NO_RECOIL, [], 0, ""),
		new Move("PredatorBrawl", 40, PP, NO_RECOIL, [], 0, "halo:3", '3x damage to Halo characters.'),
		]),

	new Player("ODST", 200, 65, "Halo", HALO,
		[
		new Move("ODST Tech.", 0, PP, NO_RECOIL, [], 0, "technician", 'Boosts adj. ally attacks with <40+ power *1.5'),
		new Move("ODST Justice", 20, PP, NO_RECOIL, [], 0, "q:30", ''),
		]),


];

//name, power, maxpp, recoil, coinflip, priority, specCode



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



var COMMANDLINE = 'commandline';
var COMMANDLINEREQUEST = 'cmlr'; 
var COMMANDLINEONLY = 'cmlo';
var COMMANDLINETACK = 'commandlinetack';
var HUD = 'hud';

var SLEIGHTOFHAND = "sleight";
var UPDATEHAND = "updatehand";
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

var io, p1, p2; //***reset***




var switching = -1;
var cpuSwitching = -1;

var disableButtons = true; //***onwin*** sets these to true
var cpuDisableButtons = true;

var winner = 0; //-1 is CPU, 1 is player //***reset***
var MAX_ACTIVE = 3;
var SWAP_CODE = 8;

var TEAM_SIZE = 8;
var CPU_TEAM_SIZE = 8;

var HAND_SIZE = 3;
var MIN_FOR_BONUS = 3; //total players required for bonus round


var darkVoid = false; //***reset*** all of these
var confounding = -1;
//				p, cpu
var magnet = [-1, -1];
var stability = false;


function docPrint(text) {
	io.emit(COMMANDLINE, text);
}

function docTack(text) {
	io.emit(COMMANDLINETACK, text);
}

function docText(sock, text) {
	sock.emit(COMMANDLINE, text);
}

function docChat(text) {
	io.emit(COMMANDLINEONLY, text);
}

function hudSend(sock, text) {
	sock.emit(HUD, text);
}


function random(min, max) {
	return Math.floor(Math.random() * (max - min) ) + min;
}

function adjHP(hp) {
	return parseInt(hp*HP_MULTIPLIER);
}

var characters = shuffle(CHARACTERS);

//player and CPU distribute characters
var arrcount = 0; //***reset*** all of these thru activeChars
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

function datSock(isCpu) {
	if (isCpu == 0)
		return p1;
	return p2;
}

function opt(isCpu) {
	if (isCpu == 0)
		return "P1's ";
	return "P2's ";
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
		docText(p1, "Already " + MAX_ACTIVE + " players in.");
		return;
	}
	var chosenOne = hand[choice];
	hand.splice(choice, 1); //remove it from the hand
	activeChars.push(chosenOne);
	docText(p1, "Go! " + chosenOne.name + "!");

	//push rando into the hand.
	if (arrcount < TEAM_SIZE) {
		hand.push(arr[arrcount]);
		arrcount++;
	}
	updateCards();
	updateHand(1);
}

function cpuDeploy(choice) {
	if (winner != 0)
		return;
	if (choice >= cpuhand.length)
		return;

	//in this case it's not key -1
	if (cpuActiveChars.length >= MAX_ACTIVE) {
		docText(p2, "Already " + MAX_ACTIVE + " players in.");
		return;
	}
	var chosenOne = cpuhand[choice];
	cpuhand.splice(choice, 1); //remove it from the hand
	cpuActiveChars.push(chosenOne);
	docText(p2, "Go! " + chosenOne.name + "!");

	//push rando into the hand.
	if (cpuarrcount < TEAM_SIZE) {
		cpuhand.push(cpuarr[cpuarrcount]);
		cpuarrcount++;
	}
	updateCards();
	updateHand(2);
}

function setPlayerColor(sock, index, color) {
	sock.emit(GRAPHICS, [SETPLAYERCOLOR, index, color]);
}

function setOppColor(sock, index, color) {
	sock.emit(GRAPHICS, [SETOPPCOLOR, index, color]);
}

function setMoveColor(sock, pIndex, mIndex, color) {
	sock.emit(GRAPHICS, [SETMOVECOLOR, pIndex, mIndex, color]);
}

function setHandColor(sock, index, color) {
	sock.emit(GRAPHICS, [SETHANDCOLOR, index, color]);
}


function updateCards() { //change procedure
	p1.emit(UPDATECARDS, [activeChars, cpuActiveChars]);
	p2.emit(UPDATECARDS, [cpuActiveChars, activeChars]);
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

		updateHand(1);
	} else {
		if (cpuActiveChars[activeIndex].type!=POKEMON)
			cpuActiveChars[activeIndex].hp -= 30;
		temp = cpuActiveChars[activeIndex];
		cpuActiveChars[activeIndex] = cpuhand[handIndex];
		cpuhand[handIndex] = temp;
		docTack(temp.name + " switched out for " + cpuActiveChars[activeIndex].name + "!");

		updateHand(2);
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
	var sock = datSock(arrKey);
	var oppsock = datSock(ozs(arrKey));

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
		setPlayerColor(sock, ind, '#fff');
		setOppColor(oppsock, ind, '#fff');
	}

	//recovering happens really early.
	if (arr[ind].turnDisable) {
		quitIt(pref+arr[ind].name+ " must recover!");
		arr[ind].turnDisable=false;
		return;
	}

	if (move == SWAP_CODE) {
		arr[ind].attackMultiplier=1;
		godSwap(arrKey, ind, opp);
		setPlayerColor(sock, ind, '#fff');
		setOppColor(oppsock, ind, '#fff');
		return;
	}

	function rDmg(movePower) { //calculates actual damage
		var nmp = movePower;
		var t1 = arr[ind].type;
		var t2 = oarr[opp].type;
		if ((t1+1)%5 == t2)
			nmp *= 1.5;
		if (t1 == SWORDS && t2 == BOSS)
			nmp = movePower*2;
		return parseInt( arr[ind].attackMultiplier * nmp );
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
		setOppColor(sock, opp, '#e74c3c');
		setPlayerColor(oppsock, opp, '#e74c3c');
		return;
	}
	if (m.name=="Magic Punch"&&oarr[opp].speed>=80) {
		quitIt("Magic Punch failed! Opponent must have < 80 speed.")
		setOppColor(sock, opp, '#e74c3c');
		setPlayerColor(oppsock, opp, '#e74c3c');
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
		setOppColor(sock, opp, "#e74c3c");
		setPlayerColor(oppsock, opp, '#e74c3c');
		return;
	}

	if (m.specCode == "teamnasty") {
		docTack(pref + arr[0].name + " raised attack multiplier to " + arr[0].attackMultiplier);
		arr[0].attackMultiplier *= 1.5;
	}
	if (m.specCode == "technician") {
		if (opp < arr.length) {
			docTack(arr[opp].name + " attacks were boosted!");
			for (var iio=0; iio < arr[opp].moves.length; iio++)
				if (arr[opp].moves[iio].power <= 40)
					arr[opp].moves[iio].power = parseInt(arr[opp].moves[iio].power * 1.5);
		}
	}
	if (m.specCode == "supermario")
		damage = parseInt(oarr[opp].attackMultiplier * arr[ind].moves[move].power);
	if (m.specCode == "kingsgift") {
		oarr[opp].hp += 100;
		oarr[opp].attackMultiplier *= 2;
		docTack(po + " was gifted 100HP and 2x attack multiplier!");
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
			setOppColor(sock, oarr.length-1, '#fff');
			setPlayerColor(oppsock, oarr.length-1, '#fff');
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

			setPlayerColor(sock, arr.length-1, '#e74c3c');
			setOppColor(oppsock, arr.length-1, '#e74c3c');
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

			setPlayerColor(sock, arr.length-1, '#e74c3c');
			setOppColor(oppsock, arr.length-1, '#e74c3c');
			updateCards();
		} else {
			docTack("Absolute traitor failed!");
		}
	}

	updateCards();
	setPlayerColor(sock, ind, '#fff');
	setOppColor(oppsock, ind, '#fff');

	setOppColor(sock, opp, '#e74c3c');
	setPlayerColor(oppsock, opp, '#e74c3c');

}





//****************************************************************************************************
//****************************************************************************************************
//****************************************************************************************************
//****************************************************************************************************
//					^^^VALUES /// MAIN
//****************************************************************************************************
//****************************************************************************************************
//****************************************************************************************************
//****************************************************************************************************
//**************************************************
//					^^^VALUES /// MAIN
//****************************************************************************************************
//****************************************************************************************************
//****************************************************************************************************
//****************************************************************************************************
//					^^^VALUES /// MAIN
//****************************************************************************************************
//****************************************************************************************************
//****************************************************************************************************
//****************************************************************************************************

function resetAll() {
	winner = 0;
	darkVoid = false; //***reset*** all of these
	confounding = -1;
	//				p, cpu
	magnet = [-1, -1];
	stability = false;

	characters = shuffle(CHARACTERS);

	//player and CPU distribute characters
	arrcount = 0; //***reset*** all of these thru activeChars
	cpuarrcount = 0;
	arr = characters.slice(0, TEAM_SIZE);
	cpuarr = characters.slice(TEAM_SIZE, TEAM_SIZE+CPU_TEAM_SIZE);

	//distribute players to each player and cpu hand
	hand = arr.slice(0, HAND_SIZE);
	cpuhand = cpuarr.slice(0, HAND_SIZE);
	arrcount = cpuarrcount = HAND_SIZE;

	activeChars = [];
	cpuActiveChars = [];

	turnCount = 1;
	disableButtons = true;
}

exports.startGame = function(iosock, sock1, sock2) {
	io = iosock;
	p1 = sock1;
	p2 = sock2;
	disableButtons = false;
	cpuDisableButtons = false;
	docPrint("Who will you play?");

	updateHand(1);
	updateHand(2);
	updateCards();

	p1.on(SLEIGHTOFHAND, sleightOfHand);
	p2.on(SLEIGHTOFHAND, cpuSleightOfHand);

	p1.on(CHOOSEMOVE, chooseMove);
	p2.on(CHOOSEMOVE, cpuChooseMove);

	p1.on(COMMANDLINEREQUEST, processRequest);
	p2.on(COMMANDLINEREQUEST, processCpusRequest);

	p1.on(CHOOSESWITCH, chooseSwitch);
	p2.on(CHOOSESWITCH, chooseSwitchC);

	p1.on(MOVEDESC, moveDesc);
	p2.on(MOVEDESC, moveDescC);

	p1.on(ATTACKOTHER, function (x) {
		if (switching == -1)
			attackCpu(x);
	});
	p2.on(ATTACKOTHER, function (x) {
		if (cpuSwitching == -1)
			attackP(x);
	});

	p1.on('disconnect', function() {
		resetAll();
	});
	p2.on('disconnect', function() {
		resetAll();
	});
}

function updateHand(integre) {
	if (integre == 1)
		p1.emit(UPDATEHAND, hand);
	else
		p2.emit(UPDATEHAND, cpuhand);
}

function sleightOfHand(index) {

	if (switching == -1) {
		if (disableButtons)
			return;
		drawFromHand(index);
	} else {
		if (index >= hand.length)
			return;
		setHandColor(p1, index, "#F5AB35");
		attackCpu(index);
	}
	switching = -1;
}
function cpuSleightOfHand(index) {

	if (cpuSwitching == -1) {
		if (cpuDisableButtons)
			return;
		cpuDeploy(index);
	} else {
		if (index >= cpuhand.length)
			return;
		setHandColor(p2, index, "#F5AB35")
		attackP(index);
	}
	cpuSwitching = -1;
}

function victoryCheck() {
	if (cpuActiveChars.length == 0 && cpuhand.length == 0) {
		docPrint("PLAYER 1 Wins!");
		winner = 1;
		resetAll();
	} else if (activeChars.length == 0 && hand.length == 0) {
		docPrint("PLAYER 2 Wins!");
		winner = -1;
		resetAll();
	}
}

//currently the characters are loaded. This indicates a turn.
var turnCount = 1; //***reset***


//take input from player for who they will play in the battlefield, randomize for CPU
//remove from hand and put into battlers

var p1ready = false;
var p2ready = false;
var turnSpeeds = [];

function checkP1Ready(inputs) {
	//swap input would be like: movechoice: SWAP INDEX, opponentIndex = index of card in hand.
	//CHOOSE ATTACKS
	for (var i = 0; i < activeChars.length; i++) {
		clean(0, i);
		//player order calculation and transmission
		var opponentIndex = parseInt(inputs[2*i+1]);
		var moveData;
		if (inputs[2*i]==SWAP_CODE) {
			moveData = {
				player: true, index: i, opp: opponentIndex, speedDiff: 0, moveChoice: SWAP_CODE, prior: 0
			}
		} else {
			moveData = {
				player: true,
				index: i,
				opp:opponentIndex, 
				speedDiff: activeChars[i].speed - cpuActiveChars[opponentIndex].speed,
				moveChoice: inputs[2*i],
				prior: activeChars[i].moves[inputs[2*i]].priority
			}
				
		}

		//procedure for redoing turn over here, also do for CPU!
		var attackPossible = isAttackPossible(moveData);
		
		if (!attackPossible[0]) {
			docText(p1, attackPossible[1]);
			resetMoveChoices(0);
			disableButtons = false;
			return;
		}

		if (inputs[2*i]!=SWAP_CODE && activeChars[i].moves[inputs[2*i]].isSplash) { //splash damage
			for (var ki=0;ki<cpuActiveChars.length;ki++) {
				turnSpeeds.push({
					player: true, index: i, opp: ki, speedDiff: activeChars[i].speed - cpuActiveChars[ki].speed,
					moveChoice: moveData.moveChoice, prior: moveData.prior
				});
			}
		} else {
			turnSpeeds.push(moveData);
		}
	}
	p1ready = true;
	//end of function
}

function checkP2Ready(inputs2) {
	for (var i = 0; i < cpuActiveChars.length; i++) {
		clean(1, i);

		var opponentIndex = parseInt(inputs2[2*i+1]);
		var moveData;
		if (inputs2[2*i]==SWAP_CODE) {
			moveData = {
				player: false, index: i, opp: opponentIndex, speedDiff: 0, moveChoice: SWAP_CODE, prior: 0
			}
		} else {
			moveData = {
				player: false,
				index: i,
				opp:opponentIndex, 
				speedDiff: cpuActiveChars[i].speed - activeChars[opponentIndex].speed,
				moveChoice: inputs2[2*i],
				prior: cpuActiveChars[i].moves[inputs2[2*i]].priority
			}
				
		}

		//procedure for redoing turn over here, also do for CPU!
		var attackPossible = isAttackPossible(moveData);
		
		if (!attackPossible[0]) {
			docText(p2, attackPossible[1]);
			resetMoveChoices(1);
			cpuDisableButtons = false;
			return;
		}
		if (inputs2[2*i]!=SWAP_CODE && cpuActiveChars[i].moves[inputs2[2*i]].isSplash) { //splash damage
			for (var ki=0;ki<activeChars.length;ki++) {
				turnSpeeds.push({
					player: false, index: i, opp: ki, speedDiff: cpuActiveChars[i].speed - activeChars[ki].speed,
					moveChoice: moveData.moveChoice, prior: moveData.prior
				});
			}
		} else {
			turnSpeeds.push(moveData);
		}
		
	}
	p2ready = true;
	//end of function
}

function playTurn() {
	docPrint("<br>"+"Turn " + turnCount);

	//compare function to sort the "turnSpeeds" objects.
	function tspoComp(a, b) {
		//MUST FACTOR IN THE PRIORITY OF THE MOVES!!!
		if (a.prior > b.prior)
			return -1;
		if (a.prior < b.prior)
			return 1;
		if (a.speedDiff > b.speedDiff)
			return -1;
		return 1;
	}

	//*************************
	//global variables for magic
	//*************************
	darkVoid = false;
	confounding = -1;
	magnet[0] = magnet[1] = -1;
	stability = false;

	resetMoveChoices(0);
	resetMoveChoices(1);
	//swap input would be like: movechoice: SWAP INDEX, opponentIndex = index of card in hand.

	//sort turnSpeeds by number
	turnSpeeds.sort(tspoComp);

	//THE EXTRA TURN
					  //i.e. (fs[i-1],fs[i]-1):(0,255),(255,280), (280,280) (280,430)
	var fs = []; //indicates each ending index. [255,      280,  280,   430]
	var fTotal = 0; //denominator
	var exMoveData = {};
	var arr, oarr, lwi;

	//rules: outnumbered = redistribute likeliness of getting it.
	for (var iik=0;iik<turnSpeeds.length;iik++) {
		if (turnSpeeds[iik].player) {
			arr=activeChars;
			oarr=cpuActiveChars;
		} else {
			arr=cpuActiveChars;
			oarr=activeChars;
		}
		var lottery = 0;
		if (arr.length<=oarr.length)
			lottery=parseInt(500*HP_MULTIPLIER)-arr[turnSpeeds[iik].index].hp-arr[turnSpeeds[iik].index].maxhp;	
		fTotal += lottery; //240
		fs.push(fTotal); //100, 250, 400, 900
	}

	var lotteryWinner = parseInt(Math.random()*fTotal);

	for (lwi=0;lwi<fs.length;lwi++)
		if (fs[lwi]>=lotteryWinner)
			break;

	exMoveData={
		player: turnSpeeds[lwi].player,
		index: turnSpeeds[lwi].index,
		opp: turnSpeeds[lwi].opp,
		speedDiff: 0,
		moveChoice: turnSpeeds[lwi].moveChoice,
		prior: -25
	}

	if (arr.length+oarr.length>=MIN_FOR_BONUS) {
		turnSpeeds.push(exMoveData); //will have to check if Possible afterward.

		var extraTurnAnnouncement;
		if (exMoveData.player)
			extraTurnAnnouncement = activeChars[exMoveData.index].name + " received the extra turn! ";
		else
			extraTurnAnnouncement="P2's " + cpuActiveChars[exMoveData.index].name + " received the extra turn! ";
	} //extra turn only happens sometimes


	//shortened for debugging purposes, normally is: 2200, 500, 1500
	var WAIT_TIME_PER_ATTACKER = 4000;
	var WAIT_TIME_FULL_UPDATE = (turnSpeeds.length)*WAIT_TIME_PER_ATTACKER+250;
	var FINAL_WAIT = 1500;

	//DO THE ATTACKS
	for (var i = 0; i < turnSpeeds.length; i++) {
		setTimeout(function(k){

			var arrKey = 1;
			if (turnSpeeds[k].player)
				arrKey = 0;
			docPrint("");

			//extra turn
			if (turnSpeeds[k].prior==-25) {
				docPrint(extraTurnAnnouncement);
				var attackPossible = isAttackPossible(turnSpeeds[k]);
				if (!attackPossible[0]) {
					docTack("Extra turn failed. " + attackPossible[1]);
					return;
				}
			}

			doTheAttack(arrKey, turnSpeeds[k].index, turnSpeeds[k].opp, turnSpeeds[k].moveChoice);
			
		},i*WAIT_TIME_PER_ATTACKER, i);
	}
	


	function filterDead(fighter) {
		return fighter.hp>0;
	}

	setTimeout(function(){
		//remove dead characters from the stage.
		activeChars = activeChars.filter(filterDead);
		cpuActiveChars = cpuActiveChars.filter(filterDead);
		updateCards();

		setTimeout(function(){
			updateCards();
			turnSpeeds = [];
			p1ready = false;
			p2ready = false;
			//cpuCC.innerHTML = "CPU Hand: " + cpuhand.length + " cards";
			docPrint("all cards ready.")
			victoryCheck();
			turnCount++;
			//turnCounter.innerHTML = "Turn " + turnCount;
			disableButtons = false;
			cpuDisableButtons = false;
		}, FINAL_WAIT);
	}, WAIT_TIME_FULL_UPDATE);

}

function chooseSwitch(playerIndex) {
	if (disableButtons)
		return;
	if (activeChars.length <= playerIndex)
		return;
	if (choices[2*playerIndex] != -1)
		return;
	if (key != -1)
		return;
	if (hand.length == 0)
		return;
	choices[2*playerIndex] = SWAP_CODE; //8 
	key = switching = playerIndex;
	setPlayerColor(p1, playerIndex, '#F5AB35');
}

function chooseSwitchC(cpuIndex) {
	if (cpuDisableButtons)
		return;
	if (cpuActiveChars.length <= cpuIndex)
		return;
	if (cpuChoices[2*cpuIndex] != -1)
		return;
	if (cpuKey != -1)
		return;
	if (cpuhand.length == 0)
		return;
	cpuChoices[2*cpuIndex] = SWAP_CODE; //8 
	cpuKey = cpuSwitching = cpuIndex;
	setPlayerColor(p2, cpuIndex, '#F5AB35');
}

/*
moveDescC
*/
//a function used for hovering over the moves (extra)
function moveDesc(arr) {
	var person = arr[0];
	var move = arr[1];
	if (disableButtons)
		return;
	if (person >= activeChars.length)
		return;
	if (move >= activeChars[person].moves.length)
		return;
	var x = activeChars[person].moves[move];
	//pMoves[person][move].innerHTML = x.name + ": " + x.description;
	hudSend(p1, x.description);
}

//a function used for hovering over the moves (extra)
function moveDescC(arr) {
	var person = arr[0];
	var move = arr[1];
	if (cpuDisableButtons)
		return;
	if (person >= cpuActiveChars.length)
		return;
	if (move >= cpuActiveChars[person].moves.length)
		return;
	var x = cpuActiveChars[person].moves[move];
	//pMoves[person][move].innerHTML = x.name + ": " + x.description;
	hudSend(p2, x.description);
}

var key = -1; //makes sure you have to choose an enemy before choosing next players moves
var cpuKey = -1;

var choices = [];
var cpuChoices = [];

for (var i=0;i<2*MAX_ACTIVE;i++) {
	choices.push(-1);
	cpuChoices.push(-1);
}

function chooseMove(x) { //check if active player in that spot.
	var playerIndex = x[0]; //which dude;
	var moveIndex = x[1];

	if (disableButtons)
		return;
	if (activeChars.length <= playerIndex) //empty, or only 1 remaining
		return;
	if (moveIndex >= activeChars[playerIndex].moves.length)
		return;
	if (choices[2*playerIndex] != -1)
		return;
	if (key != -1)
		return;
	choices[2*playerIndex] = moveIndex;
	key = playerIndex;
	setMoveColor(p1, playerIndex, moveIndex, "#fff");
}

function cpuChooseMove(x) { //check if active player in that spot.
	var playerIndex = x[0]; //which dude;
	var moveIndex = x[1];

	if (cpuDisableButtons)
		return;
	if (cpuActiveChars.length <= playerIndex) //empty, or only 1 remaining
		return;
	if (moveIndex >= cpuActiveChars[playerIndex].moves.length)
		return;
	if (cpuChoices[2*playerIndex] != -1)
		return;
	if (cpuKey != -1)
		return;
	cpuChoices[2*playerIndex] = moveIndex;
	cpuKey = playerIndex;
	setMoveColor(p2, playerIndex, moveIndex, "#fff");
}


//either the cpuIndex or the index of the card in hand for swap
function attackCpu(cpuIndex) {
	if (key == -1)
		return;
	//NOT SWAPPING
	if (choices[2*key] != SWAP_CODE) {
		if (cpuIndex >= cpuActiveChars.length)
				return;
		setOppColor(p1, cpuIndex, "#F5AB35");
	}
	choices[2*key+1] =cpuIndex;
	key = -1;

	for (var i = 0; i < 2*activeChars.length; i++)
		if (choices[i] == -1)
			return;
	//means all players have attacked.
	disableButtons = true;

	checkP1Ready(choices);
	
	if (p1ready && p2ready)
		playTurn(); //resets both
}

//either the cpuIndex or the index of the card in hand for swap
function attackP(pIndex) {
	if (cpuKey == -1)
		return;
	//NOT SWAPPING
	if (cpuChoices[2*cpuKey] != SWAP_CODE) {
		if (pIndex >= activeChars.length)
				return;
		setOppColor(p2,  pIndex, "#F5AB35");
	}
	cpuChoices[2*cpuKey+1] =pIndex;
	cpuKey = -1;

	for (var i = 0; i < 2*cpuActiveChars.length; i++)
		if (cpuChoices[i] == -1)
			return;
	//means all players on this team have attacked.
	cpuDisableButtons = true;
	
	checkP2Ready(cpuChoices);

	if (p1ready && p2ready)
		playTurn();
}

function processRequest(query) {
	if (typeof dict[query] !== "undefined") {
		console.log(typeof dict[query]);
		console.log(dict[query].description);
		p1.emit(COMMANDLINEONLY, '<br>' + dict[query].description);
	} else if (typeof movesDict[query] !== "undefined") {
		p1.emit(COMMANDLINEONLY, '<br>' + movesDict[query].description);
	} else {
		docChat('P1: ' + query);
	}
}

function processCpusRequest(query) {
	if (typeof dict[query] !== "undefined") {
		p2.emit(COMMANDLINEONLY, '<br>' + dict[query].description);
	} else if (typeof movesDict[query] !== "undefined") {
		p2.emit(COMMANDLINEONLY, '<br>' + movesDict[query].description);
	} else {
		docChat('P2: ' + query);
	}
}

function resetMoveChoices(isCpu) {
	if (isCpu == 0) {
		choices = [];
		for (var ii=0;ii<2*MAX_ACTIVE;ii++)
			choices.push(-1);
		for (var ji=0;ji<MAX_ACTIVE;ji++) {
			if (ji < activeChars.length)
				setPlayerColor(p1, ji, "#6C7A89");
			if (ji < cpuActiveChars.length)
				setOppColor(p1, ji, "#6C7A89");
			for (var i=0;i<3;i++)
				setMoveColor(p1, ji, i, "#D1D5D8");
		}
		for (var ji=0;ji<HAND_SIZE;ji++)
			setHandColor(p1, ji, "#fff");
	} else {
		cpuChoices = [];
		for (var ii=0;ii<2*MAX_ACTIVE;ii++)
			cpuChoices.push(-1);
		for (var ji=0;ji<MAX_ACTIVE;ji++) {
			if (ji < cpuActiveChars.length)
				setPlayerColor(p2, ji, "#6C7A89");
			if (ji < activeChars.length)
				setOppColor(p2, ji, "#6C7A89");
			for (var i=0;i<3;i++)
				setMoveColor(p2, ji, i, "#D1D5D8");
		}
		for (var ji=0;ji<HAND_SIZE;ji++)
			setHandColor(p2, ji, "#fff");
	}
}




