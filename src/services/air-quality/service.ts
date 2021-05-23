import Client from './client';
import {InvalidCommandParamsError} from '../../errors';

/** Air quality request parameters */
class ClientRequestParams {
    latitude: number;
    longitude: number;

    constructor(latitude: number, longitude: number) {
        this.latitude = latitude;
        this.longitude = longitude;
    }

    static parseParams(text: string): ClientRequestParams {
        let args: string[] = text.split(" ").filter(v => v.length != 0).map(v => v.trim());
        if (args.length != 2) {
            throw new InvalidCommandParamsError(
                'Invalid number of command arguments',
            );
        }
        return {latitude: parseFloat(args[0]), longitude: parseFloat(args[1])}
    }
}

/** Air quality result */
export interface AirQualityResult {
    station: string,
    city: string,
    date: string | undefined,
    status: string | undefined
}

export default class Service {
    private readonly client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    public async getAirQualityIndexForCoordinates(params: string): Promise<AirQualityResult> {
        let parsedParams = ClientRequestParams.parseParams(params);
        let closestStation = await this.client.getClosestStation(parsedParams.latitude, parsedParams.longitude);
        let airQualityIndex = await this.client.getAirQualityIndex(closestStation.id);
        return {
            station: closestStation.stationName,
            city: closestStation.city.name,
            date: airQualityIndex?.stCalcDate != null? airQualityIndex?.stCalcDate : 'Nieznana',
            status: airQualityIndex?.stIndexLevel?.indexLevelName != null ? airQualityIndex?.stIndexLevel?.indexLevelName : 'Nieznany'
        };
    }
}
