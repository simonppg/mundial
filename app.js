const URL_PATH = "https://raw.githubusercontent.com/simonppg/mundial/master/";

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

var CSV = ["fake_name1",
  "fake_name2"];

function getFilesNames(data) {
  var lines = data.split('\n');
  for(var i = 0;i < lines.length;i++){
    console.log(i);
    console.log(lines[i]);
    CSV.push(lines[i]);
  }

  console.log(CSV);
}

var main = function() {
  $.ajax({
    type: "GET",
    url: URL_PATH.concat("files_names.txt"),
    dataType: "text",
    success: getFilesNames
  });

  $.ajax({
    type: "GET",
    url: URL_PATH.concat(CSV[0]).concat(".csv"),
    dataType: "text",
    success: function(data) {processData(data);}
  });
  //  var ctx = document.getElementById("table");
}

$(document).ready(main);
