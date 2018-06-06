var parserConfig = {
	step: function(row) {
		console.log("Row:", row.data);
	},
	complete: function() {
		console.log("All done!");
	}
}

function processData(csvString) {
	var results = Papa.parse(csvString, parserConfig);
}

var CSV = ["https://raw.githubusercontent.com/simonppg/mundial/master/test.csv",
	"",];

var main = function() {
	$.ajax({
		type: "GET",
		url: CSV[0],
		dataType: "text",
		success: function(data) {processData(data);}
	});
	//  var ctx = document.getElementById("table");
}

$(document).ready(main);
