const URL_PATH = "https://raw.githubusercontent.com/simonppg/mundial/master/";
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

function showPlayer(playerName, points) {
  myTable.row.add([
    playerName,
    points
  ]).draw( false );
}

function showPlayers(players) {
  players.forEach((player) => {
    showPlayer(player.name, player.points);
  });
}

function showResults(results) {
  $.each(results, function(match, result) {
    var span = $("#"+match.replace(/\s/g, ''));
    span.text(result);
  });
}

function calculateScore(matchesResults, players) {
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
}

async function fillFilesNames(filesNames) {
  let players = [];
  const numberOfPlayers = filesNames.length;

  filesNames.forEach(async (fileName) => {
    const playerPredictions = await retrivePlayerPredictions(fileName);

    let player = new Object();
    player.name = fileName;

    players.push({name: player.name, data: playerPredictions, points: 0});
    completed++;

    if (numberOfPlayers == completed) {
      for (var j = 0; j < players.length; j++) {
        players[j].data.splice(-1, 1);
        players[j].data.splice(0, 1);
        players[j].data = Object.assign({}, ...players[j].data);
      }

      const matchesResults = await retriveMatchesResults()
      showResults(matchesResults);
      calculateScore(matchesResults, players)
      showPlayers(players);
    }
  })
}

function parseCsv(csvStr){
  const parsedData = Papa.parse(csvStr);

  if(parsedData.errors.length > 0) {
    throw new Error("Can not parse csv")
  }

  return parsedData.data;
}

/**
 * @returns matchesResults final results
 * */
async function retriveMatchesResults() {
  const res = await fetch(URL_PATH + "results.csv");

  if(!res.ok) { return Promise.reject("Can not get results.csv") }

  const responseStr = await res.text();
  
  const parsedResult = parseCsv(responseStr)

  parsedResult.splice(-1,1);
  parsedResult.splice(0,1);

  let matchesResults = parsedResult.map(mapper);
  matchesResults = Object.assign({}, ...matchesResults);
  return matchesResults;
}

/**
 * @returns playersPredictions player predictions
 * */
async function retrivePlayerPredictions(fileName) {
  const res = await fetch(URL_PATH + fileName + ".csv");

  if(!res.ok) { return Promise.reject("Can not get " + fileName) }

  const responseStr = await res.text();

  const parsedResult = parseCsv(responseStr);
  const playersPredictions = parsedResult.map(mapper);

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
