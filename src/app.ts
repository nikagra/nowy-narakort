import "./utils/env";
import {App, LogLevel, SlackCommandMiddlewareArgs} from '@slack/bolt';
import Client from "./services/air-quality/client"
import {prepareTemplatedResponse} from './utils/helper';
import got from 'got';
import Service from './services/air-quality/service';
import {InvalidCommandParamsError, NoStationNearbyError, UnableToAirQualityIndexError, UnableToRetrieveStationsError} from './errors';
import {isCustomError} from 'defekt';

// Initializes your app with your bot token and signing secret
const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    logLevel: LogLevel.DEBUG
});

// Initialize Air Quality service
const slashCommand = "/aard";
const client = new Client();
const service = new Service(client);

app.command(`${slashCommand}`, async ({command, ack, say}: SlackCommandMiddlewareArgs) => {
        console.log(command);
        await ack();

        try {
            let airQualityResponse = await service.getAirQualityIndexForCoordinates(command.text);
            let renderedTemplate = await prepareTemplatedResponse("response", airQualityResponse);
            await got.post(command.response_url, {
                    json: JSON.parse(renderedTemplate),
                    responseType: 'json'
                }
            );
        } catch (e) {
            if (isCustomError(e)) {
                switch (e.code) {
                    case InvalidCommandParamsError.code:
                        await say(`Niepoprawne parametry wejściowe :cry:\n Oczekiwane parametry to: \`[latitude longitude]\` :earth_africa:.\nPrzykład: \`${slashCommand} 50.061389 19.938333\``);
                        break;
                    case UnableToRetrieveStationsError.code:
                        await say('Błąd podczas próby pobierania najbliższej do Ciebie stacji pomiarowej :tent:.');
                        break;
                    case NoStationNearbyError.code:
                        await say('Brak stacji pomiarowej w odpowiednio bliskiej odległości :milky_way:.');
                        break;
                    case UnableToAirQualityIndexError.code:
                        await say('Błąd podczas pobierani danych pomiarowych z najbliższej do Ciebie stacji pomiarowej :satellite_antenna:.');
                        break;
                    default:
                        console.log(e);
                        await say('Nieoczekiwany błąd :adhesive_bandage:.');
                }
            } else {
                throw e;
            }
        }
    }
);

(async () => {
    // Start your app
    await app.start(Number(process.env.PORT) || 3000);

    console.log('⚡️ Bolt app is running!');
})();

