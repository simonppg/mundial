const URL_PATH = "https://raw.githubusercontent.com/simonppg/mundial/master/";
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
  let playerPredictions = parsedResult.map(mapper);

  playerPredictions.splice(-1, 1);
  playerPredictions.splice(0, 1);
  playerPredictions = Object.assign({}, ...playerPredictions);

  return playerPredictions;
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

function isSameResult(matchResult, matchPrediction) {
  return matchResult.toUpperCase() === matchPrediction.toUpperCase();
}

async function main() {
  let players = [];

  const filesNames = await retriveFilesNames();
  const matchesResults = await retriveMatchesResults()

  showResults(matchesResults);

  for (const fileName of filesNames) {
    const predictions = await retrivePlayerPredictions(fileName);
    let points = 0;

    for (let matchIndex in matchesResults) {
      const matchResult = matchesResults[matchIndex];
      const matchPrediction = predictions[matchIndex];

      if (isSameResult(matchResult, matchPrediction)) {
        points += 1;
      }
    }

    const player = {
      name: fileName,
      predictions,
      points
    };

    players.push(player);
  }

  showPlayers(players);
}

$(document).ready(main);
