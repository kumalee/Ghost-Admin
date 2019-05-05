import PostsController from './posts';

const TYPES = [{
    name: 'All posters',
    value: null
}, {
    name: 'Draft posters',
    value: 'draft'
}, {
    name: 'Published posters',
    value: 'published'
}, {
    name: 'Scheduled posters',
    value: 'scheduled'
}, {
    name: 'Featured posters',
    value: 'featured'
}];

const ORDERS = [{
    name: 'Newest',
    value: null
}, {
    name: 'Oldest',
    value: 'published_at asc'
}, {
    name: 'Recently updated',
    value: 'updated_at desc'
}];

/* eslint-disable ghost/ember/alias-model-in-controller */
export default PostsController.extend({
    init() {
        this._super(...arguments);
        this.availableTypes = TYPES;
        this.availableOrders = ORDERS;
    },

    actions: {
        openEditor(poster) {
            this.transitionToRoute('poster-editor.edit', 'poster', poster.get('id'));
        }
    }
});
