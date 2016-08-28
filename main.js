String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

var Game = {};

Game.data = {
	techs: {
		"Language":{
			cost:15, 
			techInfo:"Language is the basis of all communication. It will allow knowledge to be shared between people of your tribe", 
			effects: "Base science production increased by 2.",
			required:[],
			apply: function(){
				Game.context.baseScience += 2;
			}
		},
		"Simple_Tools":{
			cost:15, 
			techInfo:"Simple Tools is the starting point of technology. Sharp sticks and rocks allow tasks to be done better than bare hands. All other technology depends upon the ability to make tools. It will give your tribe a better chance at hunting and gathering.", 
			effects: "Food per hunter is boosted by 20%.",
			required:[],
			apply: function(){
				Game.data.roles['hunter'].food *= 1.2;
			}
		},
		"Storytelling":{
			cost:50, 
			techInfo:"Storytelling allows your tribe to teach their young valuable lessons. Technology is conserved between generations through Storytelling.", 
			effects: "A storyteller will appear in your unborn people.",
			required:["Language"],
			apply: function(){
				Game.context.unborn.push('storyteller');
			}
		},
		"Division_of_labour":{
			cost:50, 
			techInfo:"Dividing the jobs that need to be done is the core concept of cooperation. Cooperation will allow a tribe to be more than the sum of its individuals.", 
			effects: "Food per hunter increased by 20%.",
			required:["Language", "Simple_Tools"],
			apply: function(){
				Game.data.roles['hunter'].food *= 1.2;
			}
		},
		"Advanced_Tools":{
			cost:50, 
			techInfo:"Advanced tools are tools that you need other tools in order to create. Shovels, spears, looms and the like will give a tribe a big advantage.", 
			effects: "Food per hunter increased by 1.",
			required:["Simple_Tools"],
			apply: function(){
				Game.data.roles['hunter'].food += 1;
			}
		},
		"Mythology":{
			cost:100, 
			techInfo:"Mythology is the first attempt at explaining the unknown. Even the most basic model of reality can be correct now and then. And predicting seasons and other recurring events is very useful.", 
			effects: "Storytellers boost overall science production by 5% each.",
			required:["Storytelling"],
			apply: function(){
				Game.data.roles['storyteller'].scienceMultiplier += 0.05;
			}
		},
		"Culture":{
			cost:100, 
			techInfo:"Culture is the identity of your people. When your people have developed a Culture, they will have something that bring them together beyond sheer convenience.", 
			effects: "You may now order your unborn by clicking them.",
			required:["Storytelling", "Division_of_labour"],
			apply: function(){
				Game.context.controlUnborn = true;
			}
		},
		"Agriculture":{
			cost:100, 
			techInfo:"Agriculture is a huge step up from hunting. A farmer produces more food than a hunter does, and more time is left over to do other things, like developing technology.", 
			effects: "Hunters become farmers.",
			required:["Division_of_labour", "Advanced_Tools"],
			apply: function(){
				Game.data.roles['oldhunter'] = Game.data.roles["hunter"];
				Game.data.roles["hunter"] = Game.data.roles['farmer'];
			}
		},
		"Raiding":{
			cost:100, 
			techInfo:"Why spend all this time gathering and hunting, when we can watch others do it, and then take it from them?", 
			effects: "A raider is added to your unborn.",
			required:["Advanced_Tools"],
			apply: function(){
				Game.context.unborn.push('raider');
			}
		},
		"Logic":{
			cost:200, 
			techInfo:"Logic is more rigorous than Mythology. It is a method for determining truth beyond guessing. It will be essential in figuring out how the world works.", 
			effects: "Storytellers now increase science an additional 10% each.",
			required:["Mythology"],
			apply: function(){
				Game.data.roles['storyteller'].scienceMultiplier += 0.1;
			}
		},
		"Trade":{
			cost:200, 
			techInfo:"Trade is a way of getting more of what we need in exchange for what we have too much of. Trade also spreads ideas and technology over farther distances.", 
			effects: "A trader is added to your unborn.",
			required:["Culture"],
			apply: function(){
				Game.context.unborn.push('trader');
			}
		},
		"Cities":{
			cost:200, 
			techInfo:"When there is a surplus of food, and no longer a need to move around, it becomes natural to live close to each other. Cities allows further cooperation.", 
			effects: "Doubles production of Food.",
			required:["Culture", "Agriculture"],
			apply: function(){
				Game.context.baseFoodMultiplier *= 2;
			}
		},
		"Specialists":{
			cost:200, 
			techInfo:"The people who do not contribute directly to the production of food, are specialists. Specialists will take care of especially difficult tasks that many people have a need to get done.", 
			effects: "Traders, Storytellers Raiders and Soldiers consume 20% less food.",
			required:["Agriculture"],
			apply: function(){
				Game.data.roles['trader'].food *= 0.8;
				Game.data.roles['storyteller'].food *= 0.8;
				Game.data.roles['raider'].food *= 0.8;
				Game.data.roles['soldier'].food *= 0.8;
			}
		},
		"Roads":{
			cost:400, 
			techInfo:"Roads are large cooperative efforts that allows wagons with larger cargos to be moved further, faster and easier. Roads make everything more efficient.", 
			effects: "The effect of traders doubles.",
			required:["Trade", "Cities"],
			apply: function(){
				Game.data.roles['trader'].science *= 2;
				Game.data.roles['trader'].goods *= 2;
				Game.data.roles['trader'].corruption *= 2;
			}
		},
		"Construction":{
			cost:700, 
			techInfo:"Construction is the difficult art of creating large, sturdy and functional structures. It is one of the first forms of higher education.", 
			effects: "Goods production increased by 5.",
			required:["Cities", "Specialists"],
			apply: function(){
				Game.context.baseGoods += 5;
			}
		},
		"Soldiers":{
			cost:400, 
			techInfo:"A Soldier is the most expensive type of specialst a community can have. It does not contribute to anything useful. It is also the most expensive specialist to lack.", 
			effects: "Raiders become Soldiers.",
			required:["Specialists", "Raiding"],
			apply: function(){
				Game.data.roles['oldraider'] = Game.data.roles["raider"];
				Game.data.roles["raider"] = Game.data.roles['soldier'];
			}
		},
		"Aesthetics":{
			cost:700, 
			techInfo:"Aesthetics is the study of beauty. The profoundness of beauty is not easy to capture in concrete terms, but it is not considered useless.", 
			effects: "Your produced goods is permanently increased by an amount equal to your current produced science.",
			required:["Logic"],
			apply: function(){
				Game.context.baseGoods  = Number(Game.context.scienceProduction + Game.context.baseGoods);
			}
		},
		"Ethics":{
			cost:700, 
			techInfo:"Ethics is the study of right and wrong. Moral principles that govern a person's behaviour or the conducting of an activity.", 
			effects: "Your produced food is permanently increased by an amount equal to your current produced science.",
			required:["Logic"],
			apply: function(){
				Game.context.baseFood = Number(Game.context.scienceProduction + Game.context.baseFood);
			}
		},
		"Bridges":{
			cost:700, 
			techInfo:"Bridges are the result of a large cooperative effort, and a strong grasp of mechanics. Bridges solve the problem of crossing rivers in all seasons and locations.", 
			effects: "Current surplus of produced goods give a permanent bonus to produced food.",
			required:["Roads", "Construction"],
			apply: function(){
				Game.context.baseFoodMultiplier += (Game.context.goodsProduction / 100);
			}
		},
		"Ships":{
			cost:1500, 
			techInfo:"Ships allow even more cargo and people to travel even further. When you have ships, there is no place in the world you cannot reach. You can learn from the people living there.", 
			effects: "Current surplus of produced goods give a permanent bonus to produced science.",
			required:["Construction"],
			apply: function(){
				Game.context.baseScienceMultiplier += (Game.context.goodsProduction / 100);
			}
		},
		"War":{
			cost:3000, 
			techInfo:"War is a state of armed conflict between different countries or different groups within a country. War is costy, but sometimes comes with huge progress in technology.", 
			effects: "The next technology you research will take no time.",
			required:["Soldiers"],
			apply: function(){
				Game.context.nextFree = true;
			}
		},
		"Kings":{
			cost:700, 
			techInfo:"Kings do not contribute directly to any production, but their oversight allows a Kingdom to stake out a more clear path into the future.", 
			effects: "Soldiers lower corruption by 1.",
			required:["Soldiers"],
			apply: function(){
				Game.data.roles['soldier'].corruption -= 1;
			}
		},
		"Education":{
			cost:1500, 
			techInfo:"Education is the process of facilitating learning, or the acquisition of knowledge, skills, values, beliefs, and habits. Educational methods include storytelling, discussion, teaching, training, and directed research", 
			effects: "Storytellers become teachers.",
			required:["Logic", "Bridges"],
			apply: function(){
				Game.data.roles['oldteller'] = Game.data.roles["storyteller"];
				Game.data.roles["storyteller"] = Game.data.roles['teacher'];
			}
		},
		"Art":{
			cost:3000, 
			techInfo:"Art is a diverse range of human activities in creating visual, auditory or performing artifacts (artworks), expressing the author's imaginative or technical skill, intended to be appreciated for their beauty or emotional power.", 
			effects: "Storytellers and Teachers become twice as efficient.",
			required:["Aesthetics"],
			apply: function(){
				Game.data.roles['teacher'].science *= 2;
				Game.data.roles["storyteller"].science *= 2;
			}
		},
		"Law":{
			cost:3000, 
			techInfo:"Law is a system of rules that are enforced through social institutions to govern behavior. Laws can be made by a collective legislature or by a single legislator, resulting in statutes, by the executive through decrees and regulations, or by judges through binding precedent, normally in common law jurisdictions.", 
			effects: "Corruption is lowered by 50%.",
			required:["Ethics", "Education"],
			apply: function(){
				Game.context.baseCorruptionMultiplier *= 0.5;
			}
		},
		"Science":{
			cost:3000, 
			techInfo:"The scientific method is a cycle of observation, hypothesis, experiment, and repeat. A rigirous system eliminates personal opinion, and all claims need to be falsifiable and proven with data.", 
			effects: "Storytellers and Teachers become twice as efficient.",
			required:["Education"],
			apply: function(){
				Game.data.roles['teacher'].science *= 2;
				Game.data.roles["storyteller"].science *= 2;
			}
		},
		"Logistics":{
			cost:3000, 
			techInfo:"Logistics is the study of how to get materials and goods to where they need to go in a timely fashion. Managing your ships, trains, storehouses and manufacturing plants is essential.", 
			effects: "Traders become twice as efficient.",
			required:["Education", "Ships"],
			apply: function(){
				Game.data.roles['trader'].goods *= 2;
			}
		},
		"Nations":{
			cost:3000, 
			techInfo:"A nation is a large group or collective of people with common characteristics attributed to them - including language, traditions, mores (customs), habitus (habits), and ethnicity. A nation, by comparison, is more impersonal, abstract, and overtly political than an ethnic group.", 
			effects: "All technology costs 10% less.",
			required:["War", "Kings"],
			apply: function(){
				var techs = Game.data.techs;
				for(techId in techs){
					Game.data.techs[techId].cost *= 0.9;
				}
			}
		},
		"Machines":{
			cost:4000, 
			techInfo:"Machines will assist human being in all parts of their life. Jobs that require strength, precision or repetitive behaviour, will be performed faster and cheaper by machines.", 
			effects: "Goods and Food production is doubled.",
			required:["Science", "Logistics"],
			apply: function(){
				Game.context.baseGoodsMultiplier *= 2;
				Game.context.baseFoodMultiplier *= 2;
			}
		},
		"Equality":{
			cost:5000, 
			techInfo:"Social equality is a state of affairs in which all people within a specific society or isolated group have the same status in certain respects, often including civil rights, freedom of speech, property rights, and equal access to social goods and services.", 
			effects: "Lowers corruption by 50%.",
			required:["Art", "Law", "Machines"],
			apply: function(){
				Game.context.baseCorruptionMultiplier *= 0.5;
			}
		},
		"Democracy":{
			cost:5000, 
			techInfo:"Democracy is a system of government by the whole population or all the eligible members of a state, typically through elected representatives.", 
			effects: "You win the game.",
			required:["Equality", "Nations"],
			apply: function(){
				Game.win();
			}
		}
	},
	learned: [],
	available: ["Language", "Simple Tools"],
	roles: {
		"hunter": {
			role:"hunter",
			food:0.1,
			science:0,
			goods:0,
			corruption:0,
			tooltip: "Hunter-gatherer. Can barely produce more food than it eats.",
			scienceMultiplier: 1,
			foodMultiplier: 1,
			corruptionMultiplier: 1,
			goodsMultiplier: 1,
			color: 'danger'
		},
		"storyteller": {
			role:"storyteller",
			food:-0.5,
			science:1,
			goods:0,
			corruption:0.3,
			tooltip: "Storyteller. Increases science overall.",
			scienceMultiplier: 1.05,
			foodMultiplier: 1,
			corruptionMultiplier: 1,
			goodsMultiplier: 1,
			color: 'primary'
		},
		"farmer": {
			role:"farmer",
			food:1.5,
			science:1,
			goods:0,
			corruption:0.3,
			tooltip: "Farmer. Produces food for themself and others.",
			scienceMultiplier: 1,
			foodMultiplier: 1,
			corruptionMultiplier: 1,
			goodsMultiplier: 1,
			color: 'success'
		},
		"raider": {
			role:"raider",
			food:-1.5,
			science:1,
			goods:0.5,
			corruption:0.1,
			tooltip: "Raider. Will steal goods for your tribe. Can increase corruption.",
			scienceMultiplier: 1,
			foodMultiplier: 1,
			corruptionMultiplier: 1.1,
			goodsMultiplier: 1,
			color: 'danger'
		},
		"trader": {
			role:"trader",
			food:-1.5,
			science:0.1,
			goods:1.2,
			corruption:0.5,
			tooltip: "Trader. Will provide a lot of goods.",
			scienceMultiplier: 1,
			foodMultiplier: 1,
			corruptionMultiplier: 1,
			goodsMultiplier: 1.25,
			color: 'warning'
		},
		"soldier": {
			role:"soldier",
			food:-1.6,
			science:0,
			goods:0,
			corruption:-0.5,
			tooltip: "Soldier. Reduces corruption but does not yield any goods.",
			scienceMultiplier: 1,
			foodMultiplier: 1,
			corruptionMultiplier: 0.95,
			goodsMultiplier: 1,
			color: 'danger'
		},
		"teacher": {
			role:"teacher",
			food:-1,
			science:2,
			goods:0,
			corruption:0.7,
			tooltip: "Teacher. Will provide a lot of Science.",
			scienceMultiplier: 1.3,
			foodMultiplier: 1,
			corruptionMultiplier: 1,
			goodsMultiplier: 1,
			color: 'primary'
		}
	}
}
//decompress data
for (var tech_id in Game.data.techs) {
	var tech = Game.data.techs[tech_id];
	tech.techName = tech_id.replaceAll("_", " ");
	tech.techId = tech_id;
	tech.btnClass = "btn-info";
	tech.labelClass = "label-info";
	tech.active = "";
	tech.learned = false;
	if(tech.required.length == 0){
		tech.btnClass = "btn-warning";	
		tech.labelClass = "label-warning";
	}
	for (var i = tech.required.length - 1; i >= 0; i--) {
		var requiredKey = tech.required[i];
		var requiredTech = Game.data.techs[requiredKey];
		if(requiredTech.to){
			requiredTech.to.push(tech_id);
		}else{
			requiredTech.to = [tech_id];
		}
	}
}

Game.context = {
	turnsToTech: 0,
	turnsToPerson: 0,
	foodToPerson: 5,
	requiredFood: 20,
	foodProduction: 0,
	scienceProduction: 0,
	goodsProduction: 0,
	corruption: 0,
	people: ["hunter", "hunter"],
	unborn: ["hunter"],

	baseFood: 0,
	baseScience: 1,
	baseCorruption: 0,
	baseGoods: 0,

	baseFoodMultiplier: 1,
	baseGoodsMultiplier: 1,
	baseScienceMultiplier: 1,
	baseCorruptionMultiplier: 1,

	turnsTaken: 0,
	nextFree: false,
	controlUnborn: false
};

Game.calculateProduction = function(){
	//console.log("calculating production");
	var people = Game.context.people;
	var producedFood = Game.context.baseFood;
	var producedScience = Game.context.baseScience;
	var producedGoods = Game.context.baseGoods;
	var producedCorruption = Game.context.baseCorruption;
	//add sum
	for (var i = people.length - 1; i >= 0; i--) {
		var role = people[i];
		var pObj = Game.data.roles[role];
		producedFood += pObj.food;
		producedScience += pObj.science;
		producedGoods += pObj.goods;
		producedCorruption += pObj.corruption;
	}
	//calculate multipliers
	var foodMultiplier = Game.context.baseFoodMultiplier;
	var goodsMultiplier = Game.context.baseGoodsMultiplier;
	var scienceMultiplier = Game.context.baseScienceMultiplier;
	var corruptionMultiplier = Game.context.baseCorruptionMultiplier;
	for (var i = people.length - 1; i >= 0; i--) {
		var role = people[i];
		var pObj = Game.data.roles[role];
		foodMultiplier *= pObj.foodMultiplier;
		scienceMultiplier *= pObj.scienceMultiplier;
		goodsMultiplier *= pObj.goodsMultiplier;
		corruptionMultiplier *= pObj.corruptionMultiplier;
	}
	 
	//multiply
	producedGoods *= goodsMultiplier;
	producedCorruption *= corruptionMultiplier;

	Game.context.goodsProduction = producedGoods.toFixed(1);
	//calculate goods multiplier
	var gMul = 1 + (producedGoods / 100);
	//console.log("goods multiplier: " + gMul);

	
	//calculate corruption multiplier
	var cMul = 1 - (producedCorruption / 10);
	if(producedCorruption < 0){
		cMul = 1;
		producedCorruption = 0;
	}
	Game.context.corruption = producedCorruption.toFixed(1);
	//console.log("corruption multiplier: " + cMul);

	//multiply that too
	producedFood = producedFood * gMul * cMul * foodMultiplier;
	producedScience = producedScience * gMul * cMul * scienceMultiplier;

	Game.context.cPer = ((1-cMul)*100).toFixed(1);
	Game.context.gPer = ((gMul-1)*100).toFixed(1);

	Game.context.foodProduction = producedFood.toFixed(1);
	Game.context.scienceProduction = producedScience.toFixed(1);

	Game.context.turnsToPerson = (Game.context.foodToPerson / producedFood).toFixed(1);
}

Game.learnTech = function(learned_tech_id){
	console.log("learning tech: " + learned_tech_id);
	var learnedTech = Game.data.techs[learned_tech_id];
	Game.data.learned.push(learned_tech_id);
	learnedTech.btnClass = "btn-primary";
	learnedTech.labelClass = "label-primary";
	learnedTech.learned = true;
	learnedTech.active = "disabled";
	for (var tech_id in Game.data.techs) {
		var tech = Game.data.techs[tech_id];
		var i = tech.required.indexOf(learned_tech_id);
		if(i != -1) {
			tech.required.splice(i, 1);
		}
		if(tech.required.length == 0 && !tech.learned){
			tech.btnClass = "btn-warning";	
			tech.labelClass = "label-warning";
		}
	}
	Game.context.nextTech = false;
	Game.context.nextFree = false;
	learnedTech.apply();
	Game.renderTechs();
	Game.renderInfo();
}

Game.selectTech = function(selected_tech_id){
	console.log("selecting tech: " + selected_tech_id);
	var tech = Game.data.techs[selected_tech_id];
	Game.context.nextTech = !tech.learned && tech.required.length == 0
	if(Game.context.nextTech)
		Game.data.next = selected_tech_id;
	
	Game.context.selectedTech = tech;
	
	//Calculate turnsToTech
	var turns = tech.cost / Game.context.scienceProduction;
	if(Game.context.nextFree) turns = 0;
	Game.context.turnsToTech = Math.ceil(turns);

	Game.renderInfo();

	var container = $("#techTreeContainer");
	var goal = container.scrollLeft() + $("#"+selected_tech_id).position().left - 300;
	container.scrollLeft(goal);
}

Game.renderTo = function(template_id, output, context){
	//console.log(template_id);
	if(!Templates[template_id]){
		var template = makeTemplate(template_id);
		if(!template)
			console.log("Could not compile template " + template_id);
		else
			Templates[template_id] = template;
	}
	if(!context)
		context = Game.context;
	var rendered = Templates[template_id](context);
	if(output)
		output.html(rendered);
	return rendered;
};

Game.renderTechs = function(){
	var tree = $("#techTree");
	tree.empty();
	Game.renderTo("#techTreeTemplate", tree);
	for (var tech_id in Game.data.techs) {
		var tech = Game.data.techs[tech_id];
		Game.renderTo("#techTemplate", $("#"+tech_id), tech);
	}
};

Game.renderInfo = function(){
	var tech = Game.context.selectedTech;
	Game.renderTo("#infoTemplate", $("#info"));
	if(tech){
		for (var i in tech.to) {
			var tech_id = tech.to[i];
			var toTech = Game.data.techs[tech_id];
			Game.renderTo("#smallTechTemplate", $("#small_"+tech_id), toTech);
		}
		console.log(tech.required);
		for (var i in tech.required) {
			var tech_id = tech.required[i];
			var fromTech = Game.data.techs[tech_id];
			Game.renderTo("#smallTechTemplate", $("#small_"+tech_id), fromTech);
		}
	}
}

Game.renderPeople = function(){
	Game.context.renderPeople = Game.context.people.map(function(person){
		return Game.data.roles[person];
	});
	Game.renderTo("#peopleTemplate", $("#people"));
};

Game.renderProduction = function(){
	Game.renderTo("#productionTemplate", $("#production"));
};

Game.renderUnborn = function(){
	Game.context.renderUnborn = Game.context.unborn.map(function(person){
		return Game.data.roles[person];
	});
	Game.renderTo("#unbornTemplate", $("#unborn"));
};

Game.renderMain = function(template_id){
	Game.renderTo(template_id, $("#mainOutlet"));
};

Game.start = function(cityname){
	Game.calculateProduction();
	Game.renderAll();
};

Game.showModal = function(template_id){
	console.log("displaying modal " + template_id);
	var $modal = $("#modalOutlet");
	Game.renderTo(template_id, $modal);
	$modal.modal();
};

Game.prioritize = function(role){
	var unborn = Game.context.unborn;
	var i = unborn.indexOf(role)
	if(i < 0) return;
	unborn.splice(i, 1);
	unborn.unshift(role);
	Game.context.unborn = unborn;
	Game.renderUnborn();
}

Game.birth = function(){
	var newBorn = Game.context.unborn[0];
	console.log(newBorn+  " was born!");
	Game.context.unborn.shift();
	Game.context.people.push(newBorn);
	Game.context.unborn.push(newBorn);
	Game.context.foodToPerson += Game.context.requiredFood;
	Game.context.requiredFood += 25;
	console.log("foodToPerson: " + Game.context.foodToPerson);
}

Game.advanceTurn = function(){
	var foodInc = Game.context.foodProduction;
	Game.context.foodToPerson -= foodInc;
	while(Game.context.foodToPerson < 0){
		Game.birth();
	}
	Game.calculateProduction();
	console.log("food to person: " + Game.context.foodToPerson);
	Game.context.turnsTaken += 1;
}

Game.advanceTime = function(){
	var turns = Game.context.turnsToTech;
	console.log("advancing time " + turns + " turns.");

	for (var i = turns - 1; i >= 0; i--) {
		Game.advanceTurn();
	}

	var techId = Game.data.next
	Game.learnTech(techId);
	Game.calculateProduction();
	Game.renderPeople();
	Game.renderProduction();
	Game.renderUnborn();

	if(Game.won){
		Game.showModal("#winModalTemplate");
	}
};

Game.menu = function(){
	Game.renderMain("#mainMenu");
};

Game.win = function(){
	Game.won = true;
}

Game.renderAll = function(){
	Game.renderMain("#gameStructureTemplate");
	Game.renderTo("#infoBarTemplate", $("#infobar"));
	
	Game.renderTechs();
	Game.renderInfo();
	Game.renderPeople();
	Game.renderProduction();
	Game.renderUnborn();
	
	//Game.showModal("#modalTemplate");
	
};

Game.menu();
