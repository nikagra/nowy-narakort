import {InvalidCommandParamsError, UnableToRetrieveStationsError} from "../errors";
import got from 'got';
import haversineDistance from 'haversine-distance';

type Station = { id: number; gegrLat: string; gegrLon: string, stationName: string }

/** Client initialization options */
export interface ClientOptions {
    baseUrl?: string
}

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
        console.log(args);
        if (args.length != 2) {
            throw new InvalidCommandParamsError(
                'Invalid number of command arguments',
            );
        }
        return {latitude: parseFloat(args[0]), longitude: parseFloat(args[1])}
    }
}

export default class Client {

    private readonly baseUrl: string;

    constructor({baseUrl = "http://api.gios.gov.pl/pjp-api/rest"}: ClientOptions = {}) {
        this.baseUrl = baseUrl;
    }

    public async getClosestStation(args: string): Promise<Station> {
        let params = ClientRequestParams.parseParams(args);
        let stations = await this.getStations()
        if (stations.length == 0) {
            throw new UnableToRetrieveStationsError()
        }
        let stationsWithDistance = stations
            .map(v => [v, haversineDistance({lat: parseFloat(v.gegrLat), lon: parseFloat(v.gegrLon)}, {lat: params.latitude, lon: params.longitude})]);
        return stationsWithDistance.reduce((min, v) => v[1] < min[1] ? v : min, stationsWithDistance[0])[0] as Station;
    }

    private async getStations(): Promise<Station[]> {
        try {
            const response = await got.get(this.baseUrl + "/station/findAll");
            return JSON.parse(response.body);
        } catch (e) {
            console.log(e)
            return [];
        }
    }
}
