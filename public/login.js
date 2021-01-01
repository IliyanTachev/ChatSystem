// jQuery(function() {
//     $("#loginForm").submit(function(e) {
//         e.preventDefault();
        
//         $.ajax({
//                 url: $(this).attr('action'),
//                type: 'post',
//                data:  $(this).serialize(),
//                success: function(data){
//                     let loginProcessStatus = data.status;
//                     if(loginProcessStatus){ // error
//                         alert("ERROR: " + data.message);
//                     }
//                 }
//         }); 
//     });
// });