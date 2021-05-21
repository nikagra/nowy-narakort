import "./utils/env";
import {App, LogLevel, SlackCommandMiddlewareArgs} from '@slack/bolt';
import Client from "./clients/air-quality"
import * as Mustache from 'mustache';
import {loadTemplate} from './utils/helper';
import got from 'got';

// Initializes your app with your bot token and signing secret
const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    logLevel: LogLevel.DEBUG
});

// Initialize Air Quality service client
const client = new Client();

interface MustacheParams {
    station: string,
    city: string,
    date: string|undefined,
    status: string|undefined
}

app.command("/air", async ({command, ack}: SlackCommandMiddlewareArgs) => {
    console.log(command);
    await ack();

    let closestStation = await client.getClosestStation(command.text)
    let airQualityIndex = await client.getAirQualityIndex(closestStation.id)
    console.log(airQualityIndex);

    let params: MustacheParams = {
        station: closestStation.stationName,
        city: closestStation.city.name,
        date: airQualityIndex?.stCalcDate,
        status: airQualityIndex?.stIndexLevel.indexLevelName
    }
    let template = await loadTemplate("response");
    let output = Mustache.render(template.toString(), params);
    console.log(output);
    await got.post(command.response_url, { json: JSON.parse(output), responseType: 'json'});
});

(async () => {
    // Start your app
    await app.start(Number(process.env.PORT) || 3000);

    console.log('⚡️ Bolt app is running!');
})();

