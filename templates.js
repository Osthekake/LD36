var templateIds = ["#mainMenu", "#gameStructureTemplate", "#techTemplate", "#smallTechTemplate"]; 
function makeTemplate(id_string){
	console.log("compiling template " + id_string);
	var source = $(id_string).html();
	return Handlebars.compile(source);
}
var Templates = {};
templateIds.forEach(function(id_string){
	var template = makeTemplate(id_string);
	Templates[id_string] = template;
});
console.log("compiled preloaded templates");