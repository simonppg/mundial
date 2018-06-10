const URL_PATH = "https://raw.githubusercontent.com/simonppg/mundial/master/";
var people = JSON.parse('{"players":[], "total": -1, "completed": 0, "results": 0}');

function mapper(a){
  var myObj = new Object();
  myObj[a[0]] = a[1];
  return myObj;
}

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

function getResults(csvString) {
  var matchResults = Papa.parse(csvString);
  matchResults.data.splice(-1,1);
  matchResults.data.splice(0,1);
  people.results = matchResults.data.map(mapper);
  people.results = Object.assign({}, ...people.results);

  for (var match in people.results) {
    console.log(match);
    for(var j = 0; j < people.players.length; j++){
      console.log(people.results[match]);
      console.log(people.players[j].data[match]);
      if(people.results[match].toUpperCase() === people.players[j].data[match].toUpperCase())
      {
        console.log("Point for: "+people.players[j].name);
        addPlayer(people.players[j].name, 0);
      }
    }
  }
}

function processData(csvString) {
  var playerData = Papa.parse(csvString);
  playerData.data = playerData.data.map(mapper);
  people.players.push({name: this.name, data: playerData.data});
  people.completed++;

  if(people.total == people.completed)
  {
    for(var j = 0; j < people.players.length; j++){
      people.players[j].data.splice(-1,1);
      people.players[j].data.splice(0,1);
      people.players[j].data = Object.assign({}, ...people.players[j].data);
    }
    // Get matches results
    ajaxConfig.url = URL_PATH.concat("results.csv");
    ajaxConfig.success = getResults;
    $.ajax(ajaxConfig);
  }
}

var ajaxConfig = {
  type: "GET",
  dataType: "text",
}

function fillFilesNames(data) {
  var lines = data.split('\n');
  for(var i = 0; i < lines.length - 1; i++){
    var person = new Object();
    person.name = lines[i];
    ajaxConfig.url = URL_PATH.concat(lines[i]).concat(".csv");
    ajaxConfig.success = processData;
    ajaxConfig.context = person;
    $.ajax(ajaxConfig)
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
