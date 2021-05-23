/** This exception is thrown  when input parameters are incorrect */
import {defekt} from 'defekt';

export class InvalidCommandParamsError extends defekt({ code: 'InvalidCommandParams' }) {} {
}

/** This exception is thrown when retrieval of station information fails */
export class UnableToRetrieveStationsError extends defekt({ code: 'UnableToRetrieveStations' }) {} {
}

/** This exception is thrown when retrieval of station information fails */
export class NoStationNearbyError extends defekt({ code: 'NoStationNearby' }) {} {
}

/** This exception is thrown when retrival of measurements for station fails */
export class UnableToAirQualityIndexError extends defekt({ code: 'UnableToAirQualityIndex' }) {} {
}
