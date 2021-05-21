import * as fs from 'fs';
import * as util from 'util';

export async function loadTemplate(template: string): Promise<string> {
    const readFile = util.promisify(fs.readFile);
    return await readFile(process.cwd() + "/resources/" + template + ".mustache")
        .then(buffer => buffer.toString());
}
