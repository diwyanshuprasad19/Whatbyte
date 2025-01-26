var userPlaceList = [];
var selectedPlaceList = [];
var locationHierarchy = ["state", "district", "taluk", "place"];

var userPlaceTree = {};
var placeStates = {};
var placeDistricts = {};
var placeTaluks = {};
var placeFacilities = {};

function generateSelectedPlaceTree() {
    userPlaceTree['states'] = {};
    placeStates = {};
    placeDistricts = {};
    placeTaluks = {};
    placeFacilities = {};
    selectedPlaceList.forEach(function(place) {
        if (typeof(placeStates[place.state]) === "undefined") {
            placeStates[place.state] = {
                "value": place.state,
                "name": place.state
            };
        }
        if (typeof(placeDistricts[place.district]) === "undefined") {
            placeDistricts[place.district] = {
                "value": place.district,
                "name": place.district
            };
        }
        if (typeof(placeTaluks[place.taluk]) === "undefined") {
            placeTaluks[place.taluk] = {
                "value": place.taluk,
                "name": place.taluk
            };
        }
        placeFacilities[place.id] = {
            "value": place.id,
            "name": place.name
        };
        if (typeof(userPlaceTree['states'][place.state]) === "undefined") {
            userPlaceTree['states'][place.state] = {};
        }
        if (typeof(userPlaceTree['states'][place.state][place.district]) === "undefined") {
            userPlaceTree['states'][place.state][place.district] = {};
        }
        if (typeof(userPlaceTree['states'][place.state][place.district][place.taluk]) === "undefined") {
            userPlaceTree['states'][place.state][place.district][place.taluk] = [];
        }
        userPlaceTree['states'][place.state][place.district][place.taluk].push(place);
    });
}

function setHeaderFilters(filterLevel) {
    if (!filterLevel) {
        locationHierarchy.forEach(function(location) {
            populateLocationFilter(location);
        });
    } else {
        var locationIndex = locationHierarchy.indexOf(filterLevel);
        var locationsToBeUpdated = [];
        for(i = locationIndex + 1; i < locationHierarchy.length; i++) {
            locationsToBeUpdated.push(locationHierarchy[i]);
        }
        locationsToBeUpdated.forEach(function(location) {
            populateLocationFilter(location);
        });
    }
}

function populateLocationFilter(location) {
    var options = '';
    var places = [];
    switch(location) {
        case "state":
            places = Object.values(placeStates);
            break;
        case "district":
            places = Object.values(placeDistricts);
            break;
        case "taluk":
            places = Object.values(placeTaluks);
            break;
        case "place":
            places = Object.values(placeFacilities);
            break;
    }
    var selectOptions = [];
    places.forEach(function(location) {
        selectOptions.push({"value": location['value'], "label": location['name'], "selected": true});
    });
    $('#'+ location + '-selector').multiselect('setOptions', {
        onChange: function(option, checked, selected) {
            var location = $(option).parent().attr('filter-level');
            changeHeaderFilters(location);
        },
        onSelectAll: function() {
            console.log($(this));
            changeHeaderFilters(location);
        },
        onDeselectAll: function() {
            console.log($(this));
            changeHeaderFilters(location);
        }
    });
    $('#'+ location + '-selector').multiselect('dataprovider', selectOptions);
    $('#'+ location + '-selector').multiselect('rebuild');
    $('#'+ location + '-selector').multiselect('refresh');
    $('#'+ location + '-selector').multiselect('selectAll', true);
    $('#'+ location + '-selector').multiselect('updateButtonText');

}

function changeHeaderFilters(location) {
    setSelectedPlaces(location);
    generateSelectedPlaceTree();
    setHeaderFilters(location);
}

function setSelectedPlaces(location) {

    var locationsToBeMatched = [];
    var locationIndex = locationHierarchy.indexOf(location);
    var locationsToBeMatched = [];
    for(i = locationIndex; i >= 0; i--) {
        locationsToBeMatched.push(locationHierarchy[i]);
    }

    selectedPlaceList = [];
    userPlaceList.forEach(function(place) {
        var matchedLocations = 0;
        locationsToBeMatched.forEach(function(filterLevel) {
            var objectAttr = filterLevel == "place" ? "id" : filterLevel;
            var valuesList = $('#' + filterLevel + '-selector').val();
            valuesList = valuesList ? valuesList : [];
            if(valuesList.indexOf(place[objectAttr].toString()) !== -1) {
                matchedLocations++;
            }
        });
        if (matchedLocations == locationsToBeMatched.length) {
            selectedPlaceList.push(place);
        }
    });
}

function getAssociatedPlaces(callback) {
    $('#page-wrapper').mask("Loading...");
    callAjax(window.location.origin + '/website/places/', "GET", {}, function(response) {
        if(response['success']){
            userPlaceList = response['data']['response'];
            $.extend(true, selectedPlaceList, userPlaceList);
            generateSelectedPlaceTree();
            setHeaderFilters(false);
        } else {
            alert("Something went wrong.");
        }
        callback();
    });
}

$(document).ready(function() {

    $('#daterange').val(moment().subtract(30, 'days').format('DD MMM YYYY') + ' - ' + moment().format('DD MMM YYYY'));
    $('#daterange').daterangepicker({
        timePicker: false,
        opens: 'left',
        maxDate: moment(),
        format: 'DD MMM YYYY',
        startDate: moment().subtract(30, 'days'),
        endDate: moment(),
        ranges: {
           'Today': [moment().startOf('day'), moment()],
           'Yesterday': [moment().subtract(1, 'days').startOf('day'), moment().subtract(1, 'days')],
           'Last 7 Days': [moment().subtract(7, 'days'), moment()],
           'Last 30 Days': [moment().subtract(30, 'days'), moment()],
           'This Month': [moment().startOf('month'), moment().endOf('month')],
           'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        }
    });
    $('.daterangepicker_start_input, .daterangepicker_end_input').hide();

    // $('.header-filter-select').on('change', function() {
    //     var level = $(this).attr("filter-level");
    //     changeHeaderFilters(level);
    // });
});
