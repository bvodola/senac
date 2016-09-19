// ==============
// Client Methods
// ==============

setQuery = function(selector="") {

	// Sets the initial value for the query object
	let query = {};

	// Gets the values for each input element
	$(selector+' input[type=text], '+selector+' input[type=email], '+selector+' input[type=number], '+selector+' input[type=date], '+selector+' select').each(function() {
		// First, verify if the Input is part of an array
		if($(this).attr('name').substr(-2) == '[]') {

			if(typeof query[$(this).attr('name').split("[]")[0]] == 'undefined') {
				query[$(this).attr('name').split("[]")[0]] = [];
			}
			
			query[$(this).attr('name').split("[]")[0]].push($(this).val());
		}

		else {
			query[$(this).attr('name')] = $(this).val();
		}
	});

	// Gets the values for each checkbox element
	$(selector+' input[type=checkbox]').each(function() {

		// First, verify if the Checkbox is part of an array
		if($(this).attr('name').substr(-2) == '[]') {
			if($(this).prop('checked') == true) {
				if(typeof query[$(this).attr('name').split("[]")[0]] == 'undefined') {
					query[$(this).attr('name').split("[]")[0]] = [];
				}
				query[$(this).attr('name').split("[]")[0]].push($(this).val());
			}
		}

		// If the checkbox is not part of an array
		else {
			if($(this).prop('checked') == true) {
				query[$(this).attr('name')] = true;
			} else {
				query[$(this).attr('name')] = false;
			}
		}
	});

	// Gets the values for each textarea element
	$(selector+' textarea').each(function() {
		query[$(this).attr('name')] = $(this).val();
	});

	return query;
}

clearFields = function(selector="") {

	// Clears input elements
	$(selector+' input[type=text], '+selector+' input[type=email], '+selector+' input[type=number], '+selector+' input[type=date], '+selector+' select').each(function() {
		$(this).val('');

		// Semantic UI specific code
		if($(this).is('select')) {
			$(this).dropdown('clear');
		}

	});

	// Clear checkbox elements
	$(selector+' input[type=checkbox]').each(function() {
		($this).prop('checked', false);
	});

	// Clear textarea elements
	$('textarea').each(function() {
		$(this).val('');
	});
}

// ==============
// Client Helpers
// ==============

UI.registerHelper('loop', function(count){
	var countArr = [];
	for (var i=0; i<count; i++){
		countArr.push({ index: i });
	}

	return countArr;
});