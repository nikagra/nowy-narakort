import {NoStationNearbyError, UnableToAirQualityIndexError, UnableToRetrieveStationsError} from "../../errors";
import got from 'got';
import haversineDistance from 'haversine-distance';

interface StationCity { name: string }

interface Station { id: number; gegrLat: string; gegrLon: string, stationName: string, city: StationCity }

interface AirQualityIndexLevel { id: number, indexLevelName: string }

interface AirQualityIndex { stCalcDate: string, stIndexLevel: AirQualityIndexLevel}

/** Client initialization options */
export interface ClientOptions {
    baseUrl?: string
    radius?: number
}

export default class Client {

    private readonly baseUrl: string;
    private  readonly radius: number;

    constructor({baseUrl = "http://api.gios.gov.pl/pjp-api/rest", radius = 50000}: ClientOptions = {}) {
        this.baseUrl = baseUrl;
        this.radius = radius;
    }

    public async getClosestStation(latitude: number, longitude: number): Promise<Station> {
        let stations = await this.getStations()
        if (stations.length == 0) {
            throw new UnableToRetrieveStationsError("Unable to retrieve measurement stations from remote service");
        }
        let stationsWithDistance = stations
            .map(v => [v, haversineDistance({lat: parseFloat(v.gegrLat), lon: parseFloat(v.gegrLon)}, {lat: latitude, lon: longitude})]);
        let result = stationsWithDistance.reduce((min, v) => v[1] < min[1] ? v : min, stationsWithDistance[0]);
        if (result[1] > this.radius) {
            console.log(result[0], result[1]);
            throw new NoStationNearbyError();
        } else {
            return result[0] as Station;
        }
    }

    public async getAirQualityIndex(stationId: number): Promise<AirQualityIndex> {
        try {
            const response = await got.get(this.baseUrl + `/aqindex/getIndex/${stationId}`);
            return JSON.parse(response.body);
        } catch (e) {
            throw new UnableToAirQualityIndexError();
        }
    }

    private async getStations(): Promise<Station[]> {
        try {
            const response = await got.get(this.baseUrl + '/station/findAll');
            return JSON.parse(response.body);
        } catch (e) {
            console.log(e)
            return [];
        }
    }
}
