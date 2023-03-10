const path = require('path');
const https = require('https');
const fs = require('fs');
const program = require('commander');

// URL du fichier JSON à télécharger
const jsonUrl = 'https://toolbox-data.anchore.io/grype/databases/listing.json';
const directory = './db';
const dir = './db';
const filePath = 'db/listing.json';

const originalUrl = 'https://toolbox-data.anchore.io';
const newUrl = 'http://new-url.com';

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

program
  .command('download <days>')
  .description('Download')
  .action((name) => {
    // Télécharger le fichier JSON
    download(jsonUrl, './db/listing.json', (err) => {
        if (err) throw err;
    
        // Lire le fichier JSON et extraire la liste d'URL
        const jsonData = fs.readFileSync('./db/listing.json');
        const db_version_5 = JSON.parse(jsonData).available['5'];
    
        // Télécharger chaque URL dans la liste
        days = 0;
        maxDays = 5;
        db_version_5.forEach((db, i) => {
        if (days < maxDays) {
            fileName = decodeURIComponent(path.basename(db['url']));
            download(db['url'], './db/'+fileName, (err) => {
                if (err) throw err;
                console.log(`Téléchargement terminé: ${db['url']}`);
            }); 
        
            days++;
        }
        
        });
    });
  });

program
  .command('upload <artifactoryUrl> <artifactoryToken>')
  .description('Upload local tar.gz to <artifactoryUrl> using Artifactory token')
  .action((artifactoryUrl, artifactoryToken) => {
    fs.readdir(directory, (err, files) => {
        if (err) throw err;

        fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) throw err;

        // Recherche et remplacement des URLs
        const newData = data.replace(new RegExp(originalUrl, 'g'), newUrl);

        // Écriture du fichier mis à jour
        fs.writeFile(filePath, newData, (err) => {
            if (err) throw err;
            console.log('Fichier json mis à jour avec succès !');
        });
        });
        files.forEach(file => {
          if (path.extname(file) === '.tar.gz') {
            const filePath = path.join(directory, file);
            const fileStream = fs.createReadStream(filePath);
            const url = `${artifactoryUrl}/${file}`;
      
            const options = {
              url,
              headers: {
                'X-JFrog-Art-Api': artifactoryToken,
                'Content-Type': 'application/x-tar'
              }
            };
      
            fileStream.pipe(request.put(options, (error, response, body) => {
              if (error) throw error;
              console.log(`File ${file} uploaded successfully!`);
            }));
          }
        });
      });
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


