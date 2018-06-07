const URL_PATH = "https://raw.githubusercontent.com/simonppg/mundial/master/";
var people = JSON.parse('{"people":[]}');

var parserConfig = {
  step: function(row) {
    //console.log("Row:", row.data);
  },
  complete: function() {
    console.log("All done!");
  }
}

function processData(csvString) {
  var results = Papa.parse(csvString, parserConfig);
}

var getForecast = {
    type: "GET",
    dataType: "text",
    success: function(data) {processData(data);}
}

function fillFilesNames(data) {
  var lines = data.split('\n');
  for(var i = 0; i < lines.length; i++){
    var person = new Object();
    person.name = lines[i];
    people['people'].push(person);
    getForecast.url = URL_PATH.concat(lines[0]).concat(".csv"),
    $.ajax(getForecast)
  }
  console.log(people);
}

var main = function() {
  $.ajax({
    type: "GET",
    url: URL_PATH.concat("files_names.txt"),
    dataType: "text",
    success: fillFilesNames
  });

  //  var ctx = document.getElementById("table");
}

$(document).ready(main);
