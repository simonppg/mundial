const URL_PATH = "https://raw.githubusercontent.com/simonppg/mundial/master/";
var people = JSON.parse('{"players":[], "total": 0, "completed": 0}');

function addPlayer(playerName, points) {
  var rowCount = $('#myTable tr').length;
  var table = document.getElementById("myTable");
  var row = table.insertRow(rowCount);
  var cell1 = row.insertCell(0);
  var cell2 = row.insertCell(1);
  cell1.innerHTML = playerName;
  cell2.innerHTML = points;
  //console.log("Adding player: "+playerName+" on row: "+rowCount);
}

function processData(csvString) {
  var results = Papa.parse(csvString);
  people.players.push({person: this, data: results.data});
  people.completed++;

  if(people.total == people.completed)
  {
    // Process the points here
    for(var i = 0; i < people.players.length; i++){
      addPlayer(people.players[i].person.name, 0);
    }
  }
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

  people.total = lines.length - 1;
  console.log(people);
}

var main = function() {
  $.ajax({
    type: "GET",
    url: URL_PATH.concat("files_names.txt"),
    dataType: "text",
    success: fillFilesNames
  });
}

$(document).ready(main);
