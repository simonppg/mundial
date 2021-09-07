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
    console.log("Result of " + match + " is: " + people.results[match]);
    people.players.forEach((player) => {
      console.log(player.name + " said: " + player.data[match]);
      if(people.results[match].toUpperCase() === player.data[match].toUpperCase()) {
        console.log('%cOne point for ' + player.name + '!', 'color: #ff0000');
        player.points++;
      }
    })
  }

  people.players.forEach((player) => {
    addPlayer(player.name, player.points);
  })
}

function processData(person, csvString) {
  var playerData = Papa.parse(csvString);
  playerData.data = playerData.data.map(mapper);
  people.players.push({name: person.name, data: playerData.data, points: 0});
  people.completed++;

  if(people.total == people.completed)
  {
    for(var j = 0; j < people.players.length; j++){
      people.players[j].data.splice(-1,1);
      people.players[j].data.splice(0,1);
      people.players[j].data = Object.assign({}, ...people.players[j].data);
    }

    retriveMatchesResults().then((matchesResults) => {
      getResults(matchesResults)
    });
  }
}

async function fillFilesNames(filesNames) {
  filesNames.forEach(async (fileName) => {
    const csv = await retrivePlayerPredictions(fileName);

    let person = new Object();
    person.name = fileName;
    processData(person, csv)
  })

  people.total = filesNames.length;
  console.log(people);
}

/**
 * @returns matchesResults final results
 * */
async function retriveMatchesResults() {
  const res = await fetch(URL_PATH + "results.csv");

  if(!res.ok) { return Promise.reject("Can not get results.csv") }

  const matchesResults = await res.text();
  // console.log(matchesResults);
  return matchesResults;
}

/**
 * @returns playersPredictions player predictions
 * */
async function retrivePlayerPredictions(fileName) {
  const res = await fetch(URL_PATH + fileName + ".csv");

  if(!res.ok) { return Promise.reject("Can not get " + fileName) }

  const playersPredictions= await res.text();
  // console.log(playersPredictions);
  return playersPredictions;
}

/**
 * @returns filesNames: An array of string with the files names
  * */
async function retriveFilesNames() {
  const res = await fetch(URL_PATH + "files_names.txt");

  if(!res.ok) { return Promise.reject("Can not get files_names")}

  const filesNamesStr = await res.text();
  const filesNames = filesNamesStr.trim().split('\n');

  return filesNames;
}

var main = async function() {
  const filesNames = await retriveFilesNames();

  console.log(filesNames);

  fillFilesNames(filesNames);
}

$(document).ready(main);
