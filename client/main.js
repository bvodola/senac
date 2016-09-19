import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { UI } from 'meteor/ui';
import { Session } from 'meteor/session';

import { Categories } from '../imports/api/categories.js';
import { Courses } from '../imports/api/courses.js';
import { Units } from '../imports/api/units.js';
import { Leads } from '../imports/api/leads.js';

import '../imports/lib/helpers.js';
import './main.html';

// =========
// Templates
// =========

// =================
// leadForm Template
// =================

Template.leadForm.events({
  'submit #leadForm': function(event) {
    event.preventDefault();

    // Sets initial value for some variables
    let lead = {}; // Info about the lead
    let pixel = getPixelInfo();

    // Set some variables to be passed to the createLead Method
    lead.email = $("#leadForm input[name=email]").val();
    lead.source = pixel.source;
    
    // Call Insert Lead Function
    Meteor.call('createLead', lead, pixel);

    // Opens the Course Information Page and Hides the courseModal
    window.open($("#leadForm").attr('action'), '_blank');
    $("#leadForm input[name=email]").val('');
  }
})

// ===================
// courseList Template
// ===================

Template.courseList.helpers({
  'course': function(){
      return Session.get('course');
  },
});

Template.courseList.events({
  'click .modal-button': function(event) {
    $('.ui.modal').modal('show');
    Session.set('modalTitle', $(event.target).data('title'));
    Session.set('modalLink', $(event.target).data('link'));
  },
  
});


// ====================
// courseModal Template
// ====================

Template.courseModal.helpers({
  'modalTitle': function(){
    return Session.get('modalTitle');
  },

  'modalLink': function(){
    return Session.get('modalLink');
  }
});

Template.courseModal.events({
  'click .modal-close': function(event) {
    event.preventDefault();
    // $('.ui.modal').modal('hide');
  },

  'submit #formInfoCurso': function(event) {
    event.preventDefault();

    // Sets initial value for some variables

    let lead = {}; // Info about the lead
    let pixel = getPixelInfo(); // Info about the generated pixel

    // Set some variables to be passed to the createLead Method
    lead.email = $("#formInfoCurso input[name=email]").val();
    lead.source = pixel.source;
    lead.course = Session.get('modalTitle');
    lead.modality = Session.get('choosenModality');
    lead.units = Session.get('choosenUnits');

    // Call Insert Lead Function
    Meteor.call('createLead', lead, pixel);

    // Opens the Course Information Page and Hides the courseModal
    window.open($("#formInfoCurso").attr('action'), '_blank');
    $('.ui.modal').modal('hide');
    
  }
});

// =====================
// courseSearch Template
// =====================

Template.courseSearch.onCreated(function() {
  Session.setDefault('choosenCategory',false);
  Session.setDefault('choosenModality','Presencial');
  Session.setDefault('searchedModality','Presencial');
});

// ******
// Events
// ******

Template.courseSearch.events({

  'click .modality-radio': function(event) {

    if($(event.target).html() == 'Presencial') {
      Session.set('choosenModality', 'Presencial');
      $(".unit-menu").show('fade'); // Show Units Menu
    } else {
      Session.set('choosenModality', 'EAD');
      $(".unit-menu").hide('fade'); // Hide Units Menu
    }
  },
  
  'submit form': function(event){
    event.preventDefault();
    
    $("html, body").animate({ scrollTop: $('#courseListWrapper').offset().top }, "slow");

    
    // Set the query object
    let query = new Object();
    
    // Modality
    if ( $("[name=modality]:checked").val() != 'all' && $("[name=modality]:checked").val() != '') {
      query.modality = $("[name=modality]:checked").val();
      Session.set('searchedModality', $("[name=modality]:checked").val());
    }

    
    // Units
    let units = [];
    $("[name='units[]']:checked").each( function(){
      units.push($(this).val());
    });

    if(query.modality == 'Presencial') {
      query.units = { $in: units };
      Session.set('choosenUnits', units);
    }

    // Category
    query.category = $("#courseCategory").val();
    Session.set('choosenCategory', $("#courseCategory").val());
    Session.set('course', Courses.find(query, {sort: {title: 1}}).fetch());
    Session.set('courseNumber', Courses.find(query, {sort: {title: 1}}).count());
  },
  
  'change [name=choose-units]': function(event) {
    
    if($(event.target).is(":checked")) {
      $(".unit-menu-fields").show('fade');
    }
    else {
      $(".unit-menu-fields").hide('fade');
      $(".unit-menu-fields input[type=checkbox]").each(function(){
        if($(this).prop('checked') == false)
          $(this).click();
      });
    }
  },

  'click .all-units': function(event) {
    $(".unit-menu-fields input[type=checkbox]").each(function(){
      event.preventDefault();
      if($(this).prop('checked') == false)
        $(this).click();
    });
  },

  'click .no-unit': function(event) {
    event.preventDefault();
    $(".unit-menu-fields input[type=checkbox]").each(function(){
      if($(this).prop('checked') == true)
        $(this).click();
    });
  },

  'click .unit-region-title': function(event) {
    event.preventDefault();
    $(event.currentTarget).parent('.unit-region-wrapper').children('div.field').each(function() {
      if($(this).children().children("input[type=checkbox]").prop('checked') == true)
        $(this).children().children("input[type=checkbox]").prop('checked', false);
      else
        $(this).children().children("input[type=checkbox]").prop('checked', true);
    });
  }
  
  
});

// *******
// Helpers
// *******
Template.courseSearch.helpers({
  'unit': function(region) {
    let filters = {}
    if(typeof region != "undefined") {
      filters = {region: region};
    }
    return Units.find(filters, {sort: {name: 1}});
  },

  
  'categories': function() {
    console.log(Categories.find({modality: Session.get('choosenModality')}, {sort: {name: 1}}).fetch());
    return Categories.find({modality: Session.get('choosenModality')}, {sort: {name: 1}});
  },
  
  'choosenCategory': function() {
    return Session.get('choosenCategory');
  },

  'searchedModality': function() {
    if(Session.get('searchedModality') == 'Presencial') {
      return 'presenciais';
    }

    else if(Session.get('searchedModality') == 'EAD') {
      return 'EAD';
    }

    else {
      return '';
    }
  },

  'courseNumber': function() {
    return Session.get('courseNumber');
  },

  'hasCourses': function() {
    if(Session.get('courseNumber') > 0) {
      return true;
    }
    else {
      return false;
    }
  }
  
});


Template.secondaryForm.onRendered(function() {
  $('.ui.dropdown').dropdown();
  VMasker(document.querySelector("[name=phone]")).maskPattern("(99) 99999-9999");
});

Template.secondaryForm.helpers({
  'lead': function() {
    return Leads.findOne(FlowRouter.getParam('leadId'));
  }
});

// ===============
// admin Templates
// ===============

// ******************
// addCourse Template
// ******************

// Events
Template.addCourse.events({
  'submit form#addCourse': function(event){
    event.preventDefault();
    
    // Saves Entry
    Courses.insert({
      title: $('[name=title]').val(),
      link: $('[name=link]').val(),
      description: $('[name=description]').val(),
      category: $('[name=category]').val(),
      modality: $('[name=modality]').val(),
      units: $('[name=units]').val()
    });
    
    // Clear Form
    $('[name=title]').val('');
    $('[name=link]').val('');
    $('[name=description]').val('');
    $('[name=category]').val('');
    $('[name=modality]').val('');
    $('[name=units]').val('');
    $('[name=units]').dropdown('clear');

  }
});

// Helpers
Template.addCourse.helpers({
  'unit': function(){
    return Units.find();
  },
  'category': function(){
    return Categories.find();
  }
});


// ****************
// addUnit template
// ****************

Template.addUnit.events({
  'submit #addUnitForm': function(event){
    event.preventDefault();
    let unit = $('[name=unit]').val();
    Units.insert(
      {name: unit}
    );
    $('[name=unit]').val('');
  }
});

// editUnits template

Template.editUnits.helpers({
  'units': function(){
    return Units.find();
  },
});

// unitRow template

Template.unitRow.events({
  'keyup input': function(event) {
    Units.update(this.unit._id, {
      $set: {
        name: $(event.currentTarget).parent().children(".unit-name").val(),
        region: $(event.currentTarget).parent().children(".unit-region").val()
      }
    })
  },

  'click .delete-unit': function(event) {
    event.preventDefault();
    Units.remove(this.unit._id);
  }
});

// ********************
// addCategory template
// ********************

Template.addCategory.events({
  'submit form#addCategory': function(event){
    event.preventDefault();
    let category = $('[name=newCategory]').val();
    console.log(category);
    Categories.insert(
      {name: category}
    );
    console.log(Categories.find().fetch());
    $('[name=newCategory]').val('');
  }
});

// ***********************
// editCategories template
// ***********************

Template.editCategories.helpers({
  'categories': function() {
    return Categories.find({}, { sort: { name: 1}});
  }
});

// ********************
// categoryRow template
// ********************

Template.categoryRow.events({
    'keyup input.editable, change input.editable, change select.editable': _.debounce(function(event) {

    let set = {};
    
    if($(event.target).attr('type') == 'checkbox') {
      set[$(event.target).attr('name')] = $(event.target).prop('checked');
    }
    else {
      set[$(event.target).attr('name')] = $(event.target).val();
    }

    Categories.update(this.category._id, {
      $set: set
    }, function(e,s) {
      if(!e)
        console.log(s);
      else
        console.log(e);
    });
  }, 200),

  'click .remove-category': function(event) {
    event.preventDefault();
    Categories.remove(this.category._id, function(e,s) {
      if(!e)
        console.log(s);
      else
        console.log(e);
    }); 
  }

});

// ********************
// editCourses template
// ********************

Template.editCourses.helpers({
  courses: function() {
    return Courses.find({}, {sort: {category: 1, modality: -1, title: 1}}).fetch();
  }
});

// ***********************
// adminCourseRow template
// ***********************

Template.adminCourseRow.helpers({
  categories: function(){
    return Categories.find().fetch();
  },
  units: function(){
    return Units.find().fetch();
  }
});

Template.adminCourseRow.events({
  'change input[type=checkbox]': function(event){

    // =====
    // Units
    // =====
    let units = [];
    $("[name='"+this.course._id+"_units[]']:checked").each( function(){
      units.push($(this).val());
    });

    Courses.update(this.course._id, {
      $set: { units: units },
    }, function(e,id) {
      if(!e)
        console.log("id = "+id);
      else
        console.log("e = "+e);
    });

  },

  'change select[name=category]': function(event) {

    Courses.update(this.course._id, {
      $set: { category: $(event.target).val() },
    }, function(e,id) {
      if(!e)
        console.log("id = "+id);
      else
        console.log("e = "+e);
    });

  },

  'click a.delete-course': function(event) {
    event.preventDefault();
    Courses.remove($(event.currentTarget).data('id'));
  },

  'keyup .course-description': function(event) {

    let newDescription = $(event.target).val();
    console.log(newDescription);

    Courses.update(this.course._id, {
      $set: { description: newDescription },
    }, function(e,s) {
      if(!e)
        console.log("success = "+s);
      else
        console.log("e = "+e);
    });

  }
});

// **************
// leads template
// **************

Template.leads.helpers({
  'leads': function() {
    return Leads.find({},{sort: {date: 1 }});
  }
});

// ==========
// UI Helpers
// ==========

UI.registerHelper('selected', function(key, value){
  return key == value ? 'selected': '';
});

UI.registerHelper('checked', function(key, array){
  return $.inArray(key,array) == -1 ? '': 'checked';
});

UI.registerHelper('date', function(date) {
  let d = new moment(date);
  return d.format('DD/MM/YYYY HH:mm');

});

UI.registerHelper('getAllUnits', function(){
  return Units.find({}, { sort: { name: 1}});
});

UI.registerHelper('getAllCourses', function(){
  return Courses.find({}, { sort: { title: 1}});
});

// ==============
// Client Methods
// ==============

// ============
// getPixelInfo
// ============
getPixelInfo = function() {
  let pixel = {}; // Info about the generated pixel
  pixel.source = Cookie.get('utm_source'); // The Source of the page traffic

  // Sets the click_id attribute according to the cookies saved
  if(pixel.source == 'cityads') {
    pixel.cityadsClickId = Cookie.get('cityads_click_id');
  }
  if(pixel.source == 'zanox') {
    if(typeof FlowRouter.getQueryParam('zanpid') != "undefined") {
      pixel.partnerId = FlowRouter.getQueryParam('zanpid');
    }
    else {
      pixel.partnerId = '';
    }
  }

  return pixel;
}