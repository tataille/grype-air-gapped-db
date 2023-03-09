const path = require('path');
const https = require('https');
const fs = require('fs');
const program = require('commander');

// URL du fichier JSON à télécharger
const jsonUrl = 'https://toolbox-data.anchore.io/grype/databases/listing.json';


program
  .command('download <days>')
  .description('Download')
  .action((name) => {
    // Télécharger le fichier JSON
    download(jsonUrl, 'data.json', (err) => {
        if (err) throw err;
    
        // Lire le fichier JSON et extraire la liste d'URL
        const jsonData = fs.readFileSync('data.json');
        const db_version_5 = JSON.parse(jsonData).available['5'];
    
        // Télécharger chaque URL dans la liste
        days = 0;
        maxDays = 5;
        db_version_5.forEach((db, i) => {
        if (days < maxDays) {
            fileName = decodeURIComponent(path.basename(db['url']));
            download(db['url'], fileName, (err) => {
                if (err) throw err;
                console.log(`Téléchargement terminé: ${db['url']}`);
            }); 
        
            days++;
        }
        
        });
    });
  });

program
  .command('sum <a> <b>')
  .description('Calculate the sum of two numbers')
  .action((a, b) => {
    const sum = Number(a) + Number(b);
    console.log(`The sum of ${a} and ${b} is ${sum}.`);
  });

program.parse(process.argv);

// Fonction pour télécharger un fichier à partir d'une URL
function download(url, dest, cb) {
  const file = fs.createWriteStream(dest);
  https.get(url, (res) => {
    res.pipe(file);
    file.on('finish', () => {
      file.close(cb);
    });
  }).on('error', (err) => {
    fs.unlink(dest);
    if (cb) cb(err.message);
  });
}

