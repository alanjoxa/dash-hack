const fs = require('fs');
const readline = require('readline');
const google = require('googleapis').google;
const OAuth2Client = google.auth.OAuth2;
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = 'credentials.json';
const spreadsheetId = "1xUgIcrT3KIah2dVzoIHq-mrSkJcNYyp6lL5tbXPNt3o";
let AUTH;

module.exports = function(name, time) {

  // Load client secrets from a local file.
  fs.readFile('client_secret.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Sheets API.
    authorize(JSON.parse(content), write);
  });

  /**
   * Create an OAuth2 client with the given credentials, and then execute the
   * given callback function.
   * @param {Object} credentials The authorization client credentials.
   * @param {function} callback The callback to call with the authorized client.
   */
  function authorize(credentials, callback) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) return getNewToken(oAuth2Client, callback);
      oAuth2Client.setCredentials(JSON.parse(token));
      callback(oAuth2Client);
    });
  }

  /**
   * Get and store new token after prompting for user authorization, and then
   * execute the given callback with the authorized OAuth2 client.
   * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
   * @param {getEventsCallback} callback The callback for the authorized client.
   */
  function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) return callback(err);
        oAuth2Client.setCredentials(token);
        // Store the token to disk for later program executions
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
          if (err) console.error(err);
          console.log('Token stored to', TOKEN_PATH);
        });
        callback(oAuth2Client);
      });
    });
  }

  /**
   * Prints the names and majors of students in a sample spreadsheet:
   * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
   * @param {OAuth2Client} auth The authenticated Google OAuth client.
   */


  function write(auth) {
    const sheets = google.sheets({version: 'v4', auth});
    var values = [
    [name, time]
    // Additional rows ...
    ];
    var body = {
      values: values
    };

    sheets.spreadsheets.values.append({
      spreadsheetId: spreadsheetId,
      range: 'Sheet1!A:B',
      valueInputOption: 'RAW',
      resource: body
    }, function(err, result) {
      if(err) {
        // Handle error
        console.log(err);
      } else {
        console.log('%d cells updated.', result.updatedCells);
      }
    });
  }

}
