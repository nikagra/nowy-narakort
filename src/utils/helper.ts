import * as fs from 'fs';
import * as util from 'util';
import {AirQualityResult} from '../services/air-quality/service';
import * as Mustache from 'mustache';

/** Rendered template using provided parameters */
export async function prepareTemplatedResponse(templateName: string, params: AirQualityResult): Promise<string> {
    const readFile = util.promisify(fs.readFile);
    let template = await readFile(process.cwd() + '/resources/' + templateName + '.mustache')
        .then(buffer => buffer.toString());
    return Mustache.render(template.toString(), params);
}
