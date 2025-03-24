const axios = require('axios');
const { Buffer } = require('buffer');
const xml2js = require('xml2js');

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

async function testSoapEndpoint() {
  try {
    console.log('Sending request to:', soapSmsEndpoint);
    console.log('SOAP Payload:', soapSmsPayload);

    const response = await axios.post(soapSmsEndpoint, soapSmsPayload, {
      headers: {
        'Content-Type': 'text/xml'
      }
    });

    console.log('Response Status:', response.status);

    // Parse the XML response directly
    const xmlResponse = response.data;

    xml2js.parseString(xmlResponse, (err, result) => {
      if (err) {
        console.error('Error parsing XML:', err);
      } else {
        const base64EncodedInnerResponse = result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:getAllGroupsAndClassesResponse'][0]['return'][0]['_'];
        const decodedInnerResponse = Buffer.from(base64EncodedInnerResponse, 'base64').toString('utf-8');

        // Parse the decoded inner XML response
        xml2js.parseString(decodedInnerResponse, (innerErr, innerResult) => {
          if (innerErr) {
            console.error('Error parsing inner XML:', innerErr);
          } else {
            console.log('Parsed Inner Response:', JSON.stringify(innerResult, null, 2));
          }
        });
      }
    });
  } catch (error) {
    if (error.response) {
      console.error('Error Status:', error.response.status);
      console.error('Error Data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testSoapEndpoint();
