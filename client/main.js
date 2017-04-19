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

Template.courseRow.onRendered(function() {
  changeUnitName('.unit-badge');
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

    if (validateCPF($("#formInfoCurso input[name=cpf]").val())) {
      // Sets initial value for some variables
      let lead = {}; // Info about the lead
      let pixel = getPixelInfo(); // Info about the generated pixel

      // Set some variables to be passed to the createLead Method
      lead.name = $("#formInfoCurso input[name=name]").val();
      lead.email = $("#formInfoCurso input[name=email]").val();
      lead.phone = $("#formInfoCurso input[name=phone]").val();
      lead.cpf = $("#formInfoCurso input[name=cpf]").val();
      lead.contact_time = $("#formInfoCurso select[name=contact_time]").val();
      lead.source = pixel.source;
      lead.course = Session.get('modalTitle');
      lead.modality = Session.get('choosenModality');
      lead.units = Session.get('choosenUnits');

      if(confirm(`Seus dados estão corretos?\n\nCurso: ${lead.course}\n--------------\nNome: ${lead.name}\nCPF: ${lead.cpf}\nEmail: ${lead.email}\nTelefone: ${lead.phone}\nHorário de Contato: ${lead.contact_time}`)) {
        // Call Insert Lead Function
        Meteor.call('createLead', lead, pixel);

        // Opens the Course Information Page and Hides the courseModal
        window.open($("#formInfoCurso").attr('action'), '_blank');
        $('.ui.modal').modal('hide');
      } else {

      }


    } else {
      alert('CPF Inválido');
    }



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
      $(".unit-menu").show('fade', function() {
        changeUnitName('.unit-label');
      }); // Show Units Menu
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

    query.type = 'Graduação';

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
      $(".unit-menu-fields").show('fade', function(){
        changeUnitName('.unit-label');
      });
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

  'customUnits': function(region) {
    if(region === 'Capital') {
      return [
        { name: 'Santo Amaro' },
        { name: 'Aclimação' },
        { name: 'Francisco Matarazzo' },
        { name: 'Jabaquara' },
        { name: 'Lapa Faustolo' },
        { name: 'Lapa Scipião' },
        { name: 'Lapa Tito' },
        { name: 'Osasco' },
        { name: 'Santo André' },
        { name: 'Tiradentes' }
      ];
    }
    else if (region === 'Interior') {
      return [
        { name: 'Águas de São Pedro' },
        { name: 'Campos do Jordão' },
        { name: 'Bauru' },
        { name: 'Campinas' },
        { name: 'Jundiaí' },
        { name: 'Piracicaba' },
        { name: 'Presidente Prudente' },
        { name: 'Ribeirão Preto' },
        { name: 'São José do Rio Preto' },
        { name: 'São José dos Campos' },
        { name: 'Sorocaba' }
      ];
    }
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
      type: $('[name=type]').val(),
      category: $('[name=category]').val(),
      modality: $('[name=modality]').val(),
      units: $('[name=units]').val()
    });

    // Clear Form
    $('[name=title]').val('');
    $('[name=link]').val('');
    $('[name=description]').val('');
    $('.fr-view').html('')
    $('[name=units]').val('');
    $('[name=units]').dropdown('clear');

    // Feedback to the user
    $('html, body').animate({ scrollTop: 0 }, 'fast');
    $('#flashMessage').fadeIn();
     setTimeout(function () {
        $('#flashMessage').fadeOut();
    }, 2000);


  },
  'click #closeFlashMessage': function(event) {
    $('#flashMessage').hide();
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
  },
  gradCourses: function() {
    return Courses.find({type: 'Graduação'}, {sort: {category: 1, modality: -1, title: 1}}).fetch();
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
    return Units.find({},{sort: {name: 1 }}).fetch();
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

  'change input[name=title]': function(event) {

    Courses.update(this.course._id, {
      $set: { title: $(event.target).val() },
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

  'click .course-description-save-button': function(event) {

    let newDescription = $(event.target).closest('.course-description-modal').find('.course-description').val();
    console.log(newDescription);

    Courses.update(this.course._id, {
      $set: { description: newDescription },
    }, function(e,s) {
      if(!e)
        console.log("success = "+s);
      else
        console.log("e = "+e);
    });

  },

  'click .course-description-toggle-froala': function(event) {

    // Select the course description element
    courseDescription = $(event.target).closest('.course-description-modal').find('.course-description');
    courseDescriptionFroala = $(event.target).closest('.course-description-modal').find('.fr-wrapper');

    // Toggles the Froala Editor
    if( $(courseDescriptionFroala).length == 0) {
      $(courseDescription).froalaEditor();
    } else {
      $(courseDescription).froalaEditor('destroy');
    }
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

changeUnitName = function(selector) {
  document.querySelectorAll(selector).forEach(function(v,i,a){
    if (v.textContent == 'Santo Amaro' || v.textContent == 'Águas de São Pedro' || v.textContent == 'Campos do Jordão') {
      v.textContent = 'Centro Universitário SENAC - '+v.textContent;
    }
  });
}

validateCPF = function(cpf) {
  cpf = cpf.replace(/[^\d]+/g,'');
  if(cpf == '') return false;
  // Elimina CPFs invalidos conhecidos
  if (cpf.length != 11 ||
      cpf == "00000000000" ||
      cpf == "11111111111" ||
      cpf == "22222222222" ||
      cpf == "33333333333" ||
      cpf == "44444444444" ||
      cpf == "55555555555" ||
      cpf == "66666666666" ||
      cpf == "77777777777" ||
      cpf == "88888888888" ||
      cpf == "99999999999")
          return false;
  // Valida 1o digito
  add = 0;
  for (i=0; i < 9; i ++)
      add += parseInt(cpf.charAt(i)) * (10 - i);
      rev = 11 - (add % 11);
      if (rev == 10 || rev == 11)
          rev = 0;
      if (rev != parseInt(cpf.charAt(9)))
          return false;
  // Valida 2o digito
  add = 0;
  for (i = 0; i < 10; i ++)
      add += parseInt(cpf.charAt(i)) * (11 - i);
  rev = 11 - (add % 11);
  if (rev == 10 || rev == 11)
      rev = 0;
  if (rev != parseInt(cpf.charAt(10)))
      return false;
  return true;
}
