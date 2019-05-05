import AuthenticatedRoute from 'ghost-admin/routes/authenticated';

export default AuthenticatedRoute.extend({
    beforeModel() {
        this._super(...arguments);
        this.replaceWith('poster-editor.new', 'post');
    }
});
