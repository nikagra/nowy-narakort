import Client from './client';
import Service, {ClientRequestParams} from './service';
import {InvalidCommandParamsError} from '../../errors';

describe("Parsing input parameters", () => {

    it("should work for proper input", () => {
        // Given
        let params = '51.11 17.022222';

        //When
        let result = ClientRequestParams.parseParams(params)

        // Then
        expect(result).toEqual({latitude: 51.11, longitude: 17.022222})
    });

    it("should fail for improper input", () => {
        // Given
        let params = 'what to do?';

        // When & Then
        expect(() => ClientRequestParams.parseParams(params)).toThrow(new InvalidCommandParamsError('Invalid number of command arguments'));
    });
});

describe("Air quality service", () => {

    let client: any;

    beforeEach(function () {
        client = jasmine.createSpyObj("client", ["getClosestStation", "getAirQualityIndex"]);
    });

    it("should return air quality index for correct parameters", async () => {
        // Given
        let params = '51.11 17.022222';
        client.getClosestStation.and.returnValue({
            id: 1,
            gegrLat: '51.11',
            gegrLon: '17.022222',
            stationName: 'Wrocław - Korzeniowskiego',
            city: {name: 'Wrocław'}
        });
        client.getAirQualityIndex.and.returnValue({stCalcDate: '2021-05-21 03:20:20', stIndexLevel: {id: '1', indexLevelName: 'Bez zmian ☢️'}});
        let service = new Service(<Client>client);

        // When
        let result = await service.getAirQualityIndexForCoordinates(params);

        // Then
        expect(client.getClosestStation).toHaveBeenCalledWith(51.11, 17.022222);
        expect(client.getAirQualityIndex).toHaveBeenCalledWith(1);
        expect(result).toEqual({station: 'Wrocław - Korzeniowskiego', city: 'Wrocław', date: '2021-05-21 03:20:20', status: 'Bez zmian ☢️'},
            'getUsers method expect Array containing "city" property and value as "Wrocław"')
    });
});

