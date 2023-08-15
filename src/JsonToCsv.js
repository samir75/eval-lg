import fs from 'fs';
import os from 'os';
import util from 'util';
import path from 'path';

class JsonToCsv {
  
  static MODE_EXECUTION_CONSOLE = 'console';

  constructor(sourceFile , outputDirectory , modeExecution=JsonToCsv.MODE_EXECUTION_CONSOLE) {
    this.sourceFile = path.resolve(sourceFile);
    this.outputDirectory =  path.resolve(outputDirectory); 
    this.EOL = os.EOL;
    /**
      * inserer le caractère BOM au début du fichier pour résoudre 
      * les problème d'encodage
      */
    this.BOM = '\uFEFF'; 
    /**
     * Problème des colonnes non séparée sur les système non français 
     */
    this.delimiter = (new Intl.NumberFormat().format(1111) === "1,111") ? "," : ";";

    this.defaultOutputFilePrefix = 'output' ;
    /**
     * Mode d'execution (console|batch)
     */
    this.modeExecution = modeExecution
  }
  

  /**
   * Generation du fichier CSV
   */
  async generateCSV() {
    /**
     * validation des arguments avant de lancer la génération 
     */
    this.validateArguments(this.sourceFile , this.outputDirectory) ; 
    
    /**
     * en mode batch verifier que le fichier source à été modifié
     * avent de l'exporter en CSV
     */
    if (this.modeExecution !== JsonToCsv.MODE_EXECUTION_CONSOLE) {
      if(!this.isSourceFileModifiedToday(this.sourceFile)) {
        throw new Error('Le fichier source à déjà été importé et n\'a pas été mis a jour depuis'); 
      }
    }
    /**
     * Le fichier est source est volumineux,  le traiter par morceau en 
     * utilisant createReadStream , createWriteStream definis nativement dans le module fs de  Node.js 
     */
    const readStream = fs.createReadStream(this.sourceFile);
    const writeStream = fs.createWriteStream(this.getOutputFilePath(this.outputDirectory));

    const csvHeader = util.format('%s Name %s company %s', this.BOM, this.delimiter, this.EOL);
    writeStream.write(csvHeader);

    for await (const chunk of readStream) {
      const jsonData = JSON.parse(chunk);
      for (const line of jsonData) {
        if (line.isActive === true) {
          const csvLine = util.format('%s %s %s %s', this.sanitizeValue(line.name), this.delimiter, this.sanitizeValue(line.company), this.EOL);
          writeStream.write(csvLine);
        }
      }
    }
    
    writeStream.end();

    readStream.on('error', (err) => {
      console.error('Erreur de lecture :', err);
    });
   
    writeStream.on('error', (err) => {
      console.error('Erreur d\'écriture :', err);
    });
  }


  /**
   * verifier si le fichier source à été modifié 
   * lorsque le script est executé en mode batch
   * @param {*} sourceFilePath 
   */
   isSourceFileModifiedToday(filename) {
    const stats = fs.statSync(filename);
    const currentTimestamp = stats.mtimeMs;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    return currentTimestamp >= todayTimestamp;      
  }


  /**
   * Nettoyage des donnée de certain caractère indisirables ("" , ...)
   * @param {*} value 
   * @returns 
   */
  sanitizeValue(value) {
    return value.replace(/"/g, '');
  }


  /**
   * Renvoie le chemmin complet avec le nom final du fichier de sortie   
   * @returns 
   */
  getOutputFilePath(destination) {
    let outputfilePath =  null ;  
    if (this.modeExecution !== JsonToCsv.MODE_EXECUTION_CONSOLE) {
      const now = new Date();
      const annee = now.getFullYear();
      const mois = String(now.getMonth() + 1).padStart(2, '0');
      const jour = String(now.getDate()).padStart(2, '0');
      outputfilePath =  path.join(destination, `${this.defaultOutputFilePrefix}_${annee}${mois}${jour}.csv`);
    }else {
      outputfilePath =  path.join(destination, `${this.defaultOutputFilePrefix}.csv`);
    }

     return outputfilePath ; 
  }


  /**
   * validation des arguments passés au script 
   * @param {*} sourceFile 
   * @param {*} outputDirectory 
   */
  validateArguments(sourceFile , outputDirectory) {
    if (!sourceFile || !outputDirectory) {
      throw new Error(' Les valeurs source et/ou destination sont vides.');
    }
  
    //vérifier la précence du fichier source 
    if (!fs.existsSync(sourceFile)) {
      throw new Error(' Aucun nouveau fichier source n\'a été déposé');
    }
  
    //vérifier l'extension du fichier source   
    if (path.extname(sourceFile) !== '.json') {
      throw new Error('Le fichier source doit avoir une extension .json '); 
    }
    
    //verifier l'éxistance du réprtoire de destination  
    if (!fs.existsSync(outputDirectory)) {
      throw new Error('Le répétroire de destination n\'existe pas '); 
    }
  
    //vérifier que le nom de repertoire est valide
    if(!fs.statSync(outputDirectory).isDirectory()) {
      throw new Error('Le paramétre de sortie doit contenir un nom de repertoire valide'); 
    }
  }
}

export default JsonToCsv;