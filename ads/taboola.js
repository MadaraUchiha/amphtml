/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {writeScript} from '../src/3p';
import {assert} from '../src/asserts';



/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function taboola(global, data) {

    const blackList = ['height', 'initialWindowHeight', 'initialWindowWidth', 'type', 'width', 'placement', 'mode'];

    const validateData = function(data, mandatoryFields) {
        for (let i = 0; i < mandatoryFields.length; i++) {
            const field = mandatoryFields[i];
            assert(data[field],
                'Missing attribute for amp-taboola: %s.', field);
        }
    };

    const valdateExactlyOne = function (data, alternativeFields) {
        var countFileds = 0;

        for (let i = 0; i < alternativeFields.length; i++) {
            const field = alternativeFields[i];
            if (data[field]) {
                countFileds += 1;
            }
        }
        assert(countFileds === 1,
            'Attribute mismatch. amp-taboola must contain exactly one of those attributes: %s',
            alternativeFields.join(', '));
    };

    validateData(data, ['publisher', 'placement', 'mode']);
    valdateExactlyOne(data, ['article', 'video', 'photo', 'search', 'category', 'homepage', 'others']);

    const params = {
        referrer: data.referrer || global.context.referrer,
        url: data.url || global.context.canonicalUrl
    };


    Object.keys(data).forEach(k => {
        if (blackList.indexOf(k) === -1) {
            params[k] = data[k]
        }
    });

    (global._taboola = global._taboola || []).push([{
            viewId: global.context.pageViewId,
            publisher: data.publisher,
            placement: data.placement,
            mode:      data.mode,
            framework:  'amp',
            container: 'c'
        },
        params]);

    global.context.observeIntersection(function(changes) {
        changes.forEach(function(c) {
            if (c.intersectionRect.height) {
                global._taboola.push({visible: true, boundingClientRect: c.intersectionRect, placement: data.placement});
            }
        });
    });

    writeScript(global, `https://cdn.taboola.com/libtrc/${data.publisher}/loader.js`);
}
