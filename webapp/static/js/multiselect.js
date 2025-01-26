$(document).ready(function(){

    $('.filter-box-multi-select').multiselect({
        includeSelectAllOption: true,
        selectAllText: 'Select All',
        selectAllValue: '0',
        selectAllNumber: false,
        enableClickableOptGroups: true,
        enableFiltering: true,
        filterPlaceholder: 'Type to search..',
        enableCaseInsensitiveFiltering: true,
        // allSelectedText: 'All',
        // nonSelectedText: 'None',
        buttonText: function(options){
            var maxLength = 40;
            var text = '';
            var numberOfOptions = $(options.context).children('option').length;
            if (options.length === 0) {
                return 'None';
            } else if(options.length == numberOfOptions){
                return 'All';
            } else {
                $.each(options,function(key,value){
                    text += $(value).text() + ', ';
                });
                text = text.slice(0, -2);
                if(text.length > maxLength){ 
                    return options.length.toString() + ' selected';
                } else {
                    return text;
                }
            }
        }
    });

    $('.filter-box-multi-select').multiselect('selectAll', false);
    $('.filter-box-multi-select').multiselect('updateButtonText');

    $('.filter-data').show();

});