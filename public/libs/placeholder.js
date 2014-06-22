//$('input').focus(function() {
//    
//    alert ( "AA" );
//    
//    if ( ! $(this).hasAttr("placeholder") )
//        return false;
//    
//    
//    var input = $(this);
//    if (input.val() == input.attr('placeholder')) {
//        input.val('');
//        input.removeClass('placeholder');
//    }
//}).blur(function() {
//    
//    if ( ! $(this).hasAttr("placeholder") )
//        return false;
//    
//    var input = $(this);
//    if (input.val() == '' || input.val() == input.attr('placeholder')) {
//        input.addClass('placeholder');
//        input.val(input.attr('placeholder'));
//    }
//}).blur().parents('form').submit(function() {
//
//    if ( ! $(this).hasAttr("placeholder") )
//        return false;
//
//    $(this).find('[placeholder]').each(function() {
//        var input = $(this);
//        if (input.val() == input.attr('placeholder')) {
//            input.val('');
//        }
//    })
//});