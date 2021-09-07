const URL_PATH = "https://raw.githubusercontent.com/simonppg/mundial/master/";
var people = JSON.parse('{"players":[], "total": -1, "completed": 0, "results": 0}');
var myTable = $('#myTable').DataTable({
  searching: false,
  paging: false,
  info: false
});

function mapper(a){
  var myObj = new Object();
  myObj[a[0]] = a[1];
  return myObj;
}

function addPlayer(playerName, points) {
  myTable.row.add([
    playerName,
    points
  ]).draw( false );
}

function addResults(results) {
  $.each(results, function(match, result) {
    var span = $("#"+match.replace(/\s/g, ''));
    span.text(result);
  });
}

function getResults(csvString) {
  var matchResults = Papa.parse(csvString);
  matchResults.data.splice(-1,1);
  matchResults.data.splice(0,1);
  people.results = matchResults.data.map(mapper);
  people.results = Object.assign({}, ...people.results);
  addResults(people.results);

  for (var match in people.results) {
    console.log("Result of "+match+" is: "+people.results[match]);
    for(var j = 0; j < people.players.length; j++){
      console.log(people.players[j].name+" said: "+people.players[j].data[match]);
      if(people.results[match].toUpperCase() === people.players[j].data[match].toUpperCase())
      {
        console.log('%cOne point for '+people.players[j].name+'!', 'color: #ff0000');
        people.players[j].points++;
      }
    }
  }

  for(var j = 0; j < people.players.length; j++){
    addPlayer(people.players[j].name, people.players[j].points);
  }
}

function processData(csvString) {
  var playerData = Papa.parse(csvString);
  playerData.data = playerData.data.map(mapper);
  people.players.push({name: this.name, data: playerData.data, points: 0});
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

function fillFilesNames(filesNames) {
  for(let i = 0; i < filesNames.length - 1; i++) {
    let person = new Object();
    person.name = filesNames[i];
    ajaxConfig.url = URL_PATH.concat(filesNames[i]).concat(".csv");
    ajaxConfig.success = processData;
    ajaxConfig.context = person;
    $.ajax(ajaxConfig)
  }

  people.total = filesNames.length - 1;
  console.log(people);
}

/**
 * @returns filesNames: An array of string with the files names
  * */
async function retriveFilesNames() {
  const res = await fetch(URL_PATH + "files_names.txt");

  if(!res.ok) { return Promise.reject("Can not get files_names")}

  const filesNamesStr = await res.text();
  const filesNames = filesNamesStr.split('\n');

  return filesNames;
}

var main = async function() {
  const filesNames = await retriveFilesNames();

  console.log(filesNames);

  fillFilesNames(filesNames);
}

$(document).ready(main);
