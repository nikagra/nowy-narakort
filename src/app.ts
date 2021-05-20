import "./utils/env";
import {App, LogLevel, SlackCommandMiddlewareArgs} from '@slack/bolt';
import Client from "./clients/air-quality"

// Initializes your app with your bot token and signing secret
const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    logLevel: LogLevel.DEBUG
});

const client = new Client();

app.command("/air", async ({command, ack, say}: SlackCommandMiddlewareArgs) => {
    console.log(command);
    await ack();

    let response = await client.getClosestStation(command.text)
    console.log(response);
    let airQualityIndex = await client.getAirQualityIndex(response.id)
    console.log(airQualityIndex);

    await say(`Aktualny stan jakości powietrza w mieście ${response.city.name} 🏙️: ${airQualityIndex?.stIndexLevel.indexLevelName}.`
    + ` Pomiar wykonany na stacji "${response.stationName}" o dacie ${airQualityIndex?.stCalcDate} 🌡`);
});

(async () => {
    // Start your app
    await app.start(Number(process.env.PORT) || 3000);

    console.log('⚡️ Bolt app is running!');
})();
