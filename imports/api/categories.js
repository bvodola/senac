import { Mongo } from 'meteor/mongo';
export const Categories = new Mongo.Collection('categories');

Meteor.methods({
	'findCategories'() {
		console.log(Categories.find({}, {sort: {name: 1}}).fetch());
		return Categories.find({}, {sort: {name: 1}}).fetch();
	}
});