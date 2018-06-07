const URL_PATH = "https://raw.githubusercontent.com/simonppg/mundial/master/";
var people = JSON.parse('{"people":[]}');

function processData(csvString) {
  var results = Papa.parse(csvString);
  people['people'].push({person: this, data: results.data});
}

var getForecast = {
  type: "GET",
  dataType: "text",
}

function fillFilesNames(data) {
  var lines = data.split('\n');
  for(var i = 0; i < lines.length - 1; i++){
    var person = new Object();
    person.name = lines[i];
    getForecast.url = URL_PATH.concat(lines[i]).concat(".csv");
    getForecast.success = processData;
    getForecast.context = person;
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
