import moment from 'moment';
import {Response} from 'ember-cli-mirage';
import {dasherize} from '@ember/string';
import {isArray} from '@ember/array';
import {isBlank, isEmpty} from '@ember/utils';
import {paginateModelCollection} from '../utils';

function normalizeBooleanParams(arr) {
    if (!isArray(arr)) {
        return arr;
    }

    return arr.map((i) => {
        if (i === 'true') {
            return true;
        } else if (i === 'false') {
            return false;
        } else {
            return i;
        }
    });
}

// TODO: use GQL to parse filter string?
function extractFilterParam(param, filter) {
    let filterRegex = new RegExp(`${param}:(.*?)(?:\\+|$)`);
    let match;

    let [, result] = filter.match(filterRegex) || [];
    if (result && result.startsWith('[')) {
        match = result.replace(/^\[|\]$/g, '').split(',');
    } else if (result) {
        match = [result];
    }

    return normalizeBooleanParams(match);
}

// NOTE: mirage requires Model objects when saving relationships, however the
// `attrs` on POST/PUT requests will contain POJOs for authors and tags so we
// need to replace them
function extractAuthors(posterAttrs, users) {
    return posterAttrs.authors.map(author => users.find(author.id));
}

function extractTags(posterAttrs, tags) {
    return posterAttrs.tags.map((requestTag) => {
        let tag = tags.find(requestTag.id);

        if (!tag) {
            tag = tag.create(requestTag);
        }

        return tag;
    });
}

export default function mockPosters(server) {
    server.post('/posters', function ({posters, users, tags}) {
        let attrs = this.normalizedRequestAttrs();

        attrs.authors = extractAuthors(attrs, users);
        attrs.tags = extractTags(attrs, tags);

        if (isBlank(attrs.slug) && !isBlank(attrs.title)) {
            attrs.slug = dasherize(attrs.title);
        }

        return posters.create(attrs);
    });

    // TODO: handle authors filter
    server.get('/posters/', function ({posters}, {queryParams}) {
        let {filter, page, limit} = queryParams;

        page = +page || 1;
        limit = +limit || 15;

        let statusFilter = extractFilterParam('status', filter);

        let collection = posters.all().filter((poster) => {
            let matchesStatus = true;

            if (!isEmpty(statusFilter)) {
                matchesStatus = statusFilter.includes(poster.status);
            }

            return matchesStatus;
        });

        return paginateModelCollection('posters', collection, page, limit);
    });

    server.get('/posters/:id/', function ({posters}, {params}) {
        let {id} = params;
        let poster = posters.find(id);

        return poster || new Response(404, {}, {
            errors: [{
                type: 'NotFoundError',
                message: 'Poster not found.'
            }]
        });
    });

    server.put('/posters/:id/', function ({posters, users, tags}, {params}) {
        let attrs = this.normalizedRequestAttrs();
        let poster = posters.find(params.id);

        attrs.authors = extractAuthors(attrs, users);
        attrs.tags = extractTags(attrs, tags);

        attrs.updatedAt = moment.utc().toDate();

        return poster.update(attrs);
    });

    server.del('/posters/:id/');
}
