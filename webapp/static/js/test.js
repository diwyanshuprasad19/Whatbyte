$(document).ready(function(){

    function setData(){

        var all_filled = true;
        $('.calc-data').each(function(){
            if($(this).val() == ""){
                all_filled = false;
            }
        });

        if (all_filled == false){
            return false;
        }

        var h1 = parseFloat($('#h1').val());
        var b1 = parseFloat($('#b1').val());
        var l1 = parseFloat($('#l1').val());

        var h = parseFloat($('#h').val());
        var b = parseFloat($('#b').val());
        var l = parseFloat($('#l').val());

        var rho_t = parseFloat($('#rho-t').val());

        var vol_t = (2 * h1 * ( (b/2) - (b1/2) ) * l) + (2 * h1 * ( (l/2) - (l1/2) ) * b1)
        $('.vol-t').html(vol_t);
        var weight_t = vol_t * rho_t;
        $('.weight-t').html(weight_t);

        var vol_h = (h * b * l) + (h1 * b1 *l1);
        $('.vol-h').html(vol_h);
        var weight_h = vol_h * parseFloat($('#rho-h').html());
        $('.weight-h').html(weight_h);
        var weight_total = weight_t + weight_h;
        $('.weight-total').html(weight_total);
    }


    $('input').on('input', function() {
        this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    });

    $('.calc-data').on('change', function(){
        setData();
    })
});
