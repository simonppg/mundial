const URL_PATH = "https://raw.githubusercontent.com/simonppg/mundial/master/";
let players = [];
let completed = 0;
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
  const parserResult = Papa.parse(csvString);
  parserResult.data.splice(-1,1);
  parserResult.data.splice(0,1);

  let matchesResults = parserResult.data.map(mapper);
  matchesResults = Object.assign({}, ...matchesResults);
  addResults(matchesResults);

  for (let match in matchesResults) {
    console.log("Result of " + match + " is: " + matchesResults[match]);
    players.forEach((player) => {
      console.log(player.name + " said: " + player.data[match]);
      if(matchesResults[match].toUpperCase() === player.data[match].toUpperCase()) {
        console.log('%cOne point for ' + player.name + '!', 'color: #ff0000');
        player.points++;
      }
    })
  }

  players.forEach((player) => {
    addPlayer(player.name, player.points);
  })
}

function processData(numberOfPlayers, person, csvString) {
  var playerData = Papa.parse(csvString);
  playerData.data = playerData.data.map(mapper);
  players.push({name: person.name, data: playerData.data, points: 0});
  completed++;

  if(numberOfPlayers == completed)
  {
    for(var j = 0; j < players.length; j++){
      players[j].data.splice(-1,1);
      players[j].data.splice(0,1);
      players[j].data = Object.assign({}, ...players[j].data);
    }

    retriveMatchesResults().then((matchesResults) => {
      getResults(matchesResults)
    });
  }
}

async function fillFilesNames(filesNames) {
  const numberOfPlayers = filesNames.length;

  filesNames.forEach(async (fileName) => {
    const csv = await retrivePlayerPredictions(fileName);

    let person = new Object();
    person.name = fileName;
    processData(numberOfPlayers, person, csv)
  })
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
