var fs = require('fs');

var file = 'C:\\Utilisateurs\\Administrateur\\Documents\\Export fichier client\\users.json';
var fileSortie = 'C:\\Utilisateurs\\Administrateur\\Documents\\Export fichier client\\sortie.csv';

fs.readFile(file, 'utf8', function(e, fileData) {
    var fileJSON = JSON.parse(fileData);
    var tailleJSON = fileJSON.length + 1;
    for(var i = tailleJSON; --i; !!i) {
        var ligne = fileJSON[i - 1];
        if(ligne.isActive === false) continue;
        fs.appendFile(fileSortie, "\""+ ligne.name + "\""+";" + "\""+ ligne.company+"\"");
        fs.appendFile(fileSortie, "\n");
    }
});