const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const xml2js = require('xml2js');

const app = express();
const port = 3001;
const xmlFilePath = 'incidents.xml';

app.use(cors());
app.use(bodyParser.json());

// Load incidents from XML file on server start
let incidents = [];

try {
  const xmlData = fs.readFileSync(xmlFilePath, 'utf-8');
  xml2js.parseString(xmlData, (err, result) => {
    if (!err) {
      incidents = result.incidents.incident || [];
    }
  });
} catch (error) {
  console.error('Error reading XML file:', error);
}

// Routes
app.get('/incidents', (req, res) => {
  res.json(incidents);
});

app.post('/incidents', (req, res) => {
  const newIncident = req.body;
  incidents.push(newIncident);

  // Save incidents to XML file
  const builder = new xml2js.Builder();
  const xmlData = builder.buildObject({ incidents: { incident: incidents } });

  fs.writeFile(xmlFilePath, xmlData, (err) => {
    if (err) {
      console.error('Error writing to XML file:', err);
    }
  });

  res.status(201).json(newIncident);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
