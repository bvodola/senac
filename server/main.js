import { Meteor } from 'meteor/meteor';
import '../imports/api/categories.js';
import '../imports/api/courses.js';
import '../imports/api/units.js';
import { Leads } from '../imports/api/leads.js';

Meteor.startup(() => {
	Leads._ensureIndex({email: 1}, {unique: 1});
	process.env.MOBILE_DDP_URL = 'http://192.168.2.109:3000';
	process.env.MOBILE_ROOT_URL = 'http://192.168.2.109:3000';

});