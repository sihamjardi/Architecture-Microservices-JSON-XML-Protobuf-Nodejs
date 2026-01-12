// ---------- IMPORT DES MODULES ----------
const fs = require('fs');           // Lire/écrire des fichiers
const convert = require('xml-js');  // Conversion JSON ↔ XML
const protobuf = require('protobufjs'); // Protobuf

// ---------- CHARGEMENT DU FICHIER PROTOBUF ----------
const root = protobuf.loadSync('employe.proto'); // Charger le fichier .proto
const StaffListType = root.lookupType('StaffList'); // Récupérer le type StaffList

// ---------- CREATION DE LA LISTE D'EMPLOYES ----------
const staffMembers = []; // Tableau pour stocker les employés

// Ajout des employés
staffMembers.push({
    staffId: 201,
    fullName: 'Leila',
    monthlySalary: 15000,
    email: 'leila@example.com',
    hireDate: '2020-03-15'
});

staffMembers.push({
    staffId: 202,
    fullName: 'Karim',
    monthlySalary: 21000,
    email: 'karim@example.com',
    hireDate: '2019-07-22'
});

staffMembers.push({
    staffId: 203,
    fullName: 'Nadia',
    monthlySalary: 18000,
    email: 'nadia@example.com',
    hireDate: '2021-01-10'
});

staffMembers.push({
    staffId: 204,
    fullName: 'Omar',
    monthlySalary: 22000,
    email: 'omar@example.com',
    hireDate: '2018-11-05'
});

staffMembers.push({
    staffId: 205,
    fullName: 'Salma',
    monthlySalary: 24000,
    email: 'salma@example.com',
    hireDate: '2022-06-30'
});

// Objet racine compatible Protobuf
let staffRoot = { staff: staffMembers };

// ---------- SERIALISATION EN JSON ----------
console.time('JSON encode');
let jsonData = JSON.stringify(staffRoot); // objet JS → JSON
console.timeEnd('JSON encode');

console.time('JSON decode');
let jsonDecoded = JSON.parse(jsonData); // JSON → objet JS
console.timeEnd('JSON decode');

// ---------- SERIALISATION EN XML ----------
const xmlOptions = {
    compact: true,
    ignoreComment: true,
    spaces: 0
};

console.time('XML encode');
let xmlData = "<root>\n" + convert.json2xml(staffRoot, xmlOptions) + "\n</root>";
console.timeEnd('XML encode');

console.time('XML decode');
let xmlJson = convert.xml2json(xmlData, { compact: true });
let xmlDecoded = JSON.parse(xmlJson);
console.timeEnd('XML decode');

// ---------- SERIALISATION EN PROTOBUF ----------
console.time('Protobuf encode');

// Vérifier conformité avec le schéma Protobuf
let errMsg = StaffListType.verify(staffRoot);
if (errMsg) throw Error(errMsg);

// Créer le message Protobuf
let message = StaffListType.create(staffRoot);

// Encoder en binaire
let buffer = StaffListType.encode(message).finish();
console.timeEnd('Protobuf encode');

console.time('Protobuf decode');
let decodedMessage = StaffListType.decode(buffer);
let protoDecoded = StaffListType.toObject(decodedMessage); // Message → objet JS
console.timeEnd('Protobuf decode');

// ---------- ECRITURE DES FICHIERS ----------
fs.writeFileSync('staff.json', jsonData);
fs.writeFileSync('staff.xml', xmlData);
fs.writeFileSync('staff.proto', buffer);

// ---------- MESURE DES TAILLES ----------
const jsonSize = fs.statSync('staff.json').size;
const xmlSize = fs.statSync('staff.xml').size;
const protoSize = fs.statSync('staff.proto').size;

console.log(`Taille de 'staff.json' : ${jsonSize} octets`);
console.log(`Taille de 'staff.xml'  : ${xmlSize} octets`);
console.log(`Taille de 'staff.proto': ${protoSize} octets`);
