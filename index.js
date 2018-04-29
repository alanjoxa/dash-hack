const dashList = require('./dash.json');
const dash_button = require('node-dash-button');
const say = require('say');
const db = require('./db');

const dash = dash_button(dashList.map(dash => dash.address), null, null, 'all'); //address from step above
dash.on("detected", dash_id => dashList.forEach(dash => {
        if(dash.address === dash_id) {
            const txt = `Found ${dash.name}`;
            console.log(txt);
            say.speak(txt);
            db(dash.name, Date().toString());
        }
    })
);