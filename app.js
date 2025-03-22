const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const port = 3000;
//soap request for smartschool api
//checken of het al van ons is.
const soapSmsEndpoint = 'https://snh.smartschool.be/Webservices/V3';
const soapSmsPayload = `
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:web="https://snh.smartschool.be/Webservices/V3">
   <soapenv:Header/>
   <soapenv:Body>
      <web:getAllGroupsAndClasses>
         <web:password>46664f0e555d0635fe45</web:password>
         /
      </web:getAllGroupsAndClasses>
   </soapenv:Body>
</soapenv:Envelope>
`;

app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the 'public' directory

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Ensure the views directory is set correctly

// Serve static files from the 'public' directory
app.use(express.static('public'));
//app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the 'public' directory

//api informat
app.get('/', async (req, res) => {
  const baseUrl = "https://informatonline-sync.azurewebsites.net";
  const username = "034447"; // or "034454"
  const password = "IOLSpes2024!";
  const reservationsEndpoint = `${baseUrl}/reservations`;

  try {
    const response = await axios.get(reservationsEndpoint, {
      auth: {
        username: username,
        password: password
      }
    });

    const reservations = response.data;
    res.render('index', { reservations }); // Pass reservations to the template
  } catch (error) {
    console.error('Error fetching reservations:', error.message);
    console.error('Error details:', error.response ? error.response.data : 'No response data');
    res.status(500).render('index', { reservations: [] }); // Pass an empty array if there's an error
  }
});

// New route for SmartschoolSOAP request
app.get('/groups-and-classes', async (req, res) => {
  try {
    const response = await axios.post(soapSmsEndpoint, soapSmsPayload, {
      headers: {
        'Content-Type': 'text/xml'
      }
    });

    // Assuming the response is Base64 encoded, decode it
    const base64EncodedResponse = response.data;
    const decodedResponse = Buffer.from(base64EncodedResponse, 'base64').toString('utf-8');

    // Parse the decoded XML response if necessary
    // For simplicity, we assume the response is already in a usable format
    const groupsAndClasses = decodedResponse; // Adjust this based on actual response 
    console.log('Groups and Classes:', groupsAndClasses); // Debug log

    res.sendFile(path.join(__dirname, 'public', 'pages-blank.html')); // Serve the static HTML file
  } catch (error) {
    console.error(error);
    res.sendFile(path.join(__dirname, 'public', 'pages-blank.html')); // Serve the static HTML file
  }
});

// Route for the scan page
app.get('/login', (req, res) => {
  res.render('login'); // Render the 'scan' template
});

app.listen(port, () => {
  console.log(`REFTER running at http://localhost:${port}`);
});