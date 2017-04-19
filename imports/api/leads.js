import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Leads = new Mongo.Collection('leads');

Meteor.methods({

	// ==========
	// createLead
	// ==========
	'createLead'(lead,pixel = {}) {

		Leads.insert({
			name: lead.name,
		  email: lead.email,
			phone: lead.phone,
		  source: lead.source,
		  course: lead.course,
		  modality: lead.modality,
		  units: lead.units,
			cpf: lead.cpf,
			contact_time: lead.contact_time,
		  date: new Date().toJSON()
		}, function(e,leadId) {

		  // Checks if there was a lead added
		  if(!e) {

		    // If the Source of Traffic is CityAds, inserts their Pixel
		    if(lead.source == 'cityads') {
		    	if(Meteor.isClient) {
		      	$("body").prepend("<script type=\"text/javascript\" async=\"async\" src='https://cityadspix.com/track/"+leadId+"/ct/q1/c/26026?click_id="+pixel.cityadsClickId+"&customer_type=N&md=2'></script><noscript><img src='https://cityadspix.com/track/"+leadId+"/ct/q1/c/26026?click_id="+pixel.cityadsClickId+"&customer_type=N' width=\"1\" height=\"1\"></noscript>");
		      }
		      console.log("<script type=\"text/javascript\" async=\"async\" src='https://cityadspix.com/track/"+leadId+"/ct/q1/c/26026?click_id="+pixel.cityadsClickId+"&customer_type=N&md=2'></script><noscript><img src='https://cityadspix.com/track/"+leadId+"/ct/q1/c/26026?click_id="+pixel.cityadsClickId+"&customer_type=N' width=\"1\" height=\"1\"></noscript>");
		    }
		    else if(lead.source == 'zanox') {
		    	if(Meteor.isClient) {
	    			$("body").prepend("<script type=\"text/javascript\" src=\"http://ad.zanox.com/ppl/?17526C779878946&mode=[[1]]&OrderID=[["+leadId+"]]&PartnerID=[["+pixel.partnerId+"]]\"></script><noscript><img src=\"http://ad.zanox.com/ppl/?17526C779878946&mode=[[2]]&OrderID=[["+leadId+"]]&PartnerID=[["+pixel.partnerId+"]]\" width=\"1\" height=\"1\"></noscript>");
		    	}
		    	console.log("<script type=\"text/javascript\" src=\"http://ad.zanox.com/ppl/?17526C779878946&mode=[[1]]&OrderID=[["+leadId+"]]&PartnerID=[["+pixel.partnerId+"]]\"></script><noscript><img src=\"http://ad.zanox.com/ppl/?17526C779878946&mode=[[2]]&OrderID=[["+leadId+"]]&PartnerID=[["+pixel.partnerId+"]]\" width=\"1\" height=\"1\"></noscript>");
		    }

		  }
		  else {
		    console.log(e);
		  }
		});

	}

});
