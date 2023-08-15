import JsonToCsv from './JsonToCsv.js';


/**
 * Version du script 
 * node export-csv.js --version
 */
const version = '1.0.0' ;


/**
 * node export-csv.js --help
 * Message d'aide 
 */
const helpMessage =`
Usage: export-csv.js [options] [arguments]

Description :  
  Le script exporte le fichier (.json) defini par source vers le repertoire de sorties defini par destination

Options:
  -h, --help     Affichage de l'aide
  -v, --version  Version du script
  -m <mode> , --mode <mode> spécifie le mode d'execution du script (console|batch) , par defaut console 

Arguments:
  --source          chemin vers le fichier source (.json)
  --destination     repertoire de sauvegarde  du fichier en sortie (.csv)
`;



/**
 * Renvoi la date du jour formatée
 * @returns 
 */
const getCurrentDate = function(){
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    timeZoneName: 'short'
  };
   return new Date().toLocaleString('fr-FR', options);
}



//main 
const main =  function() {
  const args = process.argv.slice(2);
  if (args.includes('-h') || args.includes('--help')) {
    console.log(helpMessage);
    process.exit(0) ;
  } else if (args.includes('-v') || args.includes('--version')) {
    console.log(`Version: ${version}`);
    process.exit(0) ;
  }else{
    //lire les argument passés à la commande 
    const modeIndex = args.indexOf('--mode');
    const modeExecution = modeIndex !== -1 ? args[modeIndex + 1] : 'console';
    const sourceIndex = args.indexOf('--source');
    const source = sourceIndex !== -1 ? args[sourceIndex + 1] : null;
    const destinationIndex = args.indexOf('--destination');
    const destination = destinationIndex !== -1 ? args[destinationIndex + 1] : null;
    const jsonToCsv = new JsonToCsv(source, destination , modeExecution); 
    jsonToCsv.generateCSV().then(() => {
      console.log(`${getCurrentDate()} - Le fichier CSV clients a été généré avec succès`);
    }).catch((error) => {  
      console.error(`${getCurrentDate()} - La génération du fichier CSV client à échouée :`, error );   
    });
  }
}();
