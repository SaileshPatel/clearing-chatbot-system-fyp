$(function(){
    // grab the form
    var form = $('#single-upload-form');
    form.submit(function(e){
        // get the raw element & check if any constraints are not met
        if(form[0].checkValidity() === false){
            // stop the form from being submitted
            e.preventDefault();
            e.stopPropagation();
        }
        form.addClass('was-validated');
    })

    // check the ucas code input
    $('#ucas-code').change(function(){
        // if the text does not match the regex
        if(!($(this).val().match(/[A-Z][0-9][0-9][0-9]/))){
            // add '.was-validated' class to show '.invalid-feedback' class divs
            $(this).parent().addClass("was-validated");
        }
    })
})